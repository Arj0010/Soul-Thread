import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { fetchAllNewsSources } from '@/lib/newsFetcher'

// LinkedIn post generation with OpenAI
async function generateLinkedInPostWithAI(voiceData: any, newsItems: any[], postType: string, topic: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  // Build the prompt based on post type and voice profile
  const voiceContext = voiceData ? `
Writing Style Profile:
- Topics: ${voiceData.topics || 'general'}
- Tone: ${voiceData.tone || 'professional'}
- Reader Feeling: ${voiceData.feeling || 'informed'}
${voiceData.analysis ? `
- Average Sentence Length: ${voiceData.analysis.avgSentenceLength} words
- Sentiment: ${voiceData.analysis.sentiment}
- Top Keywords: ${voiceData.analysis.keywords?.join(', ')}
` : ''}
` : 'Use a professional, engaging LinkedIn tone.'

  const postTypeInstructions: { [key: string]: string } = {
    'professional': 'Write a professional insight post sharing expertise and valuable industry knowledge.',
    'thought-leadership': 'Write a thought leadership post that challenges conventional thinking and offers a unique perspective.',
    'story': 'Write a personal story post that shares a lesson learned or experience that others can relate to.',
    'tips': 'Write a tips and advice post with actionable takeaways formatted as a list or numbered points.',
    'announcement': 'Write an announcement post that shares news or updates in an exciting, engaging way.',
    'engagement': 'Write an engagement post designed to spark conversation with a thought-provoking question or poll.'
  }

  const newsContext = newsItems.length > 0 ? `
Recent News/Trends:
${newsItems.slice(0, 3).map((item, i) => `${i + 1}. ${item.title}: ${item.summary.substring(0, 200)}`).join('\n')}
` : ''

  const prompt = `You are a LinkedIn content expert. Generate a compelling LinkedIn post based on the following:

${postTypeInstructions[postType] || postTypeInstructions['professional']}

${topic ? `Topic Focus: ${topic}` : ''}

${newsContext}

${voiceContext}

Requirements:
- Length: 1,300-2,000 characters (ideal for LinkedIn engagement)
- Start with a STRONG hook in the first line
- Use short paragraphs with line breaks for readability
- Include 2-3 relevant emojis (but don't overdo it)
- End with a call-to-action (question, invitation to comment, or next steps)
- Add 3-5 relevant hashtags at the end
- Make it authentic, not salesy
- Match the voice profile's tone and style

Generate the LinkedIn post now:`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert LinkedIn content creator who writes engaging, authentic posts that drive meaningful engagement.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message)
    }

    return data.choices[0].message.content.trim()
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw error
  }
}

