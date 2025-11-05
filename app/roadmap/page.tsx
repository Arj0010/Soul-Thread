'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Navbar from '@/components/Navbar'

export default function RoadmapPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
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
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-black mb-4">What's Next for SoulThread? 🚀</h1>
            <p className="text-lg text-gray-600">Exciting features and improvements coming soon to enhance your newsletter creation experience</p>
          </div>

          {/* Current Status */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6 mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
              <span className="text-3xl mr-3">✅</span>
              What's Already Built
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <h3 className="font-semibold text-black">AI Newsletter Generation</h3>
                  <p className="text-sm text-gray-700">GPT-4 powered newsletters with voice matching</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <h3 className="font-semibold text-black">LinkedIn Post Generator</h3>
                  <p className="text-sm text-gray-700">6 post types with character optimization</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <h3 className="font-semibold text-black">Voice Profile Training</h3>
                  <p className="text-sm text-gray-700">Persistent writing style with analytics</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <h3 className="font-semibold text-black">Template System</h3>
                  <p className="text-sm text-gray-700">4 professional templates with examples</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <h3 className="font-semibold text-black">Trends Aggregation</h3>
                  <p className="text-sm text-gray-700">Real-time news from Reddit, HN, and more</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-600 text-xl">✓</span>
                <div>
                  <h3 className="font-semibold text-black">Drafts Management</h3>
                  <p className="text-sm text-gray-700">Save, organize, and retrieve your work</p>
                </div>
              </div>
            </div>
          </div>

          {/* High Priority - Next Up */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-purple-600">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
              <span className="text-3xl mr-3">🎯</span>
              High Priority - Next Up
            </h2>
            <div className="space-y-6">
              <div className="border-l-2 border-purple-300 pl-4 py-2">
                <h3 className="font-bold text-lg text-black mb-2">📧 Email Sending Integration</h3>
                <p className="text-gray-700 mb-3">Send newsletters directly from SoulThread using SendGrid, Mailchimp, or Resend API. Schedule sends and track open rates.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">High Impact</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">2-3 weeks</span>
                </div>
              </div>

              <div className="border-l-2 border-purple-300 pl-4 py-2">
                <h3 className="font-bold text-lg text-black mb-2">📊 Advanced Analytics Dashboard</h3>
                <p className="text-gray-700 mb-3">Track opens, clicks, engagement rates, subscriber growth, and best performing content. Real-time charts and insights.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">High Impact</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">3-4 weeks</span>
                </div>
              </div>

              <div className="border-l-2 border-purple-300 pl-4 py-2">
                <h3 className="font-bold text-lg text-black mb-2">👥 Subscriber Management</h3>
                <p className="text-gray-700 mb-3">Import/export subscriber lists, segment audiences, manage subscriptions, and track subscriber preferences.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">High Impact</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">2 weeks</span>
                </div>
              </div>

              <div className="border-l-2 border-purple-300 pl-4 py-2">
                <h3 className="font-bold text-lg text-black mb-2">🎨 Visual Editor Improvements</h3>
                <p className="text-gray-700 mb-3">Rich text editor with formatting toolbar, image upload, drag-and-drop layouts, and real-time preview.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">UX Enhancement</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">3 weeks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Medium Priority */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
              <span className="text-3xl mr-3">🔨</span>
              Medium Priority Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                <h3 className="font-semibold text-black mb-2">🔗 Platform Integrations</h3>
                <p className="text-sm text-gray-700 mb-2">Connect with Medium, Substack, Ghost, and WordPress for cross-posting.</p>
                <span className="text-xs text-gray-500">Est. 2-3 weeks</span>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                <h3 className="font-semibold text-black mb-2">🤖 AI Content Suggestions</h3>
                <p className="text-sm text-gray-700 mb-2">AI suggests topics based on trends, reader engagement, and your voice.</p>
                <span className="text-xs text-gray-500">Est. 1-2 weeks</span>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                <h3 className="font-semibold text-black mb-2">📅 Content Calendar</h3>
                <p className="text-sm text-gray-700 mb-2">Plan newsletters weeks in advance with drag-and-drop scheduling.</p>
                <span className="text-xs text-gray-500">Est. 2 weeks</span>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                <h3 className="font-semibold text-black mb-2">🎭 Multiple Voices/Brands</h3>
                <p className="text-sm text-gray-700 mb-2">Manage multiple voice profiles for different newsletters or clients.</p>
                <span className="text-xs text-gray-500">Est. 1 week</span>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                <h3 className="font-semibold text-black mb-2">🔍 SEO Optimization</h3>
                <p className="text-sm text-gray-700 mb-2">Optimize newsletters for search engines with meta tags and keywords.</p>
                <span className="text-xs text-gray-500">Est. 1 week</span>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                <h3 className="font-semibold text-black mb-2">📱 Mobile App</h3>
                <p className="text-sm text-gray-700 mb-2">Native iOS and Android apps for on-the-go newsletter creation.</p>
                <span className="text-xs text-gray-500">Est. 6-8 weeks</span>
              </div>
            </div>
          </div>

          {/* Future Ideas */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
              <span className="text-3xl mr-3">💡</span>
              Future Ideas & Experiments
            </h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-purple-600 text-lg">•</span>
                <div>
                  <h3 className="font-semibold text-black">AI-Powered A/B Testing</h3>
                  <p className="text-sm text-gray-700">Automatically test subject lines, content variations, and send times.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-purple-600 text-lg">•</span>
                <div>
                  <h3 className="font-semibold text-black">Voice Cloning for Audio Newsletters</h3>
                  <p className="text-sm text-gray-700">Generate audio versions of newsletters in your voice.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-purple-600 text-lg">•</span>
                <div>
                  <h3 className="font-semibold text-black">Collaboration Features</h3>
                  <p className="text-sm text-gray-700">Team workspaces, comments, and approval workflows.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-purple-600 text-lg">•</span>
                <div>
                  <h3 className="font-semibold text-black">Monetization Tools</h3>
                  <p className="text-sm text-gray-700">Paid subscriptions, sponsorships, and affiliate link management.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-purple-600 text-lg">•</span>
                <div>
                  <h3 className="font-semibold text-black">Custom Domain & Branding</h3>
                  <p className="text-sm text-gray-700">Host newsletters on your own domain with custom branding.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-purple-600 text-lg">•</span>
                <div>
                  <h3 className="font-semibold text-black">AI Image Generation</h3>
                  <p className="text-sm text-gray-700">Generate custom header images and graphics for newsletters.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Community Requests */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-purple-200 p-6 mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
              <span className="text-3xl mr-3">💬</span>
              What Do You Want to See?
            </h2>
            <p className="text-gray-700 mb-4">
              Your feedback shapes the product roadmap! Let us know what features would make SoulThread more valuable for you.
            </p>
            <div className="space-y-3">
              <a
                href="/community"
                className="block w-full md:w-auto text-center bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Share Your Ideas in Community
              </a>
            </div>
          </div>

          {/* Technical Improvements */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center">
              <span className="text-3xl mr-3">⚙️</span>
              Behind the Scenes Improvements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">Performance optimization for large drafts</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">Better error handling and user feedback</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">Enhanced security and data encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">Offline mode and auto-save</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">API rate limiting and caching</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span className="text-gray-700">Accessibility improvements (WCAG 2.1)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
