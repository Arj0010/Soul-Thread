// Newsletter generation function with OpenAI integration
import { generateNewsletterWithOpenAI } from './openaiGenerate'

export async function generateDraft(voiceProfile: any, trends: any[]) {
  // If OpenAI API key is available, use real generation
  if (process.env.OPENAI_API_KEY) {
    try {
      const newsItems = trends.map(trend => ({
        title: trend.title,
        summary: trend.summary,
        source: 'Trends Data'
      }))
      
      return await generateNewsletterWithOpenAI(voiceProfile, newsItems)
    } catch (error) {
      console.error('OpenAI generation failed, falling back to mock:', error)
      // Fall through to mock generation
    }
  }
  
  // Mock generation based on voice profile and trends
  const topic = voiceProfile?.topics || 'technology'
  const tone = voiceProfile?.tone || 'professional'
  const feeling = voiceProfile?.feeling || 'informed'
  
  // Generate personalized newsletter based on voice profile
  let greeting = 'Hello!'
  let closing = 'Best regards'
  
  if (tone === 'casual') {
    greeting = 'Hey there! 👋'
    closing = 'Talk soon!'
  } else if (tone === 'friendly') {
    greeting = 'Hi friend!'
    closing = 'Take care!'
  } else if (tone === 'authoritative') {
    greeting = 'Greetings,'
    closing = 'Regards'
  }
  
  return `${greeting}

This week in ${trends[0].title}: ${trends[0].summary}

${trends[1] ? `Also catching my attention: ${trends[1].title} - ${trends[1].summary}` : ''}

${trends[2] ? `And finally, ${trends[2].title}: ${trends[2].summary}` : ''}

${tone === 'casual' ? "What do you think about these trends? I'd love to hear your take!" : 
  tone === 'friendly' ? "I hope this gives you some food for thought!" :
  'These developments represent significant opportunities in the market.'}

Stay ${feeling}! ✨

${closing}`
}