// Fallback template-based generation
function generateLinkedInPostTemplate(newsItems: any[], postType: string, topic: string) {
  const item = newsItems[0] || {
    title: 'The Future of Technology',
    summary: 'Technology continues to evolve at an unprecedented pace, bringing new opportunities and challenges.'
  }

  const templates: { [key: string]: string } = {
    'professional': `${item.title} 💡

I've been following this development closely, and here's what it means for professionals in our industry:

${item.summary}

This represents a significant shift in how we approach our work. The key takeaway? Adaptability and continuous learning are more important than ever.

Three things to consider:
1. Stay informed about emerging trends
2. Invest in upskilling and professional development
3. Network with peers who are navigating similar changes

What's your take on this? How are you adapting to these changes?

#${topic || 'Technology'} #ProfessionalDevelopment #Innovation #CareerGrowth #Industry`,

    'thought-leadership': `Unpopular opinion: ${item.title.toLowerCase()} isn't the revolution everyone thinks it is. 🤔

Here's why:

${item.summary}

While everyone's jumping on the bandwagon, we need to ask harder questions:
• What problems does this actually solve?
• Who gets left behind in this transition?
• Are we optimizing for hype or real value?

The truth is, sustainable innovation happens gradually, not overnight. The real leaders aren't the ones making the most noise—they're the ones doing the hard work of implementation.

Agree or disagree? Let's have a real conversation in the comments.

#${topic || 'ThoughtLeadership'} #Innovation #CriticalThinking #Leadership #Industry`,

    'story': `Three years ago, I made a decision that changed everything. 📖

I was faced with ${item.title.toLowerCase()}, and honestly, I wasn't sure if I was ready.

${item.summary}

Looking back, here's what I learned:

1. Growth happens outside your comfort zone
2. You don't need to have all the answers before you start
3. The right time is now

The most valuable lesson? Every expert was once a beginner who didn't give up.

If you're facing a similar crossroads, my advice: trust the process. The path becomes clearer as you walk it.

What's a decision that changed your trajectory? I'd love to hear your story.

#${topic || 'CareerJourney'} #PersonalGrowth #Lessons #ProfessionalDevelopment #Inspiration`,

    'tips': `5 game-changing insights from ${item.title} 💡

${item.summary}

Here's what you need to know:

1️⃣ Start with why: Understand the core problem before jumping to solutions

2️⃣ Stay curious: The learning never stops in this field

3️⃣ Build in public: Share your journey and learn from others

4️⃣ Embrace failure: It's data, not defeat

5️⃣ Focus on value: Tools change, but value creation is timeless

Bonus tip: Invest 30 minutes daily in learning something new. Compound interest works for skills too.

Which of these resonates most with you? Drop a number in the comments!

#${topic || 'Tips'} #ProfessionalDevelopment #CareerAdvice #Growth #Success`,

    'announcement': `Exciting news! 🎉

${item.title}

${item.summary}

This is exactly the kind of development our industry needs right now. Here's why I'm excited:

✅ It solves a real problem
✅ It's accessible and practical
✅ It has the potential to create meaningful impact

I'll be sharing more insights as this evolves. Stay tuned!

What are your initial thoughts? Comment below!

#${topic || 'News'} #Innovation #Industry #Announcement #Exciting`,

    'engagement': `Question for my network: 🤔

Given ${item.title.toLowerCase()}, how do you see this impacting our industry in the next 12 months?

${item.summary}

I'm seeing three possible scenarios:

A) Rapid adoption and transformation
B) Gradual integration with existing systems
C) Initial resistance followed by eventual acceptance

What's your prediction? Drop your vote in the comments:
Type A, B, or C and tell me why.

Bonus points: What should we be doing NOW to prepare?

Let's crowdsource some wisdom here. Looking forward to reading your perspectives!

#${topic || 'Discussion'} #Industry #Future #Trends #NetworkingWisdom`
  }

  return templates[postType] || templates['professional']
}

export async function POST(request: NextRequest) {
  try {
    const { userId, topic, postType = 'professional', useRealTimeData = true } = await request.json()

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

    const voiceData = (voiceProfiles && voiceProfiles.length > 0) ? voiceProfiles[0].data : null

    let newsItems: any[] = []

    if (useRealTimeData) {
      // Fetch real-time data
      const newsData = await fetchAllNewsSources()
      let sources = newsData.allSources

      // Filter by topic if specified
      if (topic) {
        sources = sources.filter(item =>
          item.title.toLowerCase().includes(topic.toLowerCase()) ||
          item.summary.toLowerCase().includes(topic.toLowerCase())
        )
      }

      newsItems = sources.map(source => ({
        title: source.title,
        summary: source.summary,
        url: source.url,
        source: source.source
      }))
    } else {
      // Use trending topics data
      const trendsData = await import('@/data/trends.json')
      let trends = trendsData.default

      // Filter by topic if specified
      if (topic) {
        trends = trends.filter(trend =>
          trend.title.toLowerCase().includes(topic.toLowerCase()) ||
          trend.summary.toLowerCase().includes(topic.toLowerCase())
        )
      }

      newsItems = trends.map(trend => ({
        title: trend.title,
        summary: trend.summary
      }))
    }

    let post: string

    // Try AI generation first if API key is available
    if (process.env.OPENAI_API_KEY) {
      try {
        post = await generateLinkedInPostWithAI(voiceData, newsItems, postType, topic || 'general')
      } catch (aiError) {
        console.error('AI generation failed, falling back to template:', aiError)
        post = generateLinkedInPostTemplate(newsItems, postType, topic || 'Technology')
      }
    } else {
      post = generateLinkedInPostTemplate(newsItems, postType, topic || 'Technology')
    }

    return NextResponse.json({
      post,
      generatedAt: new Date().toISOString(),
      dataSource: useRealTimeData ? 'real-time' : 'trending',
      topic: topic || 'general',
      postType,
      aiGenerated: !!process.env.OPENAI_API_KEY
    })
  } catch (error) {
    console.error('Error generating LinkedIn post:', error)
    return NextResponse.json({ error: 'Failed to generate LinkedIn post' }, { status: 500 })
  }
}
