'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'

export default function LinkedInPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [post, setPost] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [postType, setPostType] = useState('professional')
  const [useRealTimeData, setUseRealTimeData] = useState(true)
  const [charCount, setCharCount] = useState(0)
  const [generationInfo, setGenerationInfo] = useState<any>(null)
  const [aiEnabled, setAiEnabled] = useState(false)
  const router = useRouter()

  const topics = [
    'AI', 'Machine Learning', 'Startups', 'Blockchain', 'Cybersecurity',
    'Cloud Computing', 'Mobile Apps', 'Web Development', 'Data Science',
    'Fintech', 'Healthtech', 'Edtech', 'SaaS', 'IoT', 'AR/VR',
    'Leadership', 'Productivity', 'Career Growth', 'Innovation'
  ]

  const postTypes = [
    { value: 'professional', label: 'Professional Insight', emoji: '💼' },
    { value: 'thought-leadership', label: 'Thought Leadership', emoji: '🧠' },
    { value: 'story', label: 'Personal Story', emoji: '📖' },
    { value: 'tips', label: 'Tips & Advice', emoji: '💡' },
    { value: 'announcement', label: 'Announcement', emoji: '📢' },
    { value: 'engagement', label: 'Engagement Post', emoji: '🤝' }
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

  useEffect(() => {
    setCharCount(post.length)
  }, [post])

  const generateLinkedInPost = async () => {
    setGenerating(true)
    setGenerationInfo(null)

    try {
      const response = await fetch('/api/linkedin-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          topic: selectedTopic || undefined,
          postType,
          useRealTimeData
        }),
      })

      const data = await response.json()

      if (data.post) {
        setPost(data.post)
        setGenerationInfo({
          generatedAt: data.generatedAt,
          dataSource: data.dataSource,
          topic: data.topic,
          postType: data.postType,
          aiGenerated: data.aiGenerated
        })
      } else {
        alert(data.error || 'Failed to generate post')
      }
    } catch (error) {
      console.error('Error generating post:', error)
      alert('Error generating post')
    } finally {
      setGenerating(false)
    }
  }

  const savePost = async () => {
    if (!post.trim()) {
      alert('Please enter some content before saving')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('drafts')
        .insert({
          user_id: user.id,
          content: post,
          title: `LinkedIn Post - ${postTypes.find(t => t.value === postType)?.label} - ${new Date().toLocaleDateString()}`,
          status: 'draft'
        })

      if (error) {
        console.error('Error saving post:', error)
        alert('Error saving post')
      } else {
        alert('Post saved successfully!')
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(post)
    alert('Post copied to clipboard!')
  }

  const getCharCountColor = () => {
    if (charCount < 1000) return 'text-green-600'
    if (charCount < 2500) return 'text-yellow-600'
    if (charCount <= 3000) return 'text-orange-600'
    return 'text-red-600'
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black">LinkedIn Post Generator</h1>
              <p className="text-gray-600 mt-2">Generate engaging LinkedIn posts with your trained voice</p>
            </div>
            <div className="text-6xl">💼</div>
          </div>

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
                    ? 'OpenAI GPT-4 is ready to generate LinkedIn posts in your voice'
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
                  <h3 className="font-semibold text-black">💡 Using Your Voice Profile</h3>
                  <p className="text-sm text-black">
                    Posts will match your writing style from Settings. Update your profile to refine the output.
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
            <h2 className="text-xl font-semibold text-black mb-4">Configure Your Post</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Post Type Selection */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Post Type</label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {postTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.emoji} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic Selection */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Topic (Optional)</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">AI will choose</option>
                  {topics.map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>

              {/* Data Source Selection */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Content Source</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={useRealTimeData}
                      onChange={() => setUseRealTimeData(true)}
                      className="mr-2"
                    />
                    <span className="text-black text-sm">Real-time News</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!useRealTimeData}
                      onChange={() => setUseRealTimeData(false)}
                      className="mr-2"
                    />
                    <span className="text-black text-sm">Trending Topics</span>
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={generateLinkedInPost}
              disabled={generating}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-semibold"
            >
              {generating ? 'Generating Your Post...' : '🚀 Generate LinkedIn Post'}
            </button>
          </div>

          {/* Generation Info */}
          {generationInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-black mb-2">✨ Generation Details</h3>
              <div className="text-sm text-black space-y-1">
                <p><strong>Generated:</strong> {new Date(generationInfo.generatedAt).toLocaleString()}</p>
                <p><strong>Post Type:</strong> {postTypes.find(t => t.value === generationInfo.postType)?.label}</p>
                <p><strong>Topic:</strong> {generationInfo.topic || 'AI Selected'}</p>
                <p><strong>Data Source:</strong> {generationInfo.dataSource === 'real-time' ? 'Real-time News' : 'Trending Topics'}</p>
                <p><strong>AI Generated:</strong> {generationInfo.aiGenerated ? 'Yes (with your voice)' : 'Template'}</p>
              </div>
            </div>
          )}

          {/* Post Editor */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-black">Your LinkedIn Post</h2>
              <div className={`text-sm font-medium ${getCharCountColor()}`}>
                {charCount} / 3000 characters
                {charCount > 3000 && <span className="ml-2">⚠️ Over limit!</span>}
              </div>
            </div>

            <textarea
              value={post}
              onChange={(e) => setPost(e.target.value)}
              className="w-full h-96 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans text-base"
              placeholder="Click 'Generate LinkedIn Post' to create AI-powered content in your voice, or write your own post here...&#10;&#10;Tip: LinkedIn's ideal post length is 1,300-2,000 characters for maximum engagement."
            />

            {/* Post Preview */}
            {post && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-black mb-2 text-sm">Preview (How it looks on LinkedIn)</h3>
                <div className="bg-white p-4 rounded-md border border-gray-300">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold text-lg">
                      {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div className="ml-3">
                      <div className="font-semibold text-black">Your Name</div>
                      <div className="text-xs text-gray-600">Your Title • Now</div>
                    </div>
                  </div>
                  <div className="text-black whitespace-pre-wrap text-sm leading-relaxed">
                    {post.length > 300 ? (
                      <>
                        {post.substring(0, 300)}...
                        <button className="text-blue-600 ml-1">see more</button>
                      </>
                    ) : post}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-6 gap-3">
              <button
                onClick={savePost}
                disabled={saving || !post.trim()}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : '💾 Save Draft'}
              </button>

              <button
                onClick={copyToClipboard}
                disabled={!post.trim()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                📋 Copy to Clipboard
              </button>
            </div>
          </div>

          {/* LinkedIn Best Practices */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black mb-4">LinkedIn Best Practices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-black mb-2">📊 Engagement Tips</h3>
                <ul className="text-black space-y-1 text-sm">
                  <li>• <strong>Ideal Length:</strong> 1,300-2,000 characters</li>
                  <li>• <strong>Hook First Line:</strong> Grab attention immediately</li>
                  <li>• <strong>Use Line Breaks:</strong> Makes content scannable</li>
                  <li>• <strong>Add Emojis:</strong> But don't overdo it (2-4 max)</li>
                  <li>• <strong>Include CTA:</strong> End with a question or call-to-action</li>
                  <li>• <strong>Hashtags:</strong> 3-5 relevant hashtags</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-2">⏰ Posting Strategy</h3>
                <ul className="text-black space-y-1 text-sm">
                  <li>• <strong>Best Times:</strong> Tuesday-Thursday, 9-11 AM</li>
                  <li>• <strong>Frequency:</strong> 3-5 posts per week</li>
                  <li>• <strong>Engagement Window:</strong> First 90 minutes are critical</li>
                  <li>• <strong>Reply Quickly:</strong> Respond to comments fast</li>
                  <li>• <strong>Tag Strategically:</strong> Mention relevant people/companies</li>
                  <li>• <strong>Test & Learn:</strong> Track what resonates with your audience</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
