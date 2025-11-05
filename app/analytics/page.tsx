'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import { analyzeDrafts, AnalyticsData } from '@/lib/analyticsUtils'

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadAnalytics = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/')
        return
      }
      setUser(currentUser)

      // Fetch all user drafts
      const { data: drafts, error } = await supabase
        .from('drafts')
        .select('id, content, created_at')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching drafts:', error)
      } else {
        const analyticsData = analyzeDrafts(drafts || [])
        setAnalytics(analyticsData)
      }

      setLoading(false)
    }

    loadAnalytics()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-black mb-4">Analytics</h1>
            <p className="text-gray-600">No drafts found. Create your first draft to see analytics!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-8">Writing Analytics</h1>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total Drafts</div>
              <div className="text-3xl font-bold text-purple-600">{analytics.totalDrafts}</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Avg Word Count</div>
              <div className="text-3xl font-bold text-blue-600">{analytics.avgWordCount}</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total Words</div>
              <div className="text-3xl font-bold text-green-600">{analytics.totalWords.toLocaleString()}</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Longest Draft</div>
              <div className="text-3xl font-bold text-orange-600">{analytics.longestDraft}</div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Used Words */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-black mb-4">Most Used Words</h2>
              {analytics.mostUsedWords.length > 0 ? (
                <div className="space-y-3">
                  {analytics.mostUsedWords.map((item, idx) => {
                    const maxCount = analytics.mostUsedWords[0].count
                    const percentage = (item.count / maxCount) * 100
                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-black">{item.word}</span>
                          <span className="text-gray-600">{item.count}x</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>

            {/* Drafts by Month */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-black mb-4">Drafts by Month</h2>
              {analytics.draftsByMonth.length > 0 ? (
                <div className="space-y-3">
                  {analytics.draftsByMonth.map((item, idx) => {
                    const maxCount = Math.max(...analytics.draftsByMonth.map(d => d.count))
                    const percentage = (item.count / maxCount) * 100
                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-black">{item.month}</span>
                          <span className="text-gray-600">{item.count} drafts</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>
          </div>

          {/* Additional Stats */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black mb-4">Writing Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-l-4 border-purple-600 pl-4">
                <div className="text-sm text-gray-600">Shortest Draft</div>
                <div className="text-2xl font-bold text-black">{analytics.shortestDraft} words</div>
              </div>
              <div className="border-l-4 border-blue-600 pl-4">
                <div className="text-sm text-gray-600">Longest Draft</div>
                <div className="text-2xl font-bold text-black">{analytics.longestDraft} words</div>
              </div>
              <div className="border-l-4 border-green-600 pl-4">
                <div className="text-sm text-gray-600">Words per Draft</div>
                <div className="text-2xl font-bold text-black">{analytics.avgWordCount} avg</div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">About Analytics</h3>
            <p className="text-sm text-purple-800">
              All analytics are computed client-side from your drafts. No external tracking or data collection is performed.
              Keep writing to see your progress grow!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
