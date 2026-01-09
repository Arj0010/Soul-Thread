'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

interface PublicDraft {
  id: string
  title: string
  content: string
  upvotes: number
  user_id: string
  created_at: string
  user_profiles?: {
    username: string
  }
  hasUpvoted?: boolean
}

export default function CommunityPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [publicDrafts, setPublicDrafts] = useState<PublicDraft[]>([])
  const [myDrafts, setMyDrafts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'feed' | 'my-drafts'>('feed')
  const router = useRouter()

  useEffect(() => {
    loadCommunityData()
  }, [router])

  const loadCommunityData = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/')
      return
    }
    setUser(currentUser)

    // Fetch public drafts with user profiles
    const { data: drafts, error } = await supabase
      .from('drafts')
      .select(`
        id,
        title,
        content,
        upvotes,
        user_id,
        created_at,
        user_profiles (username)
      `)
      .eq('public', true)
      .order('upvotes', { ascending: false })
      .limit(50)

    if (!error && drafts) {
      // Check which drafts the current user has upvoted
      const { data: upvotes } = await supabase
        .from('draft_upvotes')
        .select('draft_id')
        .eq('user_id', currentUser.id)

      const upvotedIds = new Set(upvotes?.map(u => u.draft_id) || [])

      const draftsWithUpvotes = drafts.map((draft: any) => ({
        id: draft.id,
        title: draft.title,
        content: draft.content,
        upvotes: draft.upvotes,
        user_id: draft.user_id,
        created_at: draft.created_at,
        user_profiles: Array.isArray(draft.user_profiles) && draft.user_profiles.length > 0
          ? { username: draft.user_profiles[0].username }
          : undefined,
        hasUpvoted: upvotedIds.has(draft.id)
      }))

      setPublicDrafts(draftsWithUpvotes)
    }

    // Fetch user's own drafts
    const { data: userDrafts } = await supabase
      .from('drafts')
      .select('id, title, content, public, upvotes, created_at')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })

    setMyDrafts(userDrafts || [])
    setLoading(false)
  }

  const togglePublish = async (draftId: string, currentPublic: boolean) => {
    const { error } = await supabase
      .from('drafts')
      .update({ public: !currentPublic })
      .eq('id', draftId)

    if (!error) {
      loadCommunityData()
      alert(currentPublic ? 'Draft unpublished' : 'Draft published to community!')
    } else {
      alert('Error updating draft: ' + error.message)
    }
  }

  const handleUpvote = async (draftId: string, hasUpvoted: boolean) => {
    if (hasUpvoted) {
      // Remove upvote
      const { error } = await supabase
        .from('draft_upvotes')
        .delete()
        .eq('draft_id', draftId)
        .eq('user_id', user.id)

      if (!error) {
        loadCommunityData()
      }
    } else {
      // Add upvote
      const { error } = await supabase
        .from('draft_upvotes')
        .insert({ draft_id: draftId, user_id: user.id })

      if (!error) {
        loadCommunityData()
      }
    }
  }

  const addComment = async (draftId: string) => {
    const content = prompt('Enter your comment:')
    if (!content) return

    const { error } = await supabase
      .from('comments')
      .insert({ draft_id: draftId, user_id: user.id, content })

    if (!error) {
      alert('Comment added!')
    } else {
      alert('Error adding comment: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading community...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-8">Creator Community</h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'feed'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Public Feed ({publicDrafts.length})
            </button>
            <button
              onClick={() => setActiveTab('my-drafts')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'my-drafts'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Drafts ({myDrafts.length})
            </button>
          </div>

          {/* Public Feed */}
          {activeTab === 'feed' && (
            <div className="space-y-6">
              {publicDrafts.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-600">No public drafts yet. Be the first to share!</p>
                </div>
              ) : (
                publicDrafts.map(draft => (
                  <div key={draft.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-black mb-2">
                          {draft.title || 'Untitled Draft'}
                        </h2>
                        <Link
                          href={`/profile/${draft.user_id}`}
                          className="text-sm text-purple-600 hover:text-purple-700"
                        >
                          @{draft.user_profiles?.username || 'anonymous'}
                        </Link>
                        <span className="text-sm text-gray-500 ml-2">
                          {new Date(draft.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpvote(draft.id, draft.hasUpvoted || false)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                            draft.hasUpvoted
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span>{draft.hasUpvoted ? '▲' : '△'}</span>
                          <span className="font-semibold">{draft.upvotes}</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {draft.content.substring(0, 300)}...
                    </p>
                    <div className="flex gap-3">
                      <Link
                        href={`/drafts/${draft.id}`}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Read More
                      </Link>
                      <button
                        onClick={() => addComment(draft.id)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* My Drafts */}
          {activeTab === 'my-drafts' && (
            <div className="space-y-6">
              {myDrafts.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <p className="text-gray-600">You haven't created any drafts yet.</p>
                  <Link
                    href="/ai-drafts"
                    className="inline-block mt-4 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Create Your First Draft
                  </Link>
                </div>
              ) : (
                myDrafts.map(draft => (
                  <div key={draft.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-black mb-2">
                          {draft.title || 'Untitled Draft'}
                        </h2>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>{new Date(draft.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            ▲ {draft.upvotes} upvotes
                          </span>
                          <span>•</span>
                          <span className={draft.public ? 'text-green-600' : 'text-gray-500'}>
                            {draft.public ? '🌍 Public' : '🔒 Private'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => togglePublish(draft.id, draft.public)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          draft.public
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {draft.public ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {draft.content.substring(0, 200)}...
                    </p>
                    <Link
                      href={`/drafts/${draft.id}`}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      View Draft
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">About Community</h3>
            <p className="text-sm text-purple-800">
              Share your best newsletters with the community! Public drafts can be upvoted and commented on by other creators.
              Click "Publish" on any of your drafts to share it with everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
