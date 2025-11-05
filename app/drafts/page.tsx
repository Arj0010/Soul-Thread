'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'

export default function DraftsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState('')
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

  const generateNewsletter = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const data = await response.json()
      if (data.draft) {
        setDraft(data.draft)
      } else {
        alert('Failed to generate draft')
      }
    } catch (error) {
      console.error('Error generating draft:', error)
      alert('Error generating draft')
    } finally {
      setGenerating(false)
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
          content: draft
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-black mb-8">Newsletter Drafts</h1>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-black">Create New Draft</h2>
              <button
                onClick={generateNewsletter}
                disabled={generating}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate Newsletter'}
              </button>
            </div>

            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Click 'Generate Newsletter' to create a draft, or start typing your own content..."
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

          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-black mb-3">Tips for Great Newsletters</h2>
            <ul className="text-black space-y-2">
              <li>• Start with a compelling subject line</li>
              <li>• Use your voice profile to maintain consistency</li>
              <li>• Include trending topics to stay relevant</li>
              <li>• Keep paragraphs short and scannable</li>
              <li>• End with a clear call-to-action</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
