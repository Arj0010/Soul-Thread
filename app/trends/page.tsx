'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import localTrends from '@/data/trends.json'

interface Trend {
  title: string
  summary: string
  url: string
  source: string
}

export default function TrendsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [trends, setTrends] = useState<Trend[]>(localTrends)
  const [fetchingLive, setFetchingLive] = useState(false)
  const [selectedSource, setSelectedSource] = useState<string>('all')
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

  const fetchLiveTrends = async () => {
    setFetchingLive(true)
    try {
      // Fetch from Reddit r/technology
      const redditTech = await fetch('https://www.reddit.com/r/technology/top.json?limit=5')
        .then(r => r.json())
        .then(data => data.data.children.map((item: any) => ({
          title: item.data.title,
          summary: item.data.selftext?.substring(0, 150) || 'View discussion on Reddit',
          url: `https://reddit.com${item.data.permalink}`,
          source: 'reddit-tech'
        })))
        .catch(() => [])

      // Fetch from Reddit r/Fitness
      const redditFitness = await fetch('https://www.reddit.com/r/Fitness/top.json?limit=5')
        .then(r => r.json())
        .then(data => data.data.children.map((item: any) => ({
          title: item.data.title,
          summary: item.data.selftext?.substring(0, 150) || 'View discussion on Reddit',
          url: `https://reddit.com${item.data.permalink}`,
          source: 'reddit-fitness'
        })))
        .catch(() => [])

      // Fetch from Hacker News
      const hnTopStories = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty')
        .then(r => r.json())
        .then(ids => ids.slice(0, 5))
        .catch(() => [])

      const hnTrends = await Promise.all(
        hnTopStories.map((id: number) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`)
            .then(r => r.json())
            .then(item => ({
              title: item.title,
              summary: item.text?.substring(0, 150) || 'Read more on Hacker News',
              url: item.url || `https://news.ycombinator.com/item?id=${id}`,
              source: 'hackernews'
            }))
            .catch(() => null)
        )
      ).then(items => items.filter(Boolean))

      // Combine all sources
      const allTrends = [...localTrends, ...redditTech, ...redditFitness, ...hnTrends]
      setTrends(allTrends)
    } catch (error) {
      console.error('Error fetching live trends:', error)
    } finally {
      setFetchingLive(false)
    }
  }

  const filteredTrends = selectedSource === 'all'
    ? trends
    : trends.filter(t => t.source === selectedSource)

  const copyToNewsletter = (trend: Trend) => {
    const newsletterText = `**${trend.title}**\n\n${trend.summary}\n\n[Read more](${trend.url})`
    navigator.clipboard.writeText(newsletterText)
    alert('Copied to clipboard! Paste into your newsletter draft.')
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-black">Trending Topics</h1>
            <button
              onClick={fetchLiveTrends}
              disabled={fetchingLive}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {fetchingLive ? 'Fetching...' : 'Fetch Live Trends'}
            </button>
          </div>

          <div className="mb-6 flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedSource('all')}
              className={`px-4 py-2 rounded-lg ${selectedSource === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-black'}`}
            >
              All Sources
            </button>
            <button
              onClick={() => setSelectedSource('local')}
              className={`px-4 py-2 rounded-lg ${selectedSource === 'local' ? 'bg-purple-600 text-white' : 'bg-white text-black'}`}
            >
              Local
            </button>
            <button
              onClick={() => setSelectedSource('reddit-tech')}
              className={`px-4 py-2 rounded-lg ${selectedSource === 'reddit-tech' ? 'bg-purple-600 text-white' : 'bg-white text-black'}`}
            >
              Reddit Tech
            </button>
            <button
              onClick={() => setSelectedSource('reddit-fitness')}
              className={`px-4 py-2 rounded-lg ${selectedSource === 'reddit-fitness' ? 'bg-purple-600 text-white' : 'bg-white text-black'}`}
            >
              Reddit Fitness
            </button>
            <button
              onClick={() => setSelectedSource('hackernews')}
              className={`px-4 py-2 rounded-lg ${selectedSource === 'hackernews' ? 'bg-purple-600 text-white' : 'bg-white text-black'}`}
            >
              Hacker News
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrends.map((trend, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="mb-2">
                  <span className="text-xs font-semibold text-purple-600 uppercase">{trend.source}</span>
                </div>
                <h2 className="text-xl font-semibold text-black mb-3">
                  {trend.title}
                </h2>
                <p className="text-gray-700 mb-4 text-sm line-clamp-3">
                  {trend.summary}
                </p>
                <div className="flex justify-between items-center gap-2">
                  {trend.url && !trend.url.includes('example.com') ? (
                    <a
                      href={trend.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-700 underline"
                    >
                      Read more →
                    </a>
                  ) : (
                    <span className="text-xs text-gray-500 italic">
                      Source unavailable
                    </span>
                  )}
                  <button
                    onClick={() => copyToNewsletter(trend)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTrends.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600">No trends found for this filter.</p>
            </div>
          )}

          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black mb-3">About Trend Feed</h2>
            <p className="text-gray-700">
              Discover trending topics from multiple free sources including Reddit (r/technology, r/Fitness)
              and Hacker News. Click "Fetch Live Trends" to get real-time data, or browse local curated trends.
              Copy any trend to use in your newsletter drafts.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
