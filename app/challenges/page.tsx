'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import Badge from '@/components/Badge'
import challengesData from '@/data/challenges.json'
import promptsData from '@/data/prompts.json'

interface Challenge {
  id: string
  title: string
  description: string
  type: string
  goal: number
  reward: string
}

interface UserStats {
  streak_count: number
  total_drafts: number
  total_upvotes: number
  badges: string[]
  last_active: string
}

export default function ChallengesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [dailyPrompt, setDailyPrompt] = useState<any>(null)
  const [quote, setQuote] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    loadChallenges()
    loadDailyPrompt()
    loadQuote()
  }, [router])

  const loadChallenges = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/')
      return
    }
    setUser(currentUser)

    // Fetch or create user stats
    let { data: statsData, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', currentUser.id)
      .single()

    if (error || !statsData) {
      // Create initial stats
      const { data: newStats } = await supabase
        .from('user_stats')
        .insert({
          user_id: currentUser.id,
          streak_count: 0,
          total_drafts: 0,
          total_upvotes: 0,
          badges: [],
          last_active: new Date().toISOString().split('T')[0]
        })
        .select()
        .single()

      statsData = newStats
    }

    // Update streak if needed
    if (statsData) {
      const lastActive = new Date(statsData.last_active)
      const today = new Date()
      const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === 1) {
        // Increment streak
        statsData.streak_count += 1
        await supabase
          .from('user_stats')
          .update({
            streak_count: statsData.streak_count,
            last_active: today.toISOString().split('T')[0]
          })
          .eq('user_id', currentUser.id)
      } else if (daysDiff > 1) {
        // Reset streak
        statsData.streak_count = 1
        await supabase
          .from('user_stats')
          .update({
            streak_count: 1,
            last_active: today.toISOString().split('T')[0]
          })
          .eq('user_id', currentUser.id)
      }

      setStats(statsData)
      checkAndAwardBadges(statsData)
    }

    setLoading(false)
  }

  const checkAndAwardBadges = async (statsData: UserStats) => {
    const newBadges: string[] = [...(statsData.badges || [])]

    challengesData.forEach((challenge: Challenge) => {
      if (!newBadges.includes(challenge.reward)) {
        let achieved = false

        if (challenge.type === 'creation' && statsData.total_drafts >= challenge.goal) {
          achieved = true
        } else if (challenge.type === 'streak' && statsData.streak_count >= challenge.goal) {
          achieved = true
        } else if (challenge.type === 'social' && statsData.total_upvotes >= challenge.goal) {
          achieved = true
        }

        if (achieved) {
          newBadges.push(challenge.reward)
        }
      }
    })

    if (newBadges.length > (statsData.badges?.length || 0)) {
      await supabase
        .from('user_stats')
        .update({ badges: newBadges })
        .eq('user_id', user.id)

      setStats({ ...statsData, badges: newBadges })
    }
  }

  const loadDailyPrompt = () => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    const promptIndex = dayOfYear % promptsData.length
    setDailyPrompt(promptsData[promptIndex])
  }

  const loadQuote = async () => {
    try {
      const response = await fetch('https://zenquotes.io/api/today')
      const data = await response.json()
      if (data && data[0]) {
        setQuote(`"${data[0].q}" - ${data[0].a}`)
      }
    } catch (error) {
      setQuote('"The only way to do great work is to love what you do." - Steve Jobs')
    }
  }

  const getChallengeProgress = (challenge: Challenge): number => {
    if (!stats) return 0

    let current = 0
    if (challenge.type === 'creation') current = stats.total_drafts
    else if (challenge.type === 'streak') current = stats.streak_count
    else if (challenge.type === 'social') current = stats.total_upvotes

    return Math.min((current / challenge.goal) * 100, 100)
  }

  const isChallengeCompleted = (challenge: Challenge): boolean => {
    return stats?.badges?.includes(challenge.reward) || false
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading challenges...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-8">Challenges & Gamification</h1>

          {/* Streak & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg shadow p-6 text-white">
              <div className="text-sm opacity-90 mb-1">Current Streak</div>
              <div className="text-4xl font-bold">{stats?.streak_count || 0} 🔥</div>
              <div className="text-sm opacity-90 mt-2">Keep it going!</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg shadow p-6 text-white">
              <div className="text-sm opacity-90 mb-1">Total Drafts</div>
              <div className="text-4xl font-bold">{stats?.total_drafts || 0} ✍️</div>
              <div className="text-sm opacity-90 mt-2">Newsletters created</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow p-6 text-white">
              <div className="text-sm opacity-90 mb-1">Total Upvotes</div>
              <div className="text-4xl font-bold">{stats?.total_upvotes || 0} ⭐</div>
              <div className="text-sm opacity-90 mt-2">Community love</div>
            </div>
          </div>

          {/* Daily Prompt & Quote */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-black mb-3">Daily Writing Prompt</h2>
              <p className="text-gray-700 mb-2">{dailyPrompt?.prompt}</p>
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {dailyPrompt?.category}
              </span>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-black mb-3">Quote of the Day</h2>
              <p className="text-gray-700 italic">{quote}</p>
            </div>
          </div>

          {/* Earned Badges */}
          {stats && stats.badges && stats.badges.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">Your Badges ({stats.badges.length})</h2>
              <div className="flex flex-wrap gap-3">
                {stats.badges.map((badge, idx) => (
                  <Badge key={idx} type={badge} size="lg" />
                ))}
              </div>
            </div>
          )}

          {/* Challenges */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-black mb-6">Active Challenges</h2>
            <div className="space-y-6">
              {challengesData.map((challenge: Challenge) => {
                const progress = getChallengeProgress(challenge)
                const completed = isChallengeCompleted(challenge)

                return (
                  <div
                    key={challenge.id}
                    className={`border rounded-lg p-4 ${completed ? 'bg-green-50 border-green-300' : 'border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-black mb-1">
                          {challenge.title}
                          {completed && <span className="ml-2 text-green-600">✓</span>}
                        </h3>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                      </div>
                      {completed && <Badge type={challenge.reward} size="md" />}
                    </div>

                    {!completed && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">How Challenges Work</h3>
            <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
              <li>Complete challenges to earn badges and level up</li>
              <li>Maintain daily streaks by creating drafts regularly</li>
              <li>Get upvotes from the community to unlock social badges</li>
              <li>All progress is tracked automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
