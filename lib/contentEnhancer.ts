// AI-powered content enhancement utilities
import { enhanceContent, generateSubjectLine } from './openaiGenerate'

export interface ContentEnhancementOptions {
  summarize?: boolean
  expand?: boolean
  toneAdjust?: boolean
  factCheck?: boolean
  generateSubject?: boolean
}

export interface EnhancedContent {
  originalContent: string
  enhancedContent: string
  subjectLine?: string
  wordCount: number
  readabilityScore?: number
  suggestions?: string[]
}

export async function enhanceNewsletterContent(
  content: string,
  voiceProfile: any,
  options: ContentEnhancementOptions = {}
): Promise<EnhancedContent> {
  const {
    summarize = false,
    expand = false,
    toneAdjust = true,
    factCheck = false,
    generateSubject = true
  } = options

  let enhancedContent = content
  let subjectLine: string | undefined

  // Generate subject line if requested
  if (generateSubject && process.env.OPENAI_API_KEY) {
    try {
      subjectLine = await generateSubjectLine(content, voiceProfile)
    } catch (error) {
      console.error('Subject line generation failed:', error)
    }
  }

  // Apply enhancements based on options
  if (process.env.OPENAI_API_KEY) {
    try {
      if (toneAdjust) {
        enhancedContent = await enhanceContent(content, voiceProfile, 'tone_adjust')
      }
      
      if (summarize) {
        enhancedContent = await enhanceContent(enhancedContent, voiceProfile, 'summarize')
      }
      
      if (expand) {
        enhancedContent = await enhanceContent(enhancedContent, voiceProfile, 'expand')
      }
      
      if (factCheck) {
        const factCheckedContent = await enhanceContent(enhancedContent, voiceProfile, 'fact_check')
        // For fact checking, we might want to show both original and suggestions
        enhancedContent = factCheckedContent
      }
    } catch (error) {
      console.error('Content enhancement failed:', error)
      // Keep original content if enhancement fails
    }
  }

  return {
    originalContent: content,
    enhancedContent,
    subjectLine,
    wordCount: enhancedContent.split(' ').length,
    readabilityScore: calculateReadabilityScore(enhancedContent),
    suggestions: generateContentSuggestions(enhancedContent, voiceProfile)
  }
}

export function calculateReadabilityScore(content: string): number {
  const words = content.split(' ')
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const syllables = words.reduce((total, word) => total + countSyllables(word), 0)
  
  if (sentences.length === 0 || words.length === 0) return 0
  
  // Simplified Flesch Reading Ease score
  const avgWordsPerSentence = words.length / sentences.length
  const avgSyllablesPerWord = syllables / words.length
  
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
  
  return Math.max(0, Math.min(100, Math.round(score)))
}

function countSyllables(word: string): number {
  const vowels = 'aeiouy'
  let count = 0
  let previousWasVowel = false
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i].toLowerCase())
    if (isVowel && !previousWasVowel) {
      count++
    }
    previousWasVowel = isVowel
  }
  
  // Handle silent 'e'
  if (word.endsWith('e') && count > 1) {
    count--
  }
  
  return Math.max(1, count)
}

export function generateContentSuggestions(content: string, voiceProfile: any): string[] {
  const suggestions: string[] = []
  const wordCount = content.split(' ').length
  
  // Length suggestions
  if (wordCount < 200) {
    suggestions.push('Consider adding more detail or examples to make the newsletter more comprehensive')
  } else if (wordCount > 1000) {
    suggestions.push('The newsletter is quite long - consider breaking it into sections or creating a series')
  }
  
  // Structure suggestions
  if (!content.includes('##')) {
    suggestions.push('Add section headers to improve readability and organization')
  }
  
  if (!content.includes('[') || !content.includes('](')) {
    suggestions.push('Include relevant links to provide additional value to readers')
  }
  
  // Tone-specific suggestions
  const tone = voiceProfile?.tone || 'professional'
  if (tone === 'casual' && !content.includes('!')) {
    suggestions.push('Add some exclamation points to match your casual tone')
  }
  
  if (tone === 'professional' && content.includes('!')) {
    suggestions.push('Consider reducing exclamation points for a more professional tone')
  }
  
  // Engagement suggestions
  if (!content.includes('?')) {
    suggestions.push('Add questions to encourage reader engagement and interaction')
  }
  
  if (!content.includes('💭') && !content.includes('My Take')) {
    suggestions.push('Include personal commentary or insights to add your unique voice')
  }
  
  return suggestions
}

export function validateContent(content: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Basic validation
  if (!content || content.trim().length === 0) {
    errors.push('Content cannot be empty')
  }
  
  if (content.length < 50) {
    errors.push('Content is too short - aim for at least 50 characters')
  }
  
  if (content.length > 5000) {
    errors.push('Content is very long - consider breaking it into multiple newsletters')
  }
  
  // Check for required elements
  if (!content.includes('Hello') && !content.includes('Hi') && !content.includes('Hey')) {
    errors.push('Consider adding a greeting to personalize the newsletter')
  }
  
  // Check for spam trigger words
  const spamWords = ['free', 'urgent', 'limited time', 'act now', 'click here']
  const hasSpamWords = spamWords.some(word => 
    content.toLowerCase().includes(word)
  )
  
  if (hasSpamWords) {
    errors.push('Content contains words that might trigger spam filters')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function extractKeyTopics(content: string): string[] {
  // Simple keyword extraction - in a real implementation, you might use NLP libraries
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
  
  // Count word frequency
  const wordCount: { [key: string]: number } = {}
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })
  
  // Return top 5 most frequent words
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word)
}

export function generateContentSummary(content: string, maxLength: number = 150): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  if (sentences.length === 0) return ''
  
  let summary = ''
  for (const sentence of sentences) {
    if (summary.length + sentence.length > maxLength) {
      break
    }
    summary += sentence.trim() + '. '
  }
  
  return summary.trim()
}

