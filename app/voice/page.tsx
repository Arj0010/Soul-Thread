'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'

interface VoiceAnalysis {
  avgSentenceLength: number
  sentiment: string
  keywords: string[]
  wordCount: number
  complexWords: number
}

export default function VoicePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    topics: '',
    tone: '',
    feeling: ''
  })
  const [writingSample, setWritingSample] = useState('')
  const [analysis, setAnalysis] = useState<VoiceAnalysis | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/')
        return
      }
      setUser(currentUser)
      setLoading(false)
    }

    checkUser()
  }, [router])

  const analyzeWritingSample = () => {
    if (!writingSample.trim()) {
      alert('Please enter a writing sample first.')
      return
    }

    // Count sentences
    const sentences = writingSample.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = writingSample.toLowerCase().split(/\s+/).filter(w => w.length > 0)
    const wordCount = words.length
    const avgSentenceLength = Math.round(wordCount / sentences.length)

    // Simple sentiment analysis (positive/negative/neutral word counting)
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best', 'brilliant', 'awesome']
    const negativeWords = ['bad', 'terrible', 'awful', 'worse', 'worst', 'hate', 'poor', 'disappointing', 'failure']

    let positiveCount = 0
    let negativeCount = 0

    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z]/g, '')
      if (positiveWords.includes(cleanWord)) positiveCount++
      if (negativeWords.includes(cleanWord)) negativeCount++
    })

    let sentiment = 'neutral'
    if (positiveCount > negativeCount) sentiment = 'positive'
    else if (negativeCount > positiveCount) sentiment = 'negative'

    // Keyword extraction (top 5 words, excluding common words)
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their']

    const wordFreq: { [key: string]: number } = {}
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z]/g, '')
      if (cleanWord.length > 3 && !commonWords.includes(cleanWord)) {
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1
      }
    })

    const keywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word)

    // Count complex words (3+ syllables - approximation)
    const complexWords = words.filter(w => {
      const vowels = w.match(/[aeiouy]+/g)
      return vowels && vowels.length >= 3
    }).length

    const analysisResult: VoiceAnalysis = {
      avgSentenceLength,
      sentiment,
      keywords,
      wordCount,
      complexWords
    }

    setAnalysis(analysisResult)

    // Auto-populate form based on analysis
    if (!formData.tone) {
      if (avgSentenceLength < 15) {
        setFormData(prev => ({ ...prev, tone: 'casual, conversational' }))
      } else if (avgSentenceLength > 25) {
        setFormData(prev => ({ ...prev, tone: 'formal, detailed' }))
      } else {
        setFormData(prev => ({ ...prev, tone: 'balanced, professional' }))
      }
    }

    if (!formData.feeling) {
      setFormData(prev => ({ ...prev, feeling: sentiment === 'positive' ? 'inspired, optimistic' : sentiment === 'negative' ? 'cautious, critical' : 'informed, balanced' }))
    }

    if (!formData.topics && keywords.length > 0) {
      setFormData(prev => ({ ...prev, topics: keywords.join(', ') }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const voiceData = {
        ...formData,
        analysis: analysis || undefined
      }

      const { data, error } = await supabase
        .from('voicedna')
        .upsert({
          user_id: user.id,
          data: voiceData
        })

      if (error) {
        console.error('Error saving voice profile:', error)
        alert(`Error saving voice profile: ${error.message || 'Unknown error'}`)
      } else {
        alert('Voice profile saved successfully!')
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      alert(`An unexpected error occurred: ${err}`)
    } finally {
      setSaving(false)
    }
  }

  const exportVoiceDNA = () => {
    const voiceData = {
      formData,
      analysis,
      exportedAt: new Date().toISOString()
    }

    const dataStr = JSON.stringify(voiceData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `voice-dna-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-8">Voice Trainer</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Writing Sample Analyzer */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-black mb-4">Upload Writing Sample</h2>
              <p className="text-sm text-gray-600 mb-4">
                Paste a sample of your writing to analyze your style automatically.
              </p>

              <textarea
                value={writingSample}
                onChange={(e) => setWritingSample(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                rows={8}
                placeholder="Paste your writing sample here (at least 100 words for best results)..."
              />

              <button
                onClick={analyzeWritingSample}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 mb-4"
              >
                Analyze Writing
              </button>

              {analysis && (
                <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-black mb-2">Analysis Results</h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Word Count:</strong> {analysis.wordCount}</p>
                    <p><strong>Avg Sentence Length:</strong> {analysis.avgSentenceLength} words</p>
                    <p><strong>Sentiment:</strong> {analysis.sentiment}</p>
                    <p><strong>Complex Words:</strong> {analysis.complexWords}</p>
                    <p><strong>Top Keywords:</strong> {analysis.keywords.join(', ')}</p>
                  </div>
                  <button
                    onClick={exportVoiceDNA}
                    className="w-full mt-3 bg-white text-purple-600 border border-purple-600 py-1.5 px-3 rounded-md hover:bg-purple-50 text-sm"
                  >
                    Export Voice DNA (JSON)
                  </button>
                </div>
              )}
            </div>

            {/* Manual Voice Profile */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-black mb-4">Voice Profile</h2>
              <p className="text-sm text-gray-600 mb-4">
                Define your writing style manually or let the analyzer auto-populate.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="topics" className="block text-sm font-medium text-black mb-2">
                    What topics do you write about?
                  </label>
                  <textarea
                    id="topics"
                    value={formData.topics}
                    onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="e.g., Technology, AI, productivity..."
                  />
                </div>

                <div>
                  <label htmlFor="tone" className="block text-sm font-medium text-black mb-2">
                    How would you describe your tone?
                  </label>
                  <input
                    id="tone"
                    type="text"
                    value={formData.tone}
                    onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Professional, casual, friendly..."
                  />
                </div>

                <div>
                  <label htmlFor="feeling" className="block text-sm font-medium text-black mb-2">
                    What do you want readers to feel?
                  </label>
                  <input
                    id="feeling"
                    type="text"
                    value={formData.feeling}
                    onChange={(e) => setFormData({ ...formData, feeling: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Informed, inspired, motivated..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Voice Profile'}
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black mb-3">How It Works</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Paste a writing sample and click "Analyze Writing" for instant AI-free analysis</li>
              <li>The analyzer calculates sentence length, sentiment, and keyword frequency</li>
              <li>Results auto-populate your voice profile for consistency</li>
              <li>Export your Voice DNA as JSON for backup or sharing</li>
              <li>Or manually define your style preferences in the form</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
