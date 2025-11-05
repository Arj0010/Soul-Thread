'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'

export default function AIDraftsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [useRealTimeData, setUseRealTimeData] = useState(true)
  const [streaming, setStreaming] = useState(false)
  const [generationInfo, setGenerationInfo] = useState<any>(null)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [useTemplate, setUseTemplate] = useState(true) // Default to template mode
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
      
      // Check if OpenAI is configured
      setAiEnabled(!!process.env.NEXT_PUBLIC_OPENAI_ENABLED)
    }

    checkUser()
  }, [router])

  const generateNewsletter = async (useStreaming = false) => {
    setGenerating(true)
    setGenerationInfo(null)
    setStreaming(useStreaming)
    
    try {
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          topic: selectedTopic || undefined,
          useRealTimeData,
          stream: useStreaming,
          useTemplate
        }),
      })

      if (useStreaming) {
        // Handle streaming response
        const reader = response.body?.getReader()
        if (reader) {
          let streamedContent = ''
          setDraft('')
          
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = new TextDecoder().decode(value)
            streamedContent += chunk
            setDraft(streamedContent)
          }
          
          setGenerationInfo({
            generatedAt: new Date().toISOString(),
            dataSource: useRealTimeData ? 'real-time' : 'mock',
            topic: selectedTopic || 'general',
            aiGenerated: true,
            streaming: true
          })
        }
      } else {
        // Handle regular response
        if (!response.ok) {
          const errorData = await response.json()
          console.error('API error response:', errorData)
          alert(errorData.error || `Failed to generate draft (${response.status})`)
          return
        }

        const data = await response.json()
        console.log('API response:', data)

        if (data.draft) {
          setDraft(data.draft)
          setGenerationInfo({
            generatedAt: data.generatedAt,
            dataSource: data.dataSource,
            topic: data.topic,
            aiGenerated: data.aiGenerated,
            newsItemCount: data.newsItemCount
          })
        } else {
          console.error('No draft in response:', data)
          alert(data.error || 'Failed to generate draft')
        }
      }
    } catch (error) {
      console.error('Error generating draft:', error)
      alert(`Error generating draft: ${error}`)
    } finally {
      setGenerating(false)
      setStreaming(false)
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
          content: draft,
          title: `AI Generated Newsletter - ${new Date().toLocaleDateString()}`,
          status: 'draft'
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
          <h1 className="text-3xl font-bold text-black mb-8">AI Newsletter Generator</h1>
          
          {/* AI Status */}
          <div className={`rounded-lg p-4 mb-6 ${aiEnabled ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${aiEnabled ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <div>
                <h3 className="font-semibold text-black">
                  {aiEnabled ? '🤖 AI Generation Ready' : '⚠️ AI Not Configured'}
                </h3>
                <p className="text-sm text-black">
                  {aiEnabled 
                    ? 'OpenAI GPT-4 is ready to generate intelligent newsletters'
                    : 'Add OPENAI_API_KEY to .env.local to enable AI generation'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Voice Profile Reminder */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-3 bg-blue-500"></div>
                <div>
                  <h3 className="font-semibold text-black">💡 Pro Tip</h3>
                  <p className="text-sm text-black">
                    Set up your voice profile first for personalized newsletters. Go to Settings to train your writing style.
                  </p>
                </div>
              </div>
              <a href="/settings?tab=voice" className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 whitespace-nowrap">
                Manage Voice
              </a>
            </div>
          </div>
          
          {/* Generation Controls */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-black mb-4">Generate Newsletter</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Generation Method Selection */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Generation Method</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={useTemplate}
                      onChange={() => setUseTemplate(true)}
                      className="mr-2"
                    />
                    <span className="text-black">Template (Fast, Free) ⚡</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!useTemplate}
                      onChange={() => setUseTemplate(false)}
                      className="mr-2"
                      disabled={!aiEnabled}
                    />
                    <span className={!aiEnabled ? 'text-gray-400' : 'text-black'}>
                      AI Powered (Requires API) 🤖
                    </span>
                  </label>
                  {!aiEnabled && (
                    <p className="text-xs text-gray-500 mt-1">AI requires OpenAI API key</p>
                  )}
                </div>
              </div>

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
                    <span className="text-black">Real-time News</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!useRealTimeData}
                      onChange={() => setUseRealTimeData(false)}
                      className="mr-2"
                    />
                    <span className="text-black">Mock Data</span>
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
                  <span>📡 Using real-time news data</span>
                ) : (
                  <span>📝 Using sample data</span>
                )}
              </div>
              <div className="space-x-3">
                <button
                  onClick={() => generateNewsletter(false)}
                  disabled={generating}
                  className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {generating ? 'Generating...' : '🤖 Generate with AI'}
                </button>
                {aiEnabled && (
                  <button
                    onClick={() => generateNewsletter(true)}
                    disabled={generating}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {streaming ? 'Streaming...' : '⚡ Live Stream'}
                  </button>
                )}
              </div>
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
                <p><strong>AI Generated:</strong> {generationInfo.aiGenerated ? 'Yes' : 'No'}</p>
                {generationInfo.newsItemCount && (
                  <p><strong>News Items:</strong> {generationInfo.newsItemCount}</p>
                )}
                {generationInfo.streaming && (
                  <p><strong>Streaming:</strong> Yes</p>
                )}
              </div>
            </div>
          )}

          {/* Draft Editor */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-black">Newsletter Draft</h2>
              <div className="text-sm text-black">
                {draft.length} characters
                {streaming && <span className="ml-2 text-blue-600">● Streaming</span>}
              </div>
            </div>

            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Click 'Generate Newsletter' to create an AI-powered draft, or start typing your own content..."
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

          {/* AI Features Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black mb-4">AI-Powered Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-black mb-2">Content Generation</h3>
                <ul className="text-black space-y-1 text-sm">
                  <li>• <strong>GPT-4 Integration:</strong> Intelligent content creation</li>
                  <li>• <strong>Voice Matching:</strong> Adapts to your writing style</li>
                  <li>• <strong>Real-time Streaming:</strong> Watch content generate live</li>
                  <li>• <strong>Context Awareness:</strong> Understands current events</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-2">Setup Required</h3>
                <ul className="text-black space-y-1 text-sm">
                  <li>• Add <code>OPENAI_API_KEY</code> to .env.local</li>
                  <li>• Get API key at platform.openai.com</li>
                  <li>• Set <code>NEXT_PUBLIC_OPENAI_ENABLED=true</code></li>
                  <li>• Fallback to template generation if unavailable</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
