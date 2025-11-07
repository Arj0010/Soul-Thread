// Perplexity API integration for real-time news curation
// Perplexity provides AI-powered search with real-time web access

export interface PerplexityNewsItem {
  title: string
  summary: string
  url?: string
  source?: string
  publishedAt?: string
  relevance_score?: number
}

export interface PerplexityResponse {
  id: string
  model: string
  created: number
  choices: Array<{
    index: number
    finish_reason: string
    message: {
      role: string
      content: string
    }
    delta?: {
      role?: string
      content?: string
    }
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * Fetch curated news from Perplexity AI
 * Uses Perplexity's Sonar model for real-time web search
 */
export async function fetchPerplexityNews(
  topic: string = 'technology',
  count: number = 5
): Promise<PerplexityNewsItem[]> {
  const API_KEY = process.env.PERPLEXITY_API_KEY

  if (!API_KEY) {
    console.warn('PERPLEXITY_API_KEY not configured, skipping Perplexity fetch')
    return []
  }

  try {
    const query = buildNewsQuery(topic, count)

    console.log(`[Perplexity] Fetching ${count} news items for topic: ${topic}`)

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar', // Real-time web search model
        messages: [
          {
            role: 'system',
            content: 'You are a news curator. Return only valid JSON arrays with news items. Be concise and factual.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2, // Lower temp for more factual responses
        max_tokens: 1500,
        return_citations: true,
        return_related_questions: false,
        search_recency_filter: 'day', // Only recent news (last 24 hours)
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Perplexity] API error: ${response.status} - ${errorText}`)
      return []
    }

    const data: PerplexityResponse = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      console.warn('[Perplexity] No content in response')
      return []
    }

    // Parse the response and extract news items
    const newsItems = parsePerplexityResponse(content, topic)

    console.log(`[Perplexity] Successfully fetched ${newsItems.length} news items`)

    return newsItems

  } catch (error: any) {
    console.error('[Perplexity] Fetch error:', error.message)
    return []
  }
}

/**
 * Build optimized query for Perplexity API
 */
function buildNewsQuery(topic: string, count: number): string {
  const today = new Date().toISOString().split('T')[0]

  return `Find the top ${count} most important and trending news stories about "${topic}" from the last 24 hours (${today}).

For each story, provide:
1. Title (clear and concise)
2. Summary (2-3 sentences explaining what happened)
3. Source (publication name)
4. URL (direct link to article)

Return ONLY a valid JSON array in this exact format:
[
  {
    "title": "News headline here",
    "summary": "Brief description of the story...",
    "source": "Source publication",
    "url": "https://example.com/article"
  }
]

Requirements:
- Return ONLY the JSON array, no additional text
- Include only verified, recent news from reputable sources
- Prioritize significant developments and trending stories
- Ensure all URLs are valid and direct article links
- Keep summaries factual and concise`
}

/**
 * Parse Perplexity AI response and extract structured news items
 */
function parsePerplexityResponse(content: string, topic: string): PerplexityNewsItem[] {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      console.warn('[Perplexity] No JSON array found in response')
      return parseFallbackFormat(content, topic)
    }

    const newsArray = JSON.parse(jsonMatch[0])

    if (!Array.isArray(newsArray)) {
      console.warn('[Perplexity] Response is not an array')
      return []
    }

    return newsArray.map((item: any, index: number) => ({
      title: item.title || 'Untitled',
      summary: item.summary || item.description || 'No summary available',
      url: item.url || item.link || undefined,
      source: item.source || 'Perplexity AI',
      publishedAt: new Date().toISOString(),
      relevance_score: 1.0 - (index * 0.1) // Decreasing relevance
    })).filter(item => item.title !== 'Untitled')

  } catch (error: any) {
    console.error('[Perplexity] Parse error:', error.message)
    return parseFallbackFormat(content, topic)
  }
}

/**
 * Fallback parser for non-JSON formatted responses
 */
function parseFallbackFormat(content: string, topic: string): PerplexityNewsItem[] {
  try {
    // Try to extract structured information from markdown-style content
    const items: PerplexityNewsItem[] = []

    // Split by numbered items (1., 2., 3., etc.)
    const sections = content.split(/\d+\.\s+/).filter(s => s.trim().length > 0)

    for (const section of sections) {
      // Extract title (usually first line or in bold)
      const titleMatch = section.match(/\*\*(.+?)\*\*|^(.+?)[\n\r]/);
      const title = titleMatch ? (titleMatch[1] || titleMatch[2]).trim() : ''

      // Extract summary (remaining content)
      const summary = section
        .replace(/\*\*(.+?)\*\*/g, '')
        .replace(/Source:.+/gi, '')
        .replace(/URL:.+/gi, '')
        .trim()

      // Extract source
      const sourceMatch = section.match(/Source:\s*(.+?)[\n\r]/i);
      const source = sourceMatch ? sourceMatch[1].trim() : 'Perplexity AI'

      // Extract URL
      const urlMatch = section.match(/URL:\s*(https?:\/\/.+?)[\s\n\r]/i);
      const url = urlMatch ? urlMatch[1].trim() : undefined

      if (title && summary.length > 20) {
        items.push({
          title,
          summary: summary.substring(0, 300),
          source,
          url,
          publishedAt: new Date().toISOString(),
          relevance_score: 0.8
        })
      }
    }

    return items.slice(0, 5) // Return max 5 items

  } catch (error: any) {
    console.error('[Perplexity] Fallback parse error:', error.message)
    return []
  }
}

/**
 * Fetch news with caching to reduce API costs
 */
export async function fetchPerplexityNewsWithCache(
  topic: string = 'technology',
  count: number = 5,
  cacheDurationMinutes: number = 60
): Promise<PerplexityNewsItem[]> {
  const cacheKey = `perplexity_${topic}_${count}`

  try {
    // Try to get from cache (implementation depends on your caching strategy)
    // For now, we'll just fetch fresh data
    // TODO: Implement Supabase news_cache table integration

    const newsItems = await fetchPerplexityNews(topic, count)

    // TODO: Store in cache for future requests

    return newsItems

  } catch (error) {
    console.error('[Perplexity] Cache fetch error:', error)
    return []
  }
}

/**
 * Get trending topics using Perplexity
 */
export async function fetchTrendingTopics(category: string = 'technology'): Promise<string[]> {
  const API_KEY = process.env.PERPLEXITY_API_KEY

  if (!API_KEY) {
    return []
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'user',
            content: `What are the top 5 trending topics in ${category} today? Return ONLY a JSON array of topic strings, like: ["AI Regulation", "New iPhone Release", etc.]`
          }
        ],
        temperature: 0.3,
        max_tokens: 200,
        search_recency_filter: 'day',
      }),
    })

    if (!response.ok) {
      return []
    }

    const data: PerplexityResponse = await response.json()
    const content = data.choices[0]?.message?.content

    const jsonMatch = content?.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const topics = JSON.parse(jsonMatch[0])
      return Array.isArray(topics) ? topics : []
    }

    return []

  } catch (error) {
    console.error('[Perplexity] Trending topics error:', error)
    return []
  }
}

/**
 * Estimate cost for Perplexity API call
 */
export function estimatePerplexityCost(tokenCount: number): number {
  // Sonar model pricing: ~$5 per 1M tokens
  // Average query: ~1500 tokens (input + output)
  const costPerToken = 5 / 1_000_000
  return tokenCount * costPerToken
}
