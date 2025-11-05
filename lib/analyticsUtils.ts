interface Draft {
  id: string
  content: string
  created_at: string
}

export interface AnalyticsData {
  totalDrafts: number
  avgWordCount: number
  mostUsedWords: { word: string; count: number }[]
  draftsByMonth: { month: string; count: number }[]
  totalWords: number
  longestDraft: number
  shortestDraft: number
}

export function analyzeDrafts(drafts: Draft[]): AnalyticsData {
  if (!drafts || drafts.length === 0) {
    return {
      totalDrafts: 0,
      avgWordCount: 0,
      mostUsedWords: [],
      draftsByMonth: [],
      totalWords: 0,
      longestDraft: 0,
      shortestDraft: 0
    }
  }

  // Total drafts
  const totalDrafts = drafts.length

  // Word counts
  const wordCounts = drafts.map(draft => {
    const words = draft.content.split(/\s+/).filter(w => w.length > 0)
    return words.length
  })

  const totalWords = wordCounts.reduce((sum, count) => sum + count, 0)
  const avgWordCount = Math.round(totalWords / totalDrafts)
  const longestDraft = Math.max(...wordCounts)
  const shortestDraft = Math.min(...wordCounts)

  // Most used words
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']

  const wordFreq: { [key: string]: number } = {}

  drafts.forEach(draft => {
    const words = draft.content
      .toLowerCase()
      .split(/\s+/)
      .map(w => w.replace(/[^a-z]/g, ''))
      .filter(w => w.length > 3 && !commonWords.includes(w))

    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    })
  })

  const mostUsedWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }))

  // Drafts by month
  const monthCounts: { [key: string]: number } = {}

  drafts.forEach(draft => {
    const date = new Date(draft.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
  })

  const draftsByMonth = Object.entries(monthCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count
    }))

  return {
    totalDrafts,
    avgWordCount,
    mostUsedWords,
    draftsByMonth,
    totalWords,
    longestDraft,
    shortestDraft
  }
}
