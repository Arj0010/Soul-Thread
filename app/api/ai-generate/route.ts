import { NextRequest, NextResponse } from 'next/server'
import { generateNewsletterWithOpenAI, generateNewsletterStream } from '@/lib/openaiGenerate'
import { generateNewsletterWithTemplate } from '@/lib/templateGenerate'
import { supabase } from '@/lib/supabaseClient'
import { fetchAllNewsSources } from '@/lib/newsFetcher'

export async function POST(request: NextRequest) {
  try {
    const { userId, topic, useRealTimeData = true, stream = false, useTemplate = false } = await request.json()

    // Check if we should use template-based generation
    const shouldUseTemplate = useTemplate || !process.env.OPENAI_API_KEY

    // Get user's voice profile
    const { data: voiceProfiles, error: voiceError } = await supabase
      .from('voicedna')
      .select('data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (voiceError) {
      console.warn('Error loading voice profile, using defaults:', voiceError.message)
    }

    // Use voice profile data or null if not found
    const voiceData = (voiceProfiles && voiceProfiles.length > 0) ? voiceProfiles[0].data : null

    let newsItems: any[] = []

    if (useRealTimeData) {
      try {
        // Fetch real-time data
        console.log('Fetching real-time news...')
        const newsData = await fetchAllNewsSources()
        let sources = newsData.allSources

        console.log(`Fetched ${sources.length} news items from all sources`)

        // Filter by topic if specified
        if (topic) {
          sources = sources.filter(item =>
            item.title.toLowerCase().includes(topic.toLowerCase()) ||
            item.summary.toLowerCase().includes(topic.toLowerCase())
          )
          console.log(`After filtering by topic "${topic}": ${sources.length} items`)
        }

        newsItems = sources.map(source => ({
          title: source.title,
          summary: source.summary,
          url: source.url,
          source: source.source,
          publishedAt: source.publishedAt
        }))

        // If no news items found, fall back to trends data
        if (newsItems.length === 0) {
          console.log('No real-time news found, falling back to trends data')
          const trendsData = await import('@/data/trends.json')
          newsItems = trendsData.default.slice(0, 5).map(trend => ({
            title: trend.title,
            summary: trend.summary,
            source: 'Curated Trends'
          }))
        }
      } catch (error) {
        console.error('Error fetching real-time data, using trends fallback:', error)
        const trendsData = await import('@/data/trends.json')
        newsItems = trendsData.default.slice(0, 5).map(trend => ({
          title: trend.title,
          summary: trend.summary,
          source: 'Curated Trends'
        }))
      }
    } else {
      // Use mock data
      const trendsData = await import('@/data/trends.json')
      newsItems = trendsData.default.slice(0, 8).map(trend => ({
        title: trend.title,
        summary: trend.summary,
        source: 'Curated Trends'
      }))
    }

    console.log(`Final news items count: ${newsItems.length}`)

    // Generate newsletter
    let draft: string
    let aiGenerated = false

    if (shouldUseTemplate) {
      // Use template-based generation (no OpenAI needed)
      console.log('Using template-based generation')
      draft = generateNewsletterWithTemplate(voiceData, newsItems)
      aiGenerated = false
    } else {
      // Use OpenAI generation
      try {
        if (stream) {
          // Return streaming response
          const stream = await generateNewsletterStream(voiceData, newsItems)

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Transfer-Encoding': 'chunked',
            },
          })
        } else {
          console.log('Using OpenAI generation')
          draft = await generateNewsletterWithOpenAI(voiceData, newsItems)
          aiGenerated = true
        }
      } catch (openaiError: any) {
        // If OpenAI fails (quota exceeded, etc), fallback to template
        console.warn('OpenAI failed, falling back to template:', openaiError.message)
        draft = generateNewsletterWithTemplate(voiceData, newsItems)
        aiGenerated = false
      }
    }

    return NextResponse.json({
      draft,
      generatedAt: new Date().toISOString(),
      dataSource: useRealTimeData ? 'real-time' : 'mock',
      topic: topic || 'general',
      aiGenerated,
      templateGenerated: !aiGenerated,
      newsItemCount: newsItems.length
    })
  } catch (error: any) {
    console.error('Error generating AI newsletter:', error)
    return NextResponse.json({
      error: `Failed to generate newsletter: ${error.message || error}`
    }, { status: 500 })
  }
}
