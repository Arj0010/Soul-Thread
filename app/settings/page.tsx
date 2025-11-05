'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

interface VoiceData {
  topics: string
  tone: string
  feeling: string
  analysis?: VoiceAnalysis
}

function SettingsPageContent() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('voice')
  const searchParams = useSearchParams()
  const router = useRouter()

  // Voice Profile State
  const [formData, setFormData] = useState({
    topics: '',
    tone: '',
    feeling: ''
  })
  const [writingSample, setWritingSample] = useState('')
  const [analysis, setAnalysis] = useState<VoiceAnalysis | null>(null)
  const [existingVoiceProfile, setExistingVoiceProfile] = useState<VoiceData | null>(null)
  const [lastTrainedDate, setLastTrainedDate] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/')
        return
      }
      setUser(currentUser)

      // Load existing voice profile
      await loadVoiceProfile(currentUser.id)

      setLoading(false)
    }

    // Get tab from URL if present
    const tab = searchParams?.get('tab')
    if (tab) {
      setActiveTab(tab)
    }

    checkUser()
  }, [router, searchParams])

  const loadVoiceProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('voicedna')
        .select('data, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (data && data.length > 0 && !error) {
        const record = data[0]
        const voiceData = record.data as VoiceData
        setExistingVoiceProfile(voiceData)
        setFormData({
          topics: voiceData.topics || '',
          tone: voiceData.tone || '',
          feeling: voiceData.feeling || ''
        })
        setAnalysis(voiceData.analysis || null)
        setLastTrainedDate(record.updated_at || record.created_at)
      }
    } catch (err) {
      console.error('Error loading voice profile:', err)
    }
  }

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

    // Simple sentiment analysis
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

    // Keyword extraction
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

    // Count complex words
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

    console.log('Saving voice profile for user:', user.id)
    console.log('Form data:', formData)
    console.log('Analysis:', analysis)

    try {
      const voiceData = {
        ...formData,
        analysis: analysis || undefined
      }

      console.log('Voice data to save:', voiceData)

      // First, try to check if a profile already exists
      const { data: existingProfile } = await supabase
        .from('voicedna')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      let data, error

      if (existingProfile) {
        // Update existing profile
        const result = await supabase
          .from('voicedna')
          .update({ data: voiceData })
          .eq('user_id', user.id)
          .select()
        data = result.data
        error = result.error
      } else {
        // Insert new profile
        const result = await supabase
          .from('voicedna')
          .insert({
            user_id: user.id,
            data: voiceData
          })
          .select()
        data = result.data
        error = result.error
      }

      console.log('Upsert result:', { data, error })

      if (error) {
        console.error('Error saving voice profile:', error)
        console.error('Error details:', error.message, error.details, error.hint)
        alert(`Error saving voice profile: ${error.message || 'Unknown error'}`)
      } else {
        console.log('Voice profile saved successfully:', data)
        alert('Voice profile saved successfully! Redirecting to dashboard...')
        console.log('Reloading voice profile...')
        await loadVoiceProfile(user.id)

        // Redirect to dashboard to see the updated profile
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
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
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-8">Settings</h1>

          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="col-span-12 lg:col-span-3">
              <div className="bg-white rounded-lg shadow p-4 sticky top-4">
                <h2 className="font-semibold text-black mb-4">Profile Settings</h2>
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('voice')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'voice'
                        ? 'bg-purple-100 text-purple-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    🎤 Voice Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'account'
                        ? 'bg-purple-100 text-purple-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    👤 Account
                  </button>
                  <button
                    onClick={() => setActiveTab('preferences')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'preferences'
                        ? 'bg-purple-100 text-purple-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    ⚙️ Preferences
                  </button>
                </nav>

                {/* Voice Profile Summary Card */}
                {existingVoiceProfile && activeTab !== 'voice' && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-purple-900 text-sm mb-2">Your Voice</h3>
                    <div className="text-xs text-purple-700 space-y-1">
                      <p><strong>Tone:</strong> {existingVoiceProfile.tone || 'Not set'}</p>
                      <p><strong>Topics:</strong> {existingVoiceProfile.topics?.substring(0, 30) || 'Not set'}{existingVoiceProfile.topics && existingVoiceProfile.topics.length > 30 ? '...' : ''}</p>
                      {lastTrainedDate && (
                        <p className="mt-2 pt-2 border-t border-purple-300">
                          <strong>Last updated:</strong><br />
                          {new Date(lastTrainedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="col-span-12 lg:col-span-9">
              {/* Voice Profile Tab */}
              {activeTab === 'voice' && (
                <div className="space-y-6">
                  {/* Current Voice Profile Status */}
                  {existingVoiceProfile && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h2 className="text-xl font-semibold text-black mb-2 flex items-center">
                            <span className="text-2xl mr-2">✅</span>
                            Your Voice is Trained
                          </h2>
                          <p className="text-gray-700 mb-4">
                            Your writing style is active and being used for AI generation. Update below to refine your voice.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="text-sm font-medium text-gray-600 mb-1">Writing Topics</div>
                              <div className="text-black font-semibold">{existingVoiceProfile.topics || 'Not specified'}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="text-sm font-medium text-gray-600 mb-1">Tone & Style</div>
                              <div className="text-black font-semibold">{existingVoiceProfile.tone || 'Not specified'}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="text-sm font-medium text-gray-600 mb-1">Reader Feeling</div>
                              <div className="text-black font-semibold">{existingVoiceProfile.feeling || 'Not specified'}</div>
                            </div>
                          </div>

                          {existingVoiceProfile.analysis && (
                            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                              <h3 className="font-semibold text-black mb-2 text-sm">Writing Analysis</h3>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <div className="text-gray-600">Sentence Length</div>
                                  <div className="font-semibold text-purple-700">{existingVoiceProfile.analysis.avgSentenceLength} words</div>
                                </div>
                                <div>
                                  <div className="text-gray-600">Sentiment</div>
                                  <div className="font-semibold text-purple-700 capitalize">{existingVoiceProfile.analysis.sentiment}</div>
                                </div>
                                <div>
                                  <div className="text-gray-600">Word Count</div>
                                  <div className="font-semibold text-purple-700">{existingVoiceProfile.analysis.wordCount}</div>
                                </div>
                                <div>
                                  <div className="text-gray-600">Keywords</div>
                                  <div className="font-semibold text-purple-700">{existingVoiceProfile.analysis.keywords?.length || 0}</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {lastTrainedDate && (
                            <div className="mt-4 text-sm text-gray-600">
                              Last trained: {new Date(lastTrainedDate).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!existingVoiceProfile && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h2 className="text-xl font-semibold text-black mb-2 flex items-center">
                        <span className="text-2xl mr-2">⚠️</span>
                        No Voice Profile Found
                      </h2>
                      <p className="text-gray-700">
                        Train your voice below to enable personalized AI-generated newsletters and LinkedIn posts.
                      </p>
                    </div>
                  )}

                  {/* Voice Trainer */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          {saving ? 'Saving...' : existingVoiceProfile ? 'Update Voice Profile' : 'Save Voice Profile'}
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-black mb-3">How Voice Training Works</h2>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Paste a writing sample and click "Analyze Writing" for instant analysis</li>
                      <li>The analyzer calculates sentence length, sentiment, and keyword frequency</li>
                      <li>Results auto-populate your voice profile for consistency</li>
                      <li>Your voice profile is used by AI Newsletter and LinkedIn Post generators</li>
                      <li>Update anytime to refine your voice - changes apply immediately</li>
                      <li>Export your Voice DNA as JSON for backup or sharing</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-semibold text-black mb-6">Account Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">User ID</label>
                      <input
                        type="text"
                        value={user?.id || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-xs"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      More account settings coming soon...
                    </p>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-semibold text-black mb-6">Preferences</h2>
                  <p className="text-gray-600">
                    Preference settings coming soon...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    }>
      <SettingsPageContent />
    </Suspense>
  )
}
