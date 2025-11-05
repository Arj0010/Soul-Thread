'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Navbar from '@/components/Navbar'

interface Draft {
  id: string
  title: string
  content: string
  status: string
  created_at: string
  updated_at?: string
}

export default function DraftEditPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('draft')
  const [hasChanges, setHasChanges] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const router = useRouter()
  const params = useParams()
  const draftId = params?.id as string

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'archived', label: 'Archived' }
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

  useEffect(() => {
    if (user && draftId) {
      fetchDraft()
    }
  }, [user, draftId])

  useEffect(() => {
    // Check for unsaved changes
    if (draft) {
      const hasTitleChanges = title !== draft.title
      const hasContentChanges = content !== draft.content
      const hasStatusChanges = status !== draft.status
      setHasChanges(hasTitleChanges || hasContentChanges || hasStatusChanges)
    }
  }, [title, content, status, draft])

  const fetchDraft = async () => {
    try {
      const response = await fetch(`/api/drafts?userId=${user.id}`)
      const data = await response.json()

      if (data.drafts) {
        const foundDraft = data.drafts.find((d: Draft) => d.id === draftId)
        if (foundDraft) {
          setDraft(foundDraft)
          setTitle(foundDraft.title)
          setContent(foundDraft.content)
          setStatus(foundDraft.status)
        } else {
          alert('Draft not found')
          router.push('/drafts-library')
        }
      }
    } catch (error) {
      console.error('Error fetching draft:', error)
      alert('Failed to fetch draft')
    }
  }

  const handleSave = async () => {
    if (!draft) return

    setSaving(true)
    try {
      const response = await fetch('/api/drafts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: draft.id,
          title,
          content,
          status
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setDraft(data.draft)
        setHasChanges(false)
        alert('Draft saved successfully')
      } else {
        alert('Failed to save draft')
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      alert('Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!draft) return

    if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/drafts?id=${draft.id}`, { method: 'DELETE' })
      
      if (response.ok) {
        alert('Draft deleted successfully')
        router.push('/drafts-library')
      } else {
        alert('Failed to delete draft')
      }
    } catch (error) {
      console.error('Error deleting draft:', error)
      alert('Failed to delete draft')
    }
  }

  const handleSendTest = () => {
    alert('Test email sent! (This is a mock - no actual email was sent)')
  }

  const handlePublish = async () => {
    if (!confirm('Are you sure you want to publish this newsletter?')) return

    setStatus('published')
    await handleSave()
    alert('Newsletter published successfully!')
  }

  const getWordCount = () => {
    return content.split(' ').length
  }

  const getCharacterCount = () => {
    return content.length
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Draft not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black">Edit Draft</h1>
              <p className="text-gray-600 mt-2">
                Created: {formatDate(draft.created_at)}
                {draft.updated_at && ` • Last updated: ${formatDate(draft.updated_at)}`}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/drafts-library')}
                className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
              >
                Back to Library
              </button>
              <button
                onClick={handleSendTest}
                disabled={!content.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Send Test
              </button>
              <button
                onClick={handlePublish}
                disabled={!content.trim() || saving}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Publish
              </button>
            </div>
          </div>

          {/* Draft Info */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter draft title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Statistics</label>
                <div className="text-sm text-black">
                  <div>Words: {getWordCount()}</div>
                  <div>Characters: {getCharacterCount()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-black">Content</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md text-black hover:bg-gray-50"
                >
                  {showVersionHistory ? 'Hide' : 'Show'} History
                </button>
              </div>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              placeholder="Enter your newsletter content..."
            />

            {/* Version History (Mock) */}
            {showVersionHistory && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-black mb-2">Version History</h3>
                <div className="space-y-2 text-sm text-black">
                  <div className="flex justify-between items-center">
                    <span>Current version</span>
                    <span>{formatDate(draft.created_at)}</span>
                  </div>
                  <div className="text-gray-500">
                    Version history feature coming soon...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-black">
                {hasChanges && (
                  <span className="text-orange-600 font-medium">You have unsaved changes</span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Draft
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          {content && (
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-black mb-4">Preview</h2>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="prose max-w-none">
                  <h1 className="text-2xl font-bold text-black mb-4">{title}</h1>
                  <div className="whitespace-pre-wrap text-black">
                    {content}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

