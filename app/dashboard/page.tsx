'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [voiceProfile, setVoiceProfile] = useState<any>(null)
  const [draftsCount, setDraftsCount] = useState(0)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/')
        return
      }
      setUser(currentUser)

      // Load voice profile
      console.log('Loading voice profile for user:', currentUser.id)
      try {
        const { data: voiceDataArray, error } = await supabase
          .from('voicedna')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(1)

        console.log('Supabase query result:', { voiceDataArray, error })

        if (error) {
          console.error('Supabase error:', error.message, error.details, error.hint)
          generateSuggestions(null)
        } else if (voiceDataArray && voiceDataArray.length > 0) {
          const voiceData = voiceDataArray[0]
          console.log('Voice profile loaded successfully:', voiceData)
          console.log('Voice profile data field:', voiceData.data)
          console.log('Type of voiceData.data:', typeof voiceData.data)
          console.log('Is voiceData.data truthy?', !!voiceData.data)
          setVoiceProfile(voiceData.data)
          console.log('Voice profile state set, checking state...')

          // Force a slight delay to ensure state is updated
          setTimeout(() => {
            console.log('Voice profile state after setting:', voiceData.data)
          }, 100)

          generateSuggestions(voiceData.data)
        } else {
          console.log('No voice profile found')
          generateSuggestions(null)
        }
      } catch (err) {
        console.error('Error loading voice profile (catch block):', err)
        generateSuggestions(null)
      }

      // Load drafts count
      try {
        const { count } = await supabase
          .from('drafts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUser.id)

        setDraftsCount(count || 0)
      } catch (err) {
        console.error('Error loading drafts count:', err)
      }

      setLoading(false)
    }

    checkUser()
  }, [router])

  const generateSuggestions = (voice: any) => {
    const baseSuggestions = [
      'AI-powered automation trends in 2025',
      'How remote work is evolving with VR technology',
      'The rise of sustainable tech solutions',
      'Mental health tech: Apps changing therapy',
      'Quantum computing goes commercial',
      'Decentralized social networks gain momentum',
      'Brain-computer interfaces breakthrough',
      'AI in fitness and personalized health'
    ]

    // Customize based on voice profile topics
    if (voice?.topics) {
      const topics = voice.topics.toLowerCase()
      if (topics.includes('ai') || topics.includes('technology')) {
        setSuggestions([
          'Latest breakthroughs in AI language models',
          'How AI is transforming content creation',
          'The future of AI-powered productivity tools',
          ...baseSuggestions.slice(0, 2)
        ])
      } else if (topics.includes('business') || topics.includes('startup')) {
        setSuggestions([
          'Startup funding trends in Q1 2025',
          'How AI is disrupting traditional business models',
          'Remote-first companies: Lessons learned',
          ...baseSuggestions.slice(0, 2)
        ])
      } else {
        setSuggestions(baseSuggestions.slice(0, 5))
      }
    } else {
      setSuggestions(baseSuggestions.slice(0, 5))
    }
  }

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black mb-2">
              {getTimeOfDay()}, {user?.email?.split('@')[0] || 'there'}! 👋
            </h1>
            <p className="text-lg text-gray-600">Ready to create something amazing today?</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Your Voice</p>
                  <p className="text-2xl font-bold text-black">
                    {voiceProfile ? 'Trained ✓' : 'Not Set'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {voiceProfile ? `${voiceProfile.tone || 'Professional'} tone` : 'Train your writing style'}
                  </p>
                </div>
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">{voiceProfile ? '🎤' : '⚠️'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Saved Drafts</p>
                  <p className="text-2xl font-bold text-black">{draftsCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Ready to publish</p>
                </div>
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📝</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">AI Status</p>
                  <p className="text-2xl font-bold text-black">Ready</p>
                  <p className="text-xs text-gray-500 mt-1">GPT-4 powered</p>
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🤖</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Content Suggestions */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold flex items-center">
                    <span className="mr-2">💡</span>
                    AI Content Suggestions
                  </h2>
                  <button
                    onClick={() => generateSuggestions(voiceProfile)}
                    className="text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-lg transition-colors"
                  >
                    Refresh
                  </button>
                </div>
                <p className="text-purple-100 mb-4 text-sm">
                  {voiceProfile ? `Based on your interests in ${voiceProfile.topics}` : 'Popular topics trending right now'}
                </p>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => router.push(`/ai-drafts?topic=${encodeURIComponent(suggestion)}`)}
                      className="w-full block bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm rounded-lg p-4 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{suggestion}</p>
                          <p className="text-xs text-purple-200 mt-1">Click to generate newsletter</p>
                        </div>
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Create */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-black mb-4">Quick Create</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    href="/ai-drafts"
                    className="group p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
                        🤖
                      </div>
                      <div>
                        <h3 className="font-bold text-black group-hover:text-purple-700">AI Newsletter</h3>
                        <p className="text-xs text-gray-500">GPT-4 powered</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Generate personalized newsletters with your voice</p>
                  </Link>

                  <Link
                    href="/linkedin"
                    className="group p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xl">
                        💼
                      </div>
                      <div>
                        <h3 className="font-bold text-black group-hover:text-blue-700">LinkedIn Post</h3>
                        <p className="text-xs text-gray-500">6 post types</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Create engaging LinkedIn content instantly</p>
                  </Link>

                  <Link
                    href="/templates"
                    className="group p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white text-xl">
                        📋
                      </div>
                      <div>
                        <h3 className="font-bold text-black group-hover:text-green-700">Templates</h3>
                        <p className="text-xs text-gray-500">4 designs</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Start with professional templates</p>
                  </Link>

                  <Link
                    href="/trends"
                    className="group p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-xl">
                        📊
                      </div>
                      <div>
                        <h3 className="font-bold text-black group-hover:text-orange-700">Trending Topics</h3>
                        <p className="text-xs text-gray-500">Real-time data</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Browse trending news and topics</p>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Voice Profile Status */}
              {!voiceProfile && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <span className="text-3xl">⚠️</span>
                    <div>
                      <h3 className="font-bold text-black mb-2">Train Your Voice</h3>
                      <p className="text-sm text-gray-700 mb-4">
                        Set up your voice profile to get personalized AI-generated content that matches your writing style.
                      </p>
                      <Link
                        href="/settings?tab=voice"
                        className="block w-full bg-yellow-600 hover:bg-yellow-700 text-white text-center py-2 rounded-lg font-medium transition-colors"
                      >
                        Setup Voice Profile
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-black mb-4 flex items-center">
                  <span className="mr-2">⚡</span>
                  Quick Links
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/drafts-library"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">📝</span>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">My Drafts</span>
                    </div>
                    <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">{draftsCount}</span>
                  </Link>
                  <Link
                    href="/community"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🌍</span>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">Community</span>
                    </div>
                  </Link>
                  <Link
                    href="/challenges"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">🏆</span>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">Challenges</span>
                    </div>
                  </Link>
                  <Link
                    href="/analytics"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">📈</span>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600">Analytics</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* What's New */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="font-bold mb-2 flex items-center">
                  <span className="mr-2">🚀</span>
                  What's New
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2">✨</span>
                    <span>LinkedIn post generator with 6 post types</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✨</span>
                    <span>Voice profile with persistent storage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✨</span>
                    <span>15 detailed trending topics</span>
                  </li>
                </ul>
                <Link
                  href="/roadmap"
                  className="block w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-center py-2 rounded-lg font-medium transition-colors mt-4"
                >
                  View Roadmap
                </Link>
              </div>

              {/* Tips */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-black mb-3 flex items-center">
                  <span className="mr-2">💡</span>
                  Pro Tips
                </h3>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    <span>Train your voice profile for better AI results</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    <span>Use trends page for fresh content ideas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    <span>Save drafts early and iterate</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    <span>Check LinkedIn preview before posting</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
