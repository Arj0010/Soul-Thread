'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import Badge from '@/components/Badge'
import Link from 'next/link'

interface UserProfile {
  username: string
  bio: string
  avatar_url: string
}

interface UserStats {
  streak_count: number
  total_drafts: number
  total_upvotes: number
  badges: string[]
}

export default function ProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [publicDrafts, setPublicDrafts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    const user = await getCurrentUser()
    if (!user) {
      router.push('/')
      return
    }
    setCurrentUser(user)

    // Fetch user profile
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('username, bio, avatar_url')
      .eq('user_id', userId)
      .single()

    setProfile(profileData || { username: 'Anonymous', bio: '', avatar_url: '' })

    // Fetch user stats
    const { data: statsData } = await supabase
      .from('user_stats')
      .select('streak_count, total_drafts, total_upvotes, badges')
      .eq('user_id', userId)
      .single()

    setStats(statsData || { streak_count: 0, total_drafts: 0, total_upvotes: 0, badges: [] })

    // Fetch public drafts
    const { data: draftsData } = await supabase
      .from('drafts')
      .select('id, title, content, upvotes, created_at')
      .eq('user_id', userId)
      .eq('public', true)
      .order('created_at', { ascending: false })
      .limit(10)

    setPublicDrafts(draftsData || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow p-8 mb-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-purple-600 text-white flex items-center justify-center text-4xl font-bold">
                {profile?.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-black mb-2">
                  @{profile?.username || 'anonymous'}
                </h1>
                <p className="text-gray-600 mb-4">{profile?.bio || 'No bio yet'}</p>

                {/* Stats */}
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="font-bold text-black">{stats?.total_drafts || 0}</span>
                    <span className="text-gray-600 ml-1">Drafts</span>
                  </div>
                  <div>
                    <span className="font-bold text-black">{stats?.total_upvotes || 0}</span>
                    <span className="text-gray-600 ml-1">Upvotes</span>
                  </div>
                  <div>
                    <span className="font-bold text-black">{stats?.streak_count || 0}</span>
                    <span className="text-gray-600 ml-1">Day Streak</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            {stats && stats.badges && stats.badges.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h2 className="text-lg font-semibold text-black mb-3">Badges</h2>
                <div className="flex flex-wrap gap-2">
                  {stats.badges.map((badge, idx) => (
                    <Badge key={idx} type={badge} size="md" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Public Drafts */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-black mb-6">Public Drafts</h2>
            {publicDrafts.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No public drafts yet.</p>
            ) : (
              <div className="space-y-4">
                {publicDrafts.map(draft => (
                  <div key={draft.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-black">
                        {draft.title || 'Untitled Draft'}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span>▲</span>
                        <span>{draft.upvotes}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                      {draft.content.substring(0, 200)}...
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(draft.created_at).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/drafts/${draft.id}`}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
