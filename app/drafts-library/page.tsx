'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function DraftsLibraryPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const statusOptions = [
    { value: '', label: 'All Status' },
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
    if (user) {
      fetchDrafts()
    }
  }, [user, pagination.page, search, statusFilter])

  const fetchDrafts = async () => {
    try {
      const params = new URLSearchParams({
        userId: user.id,
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/drafts?${params}`)
      const data = await response.json()

      if (data.drafts) {
        setDrafts(data.drafts)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching drafts:', error)
      alert('Failed to fetch drafts')
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleSelectDraft = (draftId: string) => {
    setSelectedDrafts(prev => 
      prev.includes(draftId) 
        ? prev.filter(id => id !== draftId)
        : [...prev, draftId]
    )
  }

  const handleSelectAll = () => {
    if (selectedDrafts.length === drafts.length) {
      setSelectedDrafts([])
    } else {
      setSelectedDrafts(drafts.map(draft => draft.id))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedDrafts.length === 0) return

    setDeleting(true)
    try {
      const deletePromises = selectedDrafts.map(draftId =>
        fetch(`/api/drafts?id=${draftId}`, { method: 'DELETE' })
      )

      await Promise.all(deletePromises)
      setSelectedDrafts([])
      setShowDeleteConfirm(false)
      fetchDrafts()
      alert(`${selectedDrafts.length} draft(s) deleted successfully`)
    } catch (error) {
      console.error('Error deleting drafts:', error)
      alert('Failed to delete drafts')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteSingle = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return

    try {
      const response = await fetch(`/api/drafts?id=${draftId}`, { method: 'DELETE' })
      
      if (response.ok) {
        fetchDrafts()
        alert('Draft deleted successfully')
      } else {
        alert('Failed to delete draft')
      }
    } catch (error) {
      console.error('Error deleting draft:', error)
      alert('Failed to delete draft')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'archived': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getWordCount = (content: string) => {
    return content.split(' ').length
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
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-black">Draft Library</h1>
            <div className="text-sm text-black">
              {pagination.total} total drafts
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search drafts..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchDrafts}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedDrafts.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-black">
                  {selectedDrafts.length} draft(s) selected
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Drafts List */}
          <div className="bg-white rounded-lg shadow">
            {drafts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No drafts found</p>
                {search || statusFilter ? (
                  <button
                    onClick={() => {
                      setSearch('')
                      setStatusFilter('')
                    }}
                    className="mt-2 text-purple-600 hover:text-purple-700"
                  >
                    Clear filters
                  </button>
                ) : (
                  <p className="mt-2">Create your first draft to get started</p>
                )}
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="px-6 py-3 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedDrafts.length === drafts.length && drafts.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </div>
                    <div className="col-span-4 font-medium text-black">Title</div>
                    <div className="col-span-2 font-medium text-black">Status</div>
                    <div className="col-span-2 font-medium text-black">Created</div>
                    <div className="col-span-2 font-medium text-black">Words</div>
                    <div className="col-span-1 font-medium text-black">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {drafts.map(draft => (
                    <div key={draft.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-1">
                          <input
                            type="checkbox"
                            checked={selectedDrafts.includes(draft.id)}
                            onChange={() => handleSelectDraft(draft.id)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                        </div>
                        <div className="col-span-4">
                          <div className="font-medium text-black">{draft.title}</div>
                          <div className="text-sm text-gray-600 truncate">
                            {draft.content.substring(0, 100)}...
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(draft.status)}`}>
                            {draft.status}
                          </span>
                        </div>
                        <div className="col-span-2 text-sm text-black">
                          {formatDate(draft.created_at)}
                        </div>
                        <div className="col-span-2 text-sm text-black">
                          {getWordCount(draft.content)}
                        </div>
                        <div className="col-span-1">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => router.push(`/drafts/${draft.id}`)}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSingle(draft.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-black">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="px-3 py-1 text-sm text-black">
                          Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-black mb-4">Confirm Deletion</h3>
            <p className="text-black mb-6">
              Are you sure you want to delete {selectedDrafts.length} draft(s)? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

