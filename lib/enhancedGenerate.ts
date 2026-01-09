// Enhanced newsletter generation with real-time data and OpenAI integration
import { fetchAllNewsSources } from './newsFetcher'
import { generateNewsletterWithOpenAI } from './openaiGenerate'

export async function generateEnhancedDraft(voiceProfile: any | null | undefined, customSources?: any[]) {
  // Fetch real-time data
  const newsData = await fetchAllNewsSources()
  
  // Use custom sources if provided, otherwise use fetched data
  const sources = customSources || newsData.allSources
  
  // Try OpenAI generation first if API key is available
  if (process.env.OPENAI_API_KEY) {
    try {
      const newsItems = sources.map(source => ({
        title: source.title,
        summary: source.summary,
        url: source.url,
        source: source.source,
        publishedAt: source.publishedAt
      }))
      
      return await generateNewsletterWithOpenAI(voiceProfile, newsItems)
    } catch (error) {
      console.error('OpenAI generation failed, falling back to template generation:', error)
      // Fall through to template generation
    }
  }
  
  // Voice profile settings
  const topics = voiceProfile?.topics || 'technology'
  const tone = voiceProfile?.tone || 'professional'
  const feeling = voiceProfile?.feeling || 'informed'
  
  // Personalized greeting and closing
  let greeting = 'Hello!'
  let closing = 'Best regards'
  let callToAction = 'These developments represent significant opportunities in the market.'
  
  if (tone === 'casual') {
    greeting = 'Hey there! 👋'
    closing = 'Talk soon!'
    callToAction = "What do you think about these trends? I'd love to hear your take!"
  } else if (tone === 'friendly') {
    greeting = 'Hi friend!'
    closing = 'Take care!'
    callToAction = "I hope this gives you some food for thought!"
  } else if (tone === 'authoritative') {
    greeting = 'Greetings,'
    closing = 'Regards'
    callToAction = 'These developments represent significant opportunities in the market.'
  }
  
  // Group sources by category
  const techNews = sources.filter(item => 
    item.title.toLowerCase().includes('ai') || 
    item.title.toLowerCase().includes('tech') ||
    item.title.toLowerCase().includes('software') ||
    item.source === 'Hacker News'
  )
  
  const businessNews = sources.filter(item => 
    item.title.toLowerCase().includes('business') ||
    item.title.toLowerCase().includes('startup') ||
    item.title.toLowerCase().includes('funding') ||
    item.title.toLowerCase().includes('investment')
  )
  
  const innovationNews = sources.filter(item => 
    item.title.toLowerCase().includes('innovation') ||
    item.title.toLowerCase().includes('breakthrough') ||
    item.title.toLowerCase().includes('research') ||
    item.source === 'GitHub'
  )
  
  // Generate comprehensive newsletter
  let newsletter = `${greeting}\n\n`
  
  // Add current date and context
  newsletter += `Here's what's happening in the world of ${topics} this week:\n\n`
  
  // Technology Section
  if (techNews.length > 0) {
    newsletter += `## 🚀 Technology Highlights\n\n`
    techNews.slice(0, 3).forEach((item, index) => {
      newsletter += `**${index + 1}. ${item.title}**\n`
      newsletter += `${item.summary}\n`
      if (item.url) newsletter += `[Read more](${item.url})\n\n`
    })
  }
  
  // Business Section
  if (businessNews.length > 0) {
    newsletter += `## 💼 Business & Startups\n\n`
    businessNews.slice(0, 2).forEach((item, index) => {
      newsletter += `**${index + 1}. ${item.title}**\n`
      newsletter += `${item.summary}\n`
      if (item.url) newsletter += `[Read more](${item.url})\n\n`
    })
  }
  
  // Innovation Section
  if (innovationNews.length > 0) {
    newsletter += `## 🔬 Innovation & Research\n\n`
    innovationNews.slice(0, 2).forEach((item, index) => {
      newsletter += `**${index + 1}. ${item.title}**\n`
      newsletter += `${item.summary}\n`
      if (item.url) newsletter += `[Read more](${item.url})\n\n`
    })
  }
  
  // Trending Topics Section
  newsletter += `## 📈 Trending Topics\n\n`
  const trendingTopics = sources.slice(0, 5).map(item => item.title)
  trendingTopics.forEach((topic, index) => {
    newsletter += `${index + 1}. ${topic}\n`
  })
  newsletter += `\n`
  
  // Community Highlights (Reddit/Hacker News)
  const communityItems = sources.filter(item => 
    item.source === 'Reddit' || item.source === 'Hacker News'
  ).slice(0, 3)
  
  if (communityItems.length > 0) {
    newsletter += `## 💬 Community Highlights\n\n`
    communityItems.forEach((item, index) => {
      newsletter += `**${item.title}**\n`
      newsletter += `*${item.source}* - ${item.score || item.comments} ${item.score ? 'upvotes' : 'comments'}\n\n`
    })
  }
  
  // Developer Corner (GitHub trends)
  const devItems = sources.filter(item => item.source === 'GitHub').slice(0, 3)
  if (devItems.length > 0) {
    newsletter += `## 👨‍💻 Developer Corner\n\n`
    devItems.forEach((item, index) => {
      newsletter += `**${item.title}**\n`
      newsletter += `${item.summary}\n`
      newsletter += `⭐ ${item.stars} stars | ${item.language}\n\n`
    })
  }
  
  // Personal commentary based on voice profile
  newsletter += `## 💭 My Take\n\n`
  newsletter += `${callToAction}\n\n`
  
  // Add relevant insights based on topics
  if (topics.toLowerCase().includes('ai')) {
    newsletter += `The AI landscape continues to evolve rapidly, with new breakthroughs happening weekly. It's fascinating to see how these technologies are being applied across different industries.\n\n`
  }
  
  if (topics.toLowerCase().includes('startup')) {
    newsletter += `The startup ecosystem remains vibrant, with innovative solutions emerging to solve real-world problems. The funding landscape shows continued interest in disruptive technologies.\n\n`
  }
  
  // Closing
  newsletter += `Stay ${feeling}! ✨\n\n`
  newsletter += `${closing}\n\n`
  
  // Add newsletter metadata
  newsletter += `---\n`
  newsletter += `*This newsletter was generated on ${new Date().toLocaleDateString()} using real-time data from multiple sources.*\n`
  newsletter += `*Sources: ${[...new Set(sources.map(s => s.source))].join(', ')}*`
  
  return newsletter
}

// Generate focused newsletter for specific topics
export async function generateTopicFocusedDraft(voiceProfile: any | null | undefined, topic: string) {
  const newsData = await fetchAllNewsSources()
  
  // Filter sources by topic
  const topicSources = newsData.allSources.filter(item => 
    item.title.toLowerCase().includes(topic.toLowerCase()) ||
    item.summary.toLowerCase().includes(topic.toLowerCase())
  )
  
  if (topicSources.length === 0) {
    return generateEnhancedDraft(voiceProfile)
  }
  
  return generateEnhancedDraft(voiceProfile, topicSources)
}
