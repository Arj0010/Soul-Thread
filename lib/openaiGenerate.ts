// OpenAI-powered newsletter generation
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface VoiceProfile {
  topics?: string
  tone?: 'casual' | 'professional' | 'friendly' | 'authoritative'
  feeling?: string
}

export interface NewsItem {
  title: string
  summary: string
  url?: string
  source?: string
  publishedAt?: string
}

export async function generateNewsletterWithOpenAI(
  voiceProfile: VoiceProfile | null | undefined,
  newsItems: NewsItem[],
  template?: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const systemPrompt = createSystemPrompt(voiceProfile)
  const userPrompt = createUserPrompt(newsItems, template)

  try {
    console.log('Calling OpenAI API with model:', process.env.OPENAI_MODEL || 'gpt-4o-mini')
    console.log('System prompt length:', systemPrompt.length)
    console.log('User prompt length:', userPrompt.length)

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    console.log('OpenAI API response received')
    return completion.choices[0]?.message?.content || 'Failed to generate newsletter'
  } catch (error: any) {
    console.error('OpenAI API error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      status: error.status,
      error: error
    })
    throw new Error(`OpenAI Error: ${error.message || error}`)
  }
}

export async function generateNewsletterStream(
  voiceProfile: VoiceProfile | null | undefined,
  newsItems: NewsItem[],
  template?: string
): Promise<ReadableStream> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const systemPrompt = createSystemPrompt(voiceProfile)
  const userPrompt = createUserPrompt(newsItems, template)

  try {
    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    })

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              controller.enqueue(new TextEncoder().encode(content))
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })
  } catch (error) {
    console.error('OpenAI streaming error:', error)
    throw new Error('Failed to generate streaming newsletter')
  }
}

function createSystemPrompt(voiceProfile: VoiceProfile | null | undefined): string {
  const topics = voiceProfile?.topics || 'technology'
  const tone = voiceProfile?.tone || 'professional'
  const feeling = voiceProfile?.feeling || 'informed'

  const toneInstructions = {
    casual: 'Use a casual, conversational tone with emojis and informal language. Be friendly and approachable.',
    professional: 'Use a professional, authoritative tone. Be clear, concise, and business-focused.',
    friendly: 'Use a warm, friendly tone. Be encouraging and supportive while remaining informative.',
    authoritative: 'Use an authoritative, expert tone. Be confident and decisive in your analysis.'
  }

  return `You are an expert newsletter writer creating personalized newsletters for ${topics} topics.

Your writing style should be ${toneInstructions[tone]}.

Key requirements:
- Create engaging, well-structured newsletters
- Use markdown formatting for headers, bold text, and links
- Include relevant emojis and visual elements
- Write in a way that makes readers feel ${feeling}
- Keep paragraphs short and scannable
- Include clear calls-to-action
- Add personal commentary and insights
- Use the provided news items as source material
- Create compelling subject lines
- Maintain consistency with the user's voice profile

Newsletter structure:
1. Personalized greeting based on tone
2. Brief introduction/context
3. Main content sections with news items
4. Personal commentary/insights
5. Call-to-action
6. Personalized closing
7. Footer with metadata

Make the newsletter feel authentic and personal, as if written by someone who truly understands the ${topics} space.`
}

function createUserPrompt(newsItems: NewsItem[], template?: string): string {
  const newsContent = newsItems.map((item, index) => 
    `${index + 1}. **${item.title}**
   ${item.summary}
   ${item.url ? `Source: ${item.url}` : ''}
   ${item.source ? `From: ${item.source}` : ''}
   `
  ).join('\n')

  return `Please create a newsletter using the following news items:

${newsContent}

${template ? `Template preference: ${template}` : ''}

Requirements:
- Use all provided news items
- Create engaging section headers
- Add personal insights and commentary
- Include relevant links where provided
- Make it feel current and timely
- Ensure the content flows naturally
- Add appropriate emojis and formatting
- Keep the tone consistent throughout

Generate a complete newsletter that readers will find valuable and engaging.`
}

export async function generateSubjectLine(
  newsletterContent: string,
  voiceProfile: VoiceProfile
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return 'Weekly Newsletter Update'
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert email marketer. Create compelling, click-worthy subject lines for newsletters.
          
          Guidelines:
          - Keep under 50 characters
          - Use action words and emotional triggers
          - Match the tone: ${voiceProfile.tone || 'professional'}
          - Include relevant emojis sparingly
          - Create urgency or curiosity
          - Avoid spam trigger words
          - Make it personal and engaging`
        },
        {
          role: 'user',
          content: `Create a subject line for this newsletter content:\n\n${newsletterContent.substring(0, 500)}...`
        }
      ],
      temperature: 0.8,
      max_tokens: 100,
    })

    return completion.choices[0]?.message?.content || 'Weekly Newsletter Update'
  } catch (error) {
    console.error('Subject line generation error:', error)
    return 'Weekly Newsletter Update'
  }
}

export async function enhanceContent(
  content: string,
  voiceProfile: VoiceProfile,
  enhancementType: 'summarize' | 'expand' | 'tone_adjust' | 'fact_check' = 'tone_adjust'
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return content
  }

  const enhancementPrompts = {
    summarize: 'Summarize this content while maintaining key information and insights.',
    expand: 'Expand this content with additional context, examples, and insights.',
    tone_adjust: `Adjust the tone of this content to be ${voiceProfile.tone || 'professional'} while maintaining the core message.`,
    fact_check: 'Review this content for accuracy and suggest any corrections or clarifications needed.'
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a content enhancement expert. ${enhancementPrompts[enhancementType]}`
        },
        {
          role: 'user',
          content: content
        }
      ],
      temperature: 0.5,
      max_tokens: 1000,
    })

    return completion.choices[0]?.message?.content || content
  } catch (error) {
    console.error('Content enhancement error:', error)
    return content
  }
}
