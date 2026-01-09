'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'

export default function EnhancedDraftsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [useRealTimeData, setUseRealTimeData] = useState(true)
  const [generationInfo, setGenerationInfo] = useState<any>(null)
  const router = useRouter()

  const topics = [
    'AI', 'Machine Learning', 'Startups', 'Blockchain', 'Cybersecurity',
    'Cloud Computing', 'Mobile Apps', 'Web Development', 'Data Science',
    'Fintech', 'Healthtech', 'Edtech', 'SaaS', 'IoT', 'AR/VR'
  ]

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

  const generateNewsletter = async () => {
    setGenerating(true)
    setGenerationInfo(null)
    
    try {
      const response = await fetch('/api/enhanced-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user.id,
          topic: selectedTopic || undefined,
          useRealTimeData
        }),
      })

      const data = await response.json()
      if (data.draft) {
        setDraft(data.draft)
        setGenerationInfo({
          generatedAt: data.generatedAt,
          dataSource: data.dataSource,
          topic: data.topic
        })
      } else {
        alert('Failed to generate draft')
      }
    } catch (error) {
      console.error('Error generating draft:', error)
      alert('Error generating draft')
    } finally {
      setGenerating(false)
    }
  }

  const saveDraft = async () => {
    if (!draft.trim()) {
      alert('Please enter some content before saving')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('drafts')
        .insert({
          user_id: user.id,
          content: draft
        })

      if (error) {
        console.error('Error saving draft:', error)
        alert('Error saving draft')
      } else {
        alert('Draft saved successfully!')
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const sendTestEmail = () => {
    alert('Email sent! (This is a mock - no actual email was sent)')
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-8">Enhanced Newsletter Drafts</h1>
          
          {/* Generation Controls */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-black mb-4">Generate Newsletter</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Data Source Selection */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Data Source</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={useRealTimeData}
                      onChange={() => setUseRealTimeData(true)}
                      className="mr-2"
                    />
                    <span className="text-black">Real-time News & Data</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!useRealTimeData}
                      onChange={() => setUseRealTimeData(false)}
                      className="mr-2"
                    />
                    <span className="text-black">Mock Data (Original)</span>
                  </label>
                </div>
              </div>

              {/* Topic Selection */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Focus Topic (Optional)</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Topics</option>
                  {topics.map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-black">
                {useRealTimeData ? (
                  <span>📡 Fetching from: News API, Reddit, Hacker News, GitHub</span>
                ) : (
                  <span>📝 Using mock trend data</span>
                )}
              </div>
              <button
                onClick={generateNewsletter}
                disabled={generating}
                className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate Newsletter'}
              </button>
            </div>
          </div>

          {/* Generation Info */}
          {generationInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-black mb-2">Generation Details</h3>
              <div className="text-sm text-black space-y-1">
                <p><strong>Generated:</strong> {new Date(generationInfo.generatedAt).toLocaleString()}</p>
                <p><strong>Data Source:</strong> {generationInfo.dataSource}</p>
                <p><strong>Topic:</strong> {generationInfo.topic}</p>
              </div>
            </div>
          )}

          {/* Draft Editor */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-black">Newsletter Draft</h2>
              <div className="text-sm text-black">
                {draft.length} characters
              </div>
            </div>

            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Click 'Generate Newsletter' to create a draft, or start typing your own content..."
            />

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={saveDraft}
                disabled={saving || !draft.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>

              <button
                onClick={sendTestEmail}
                disabled={!draft.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Send Test Email
              </button>
            </div>
          </div>

          {/* Data Sources Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black mb-4">Real-time Data Sources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-black mb-2">News APIs</h3>
                <ul className="text-black space-y-1 text-sm">
                  <li>• <strong>News API:</strong> Top headlines by category</li>
                  <li>• <strong>Reddit API:</strong> Trending discussions</li>
                  <li>• <strong>Hacker News:</strong> Tech community highlights</li>
                  <li>• <strong>GitHub API:</strong> Trending repositories</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-2">Setup Required</h3>
                <ul className="text-black space-y-1 text-sm">
                  <li>• Add <code>NEWS_API_KEY</code> to .env.local</li>
                  <li>• Get free key at newsapi.org</li>
                  <li>• 100 requests/day free tier</li>
                  <li>• Other APIs work without keys</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

