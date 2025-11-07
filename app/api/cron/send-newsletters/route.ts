import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { sendBatchNewsletters, type EmailRecipient, type NewsletterEmailData } from '@/lib/emailService'
import { generateNewsletterWithTemplate } from '@/lib/templateGenerate'
import { generateNewsletterWithOpenAI } from '@/lib/openaiGenerate'
import { fetchPerplexityNews } from '@/lib/perplexityFetcher'
import { fetchAllNewsSources } from '@/lib/newsFetcher'

export const maxDuration = 300 // 5 minutes max execution time

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

    if (!process.env.CRON_SECRET || authHeader !== expectedAuth) {
      console.error('[Cron] Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Cron] ===== Starting daily newsletter send =====')
    const startTime = Date.now()

    // Get current hour in UTC
    const currentHour = new Date().getUTCHours()
    console.log(`[Cron] Current UTC hour: ${currentHour}`)

    // Get all users with email enabled who should receive newsletter at this hour
    const { data: users, error } = await supabase
      .from('email_preferences')
      .select('user_id, delivery_hour, timezone, topics, preferred_sources, use_ai_generation, max_items')
      .eq('email_enabled', true)
      .eq('email_frequency', 'daily')

    if (error) {
      console.error('[Cron] Error fetching users:', error)
      throw error
    }

    if (!users || users.length === 0) {
      console.log('[Cron] No users with email enabled')
      return NextResponse.json({
        success: true,
        message: 'No users to send to',
        totalUsers: 0,
        sent: 0
      })
    }

    console.log(`[Cron] Found ${users.length} users with email enabled`)

    // Filter users whose delivery time matches current hour
    // TODO: Implement proper timezone conversion
    // For now, using delivery_hour directly (assumes UTC)
    const usersToSendTo = users.filter(user => {
      return user.delivery_hour === currentHour
    })

    console.log(`[Cron] ${usersToSendTo.length} users scheduled for hour ${currentHour}`)

    if (usersToSendTo.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No users scheduled for hour ${currentHour}`,
        totalUsers: users.length,
        scheduledThisHour: 0,
        sent: 0
      })
    }

    // Generate newsletters for each user
    const newsletterMap = new Map<string, NewsletterEmailData>()
    const recipients: EmailRecipient[] = []
    let generationErrors = 0

    for (const userPref of usersToSendTo) {
      try {
        console.log(`[Cron] Generating newsletter for user: ${userPref.user_id}`)

        // Get user email from auth
        const { data: { user: authUser }, error: authError } = await supabase.auth.admin.getUserById(userPref.user_id)
        if (authError || !authUser?.email) {
          console.error(`[Cron] Cannot get email for user ${userPref.user_id}:`, authError)
          generationErrors++
          continue
        }

        // Get user's voice profile
        const { data: voiceProfiles } = await supabase
          .from('voicedna')
          .select('data')
          .eq('user_id', userPref.user_id)
          .order('created_at', { ascending: false })
          .limit(1)

        const voiceProfile = voiceProfiles && voiceProfiles.length > 0 ? voiceProfiles[0].data : null

        // Fetch news based on user preferences
        let newsItems: any[] = []
        const sources = userPref.preferred_sources || ['reddit', 'hackernews', 'github']
        const topics = Array.isArray(userPref.topics) ? userPref.topics : ['technology']
        const mainTopic = topics[0] || 'technology'

        console.log(`[Cron] Fetching news for topic: ${mainTopic}, sources:`, sources)

        // Try Perplexity first if in preferred sources
        if (sources.includes('perplexity') && process.env.PERPLEXITY_API_KEY) {
          try {
            const perplexityNews = await fetchPerplexityNews(mainTopic, userPref.max_items || 8)
            newsItems.push(...perplexityNews)
            console.log(`[Cron] Fetched ${perplexityNews.length} items from Perplexity`)
          } catch (error) {
            console.warn('[Cron] Perplexity fetch failed:', error)
          }
        }

        // Fallback to other sources if needed
        if (newsItems.length < (userPref.max_items || 8)) {
          try {
            const otherNews = await fetchAllNewsSources()
            newsItems.push(...otherNews.allSources)
            console.log(`[Cron] Fetched ${otherNews.allSources.length} items from other sources`)
          } catch (error) {
            console.warn('[Cron] Other sources fetch failed:', error)
          }
        }

        // Final fallback to trends.json
        if (newsItems.length === 0) {
          console.log('[Cron] Using trends.json fallback')
          const trendsData = await import('@/data/trends.json')
          newsItems = trendsData.default.slice(0, userPref.max_items || 8).map(trend => ({
            title: trend.title,
            summary: trend.summary,
            source: 'Curated Trends'
          }))
        }

        // Limit to max_items
        newsItems = newsItems.slice(0, userPref.max_items || 8)
        console.log(`[Cron] Final news count: ${newsItems.length}`)

        // Generate newsletter
        let content = ''
        let generationMethod: 'template' | 'ai' = 'template'

        if (userPref.use_ai_generation && process.env.OPENAI_API_KEY) {
          try {
            console.log('[Cron] Using AI generation')
            content = await generateNewsletterWithOpenAI(voiceProfile, newsItems)
            generationMethod = 'ai'
          } catch (error) {
            console.warn(`[Cron] OpenAI failed for user ${userPref.user_id}, using template:`, error)
            content = generateNewsletterWithTemplate(voiceProfile, newsItems)
          }
        } else {
          console.log('[Cron] Using template generation')
          content = generateNewsletterWithTemplate(voiceProfile, newsItems)
        }

        // Generate subject line from first news item
        const mainStory = newsItems[0]?.title || 'Latest Updates'
        const subject = `📰 ${mainStory.substring(0, 60)}${mainStory.length > 60 ? '...' : ''}`

        newsletterMap.set(userPref.user_id, {
          subject,
          content,
          newsItemCount: newsItems.length,
          generationMethod,
          dataSources: sources
        })

        recipients.push({
          userId: userPref.user_id,
          email: authUser.email,
          name: authUser.user_metadata?.name
        })

        console.log(`[Cron] Newsletter generated for ${authUser.email}`)

      } catch (error: any) {
        console.error(`[Cron] Error generating newsletter for user ${userPref.user_id}:`, error)
        generationErrors++
      }
    }

    console.log(`[Cron] Generated ${recipients.length} newsletters, ${generationErrors} errors`)

    if (recipients.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No newsletters to send (all generations failed)',
        totalUsers: usersToSendTo.length,
        generationErrors,
        sent: 0,
        failed: usersToSendTo.length
      })
    }

    // Send batch emails
    console.log('[Cron] Starting batch email send...')
    const results = await sendBatchNewsletters(recipients, newsletterMap)

    const duration = Date.now() - startTime
    console.log(`[Cron] ===== Newsletter send complete in ${duration}ms =====`)
    console.log(`[Cron] Results:`, results)

    return NextResponse.json({
      success: true,
      totalUsers: usersToSendTo.length,
      generated: recipients.length,
      generationErrors,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors.slice(0, 10), // Limit error messages
      durationMs: duration
    })

  } catch (error: any) {
    console.error('[Cron] Fatal error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send newsletters'
    }, { status: 500 })
  }
}

// Allow GET for testing purposes (won't work without proper auth)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Cron endpoint active. Use POST with Bearer token to trigger.',
    currentTime: new Date().toISOString(),
    currentHour: new Date().getUTCHours()
  })
}
