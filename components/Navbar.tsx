'use client'

import Link from 'next/link'
import { signOut, getCurrentUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

export default function Navbar() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const getInitials = (email: string | undefined) => {
    if (!email) return 'U'
    return email.charAt(0).toUpperCase()
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="text-xl font-bold text-purple-600">
            SoulThread
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-6 items-center flex-1 justify-center">
            <Link href="/dashboard" className="text-sm text-black hover:text-purple-600 font-medium transition-colors">
              Dashboard
            </Link>
            <Link href="/ai-drafts" className="text-sm text-black hover:text-purple-600 font-medium transition-colors">
              AI Newsletter
            </Link>
            <Link href="/linkedin" className="text-sm text-black hover:text-purple-600 font-medium transition-colors">
              LinkedIn
            </Link>
            <Link href="/templates" className="text-sm text-black hover:text-purple-600 font-medium transition-colors">
              Templates
            </Link>
            <Link href="/trends" className="text-sm text-black hover:text-purple-600 font-medium transition-colors">
              Trends
            </Link>
            <Link href="/community" className="text-sm text-black hover:text-purple-600 font-medium transition-colors">
              Community
            </Link>
            <Link href="/analytics" className="text-sm text-black hover:text-purple-600 font-medium transition-colors">
              Analytics
            </Link>
          </div>

          {/* Profile Dropdown - Desktop */}
          <div className="hidden md:block relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 text-black hover:text-purple-600 focus:outline-none"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-semibold shadow-md hover:shadow-lg transition-shadow">
                {getInitials(user?.email)}
              </div>
              <svg className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold">
                      {getInitials(user?.email)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-black truncate">{user?.email || 'User'}</p>
                      <p className="text-xs text-gray-500">Manage your account</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    href="/settings?tab=account"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-black hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    <span className="mr-3 text-lg">👤</span>
                    <span>Profile Settings</span>
                  </Link>
                  <Link
                    href="/settings?tab=voice"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-black hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    <span className="mr-3 text-lg">🎤</span>
                    <span>Voice Trainer</span>
                  </Link>
                  <Link
                    href="/drafts-library"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-black hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    <span className="mr-3 text-lg">📝</span>
                    <span>My Drafts</span>
                  </Link>
                  <Link
                    href="/challenges"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-black hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    <span className="mr-3 text-lg">🏆</span>
                    <span>Challenges</span>
                  </Link>
                </div>

                {/* Sign Out */}
                <div className="border-t border-gray-200 pt-2">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false)
                      handleSignOut()
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="mr-3 text-lg">🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-black hover:text-purple-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {/* User Info Mobile */}
            <div className="flex items-center space-x-3 px-2 py-3 border-b border-gray-200 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold">
                {getInitials(user?.email)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black truncate">{user?.email || 'User'}</p>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="space-y-1">
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="block text-black hover:bg-purple-50 hover:text-purple-600 py-2 px-2 rounded transition-colors">
                Dashboard
              </Link>
              <Link href="/ai-drafts" onClick={() => setIsMenuOpen(false)} className="block text-black hover:bg-purple-50 hover:text-purple-600 py-2 px-2 rounded transition-colors">
                AI Newsletter
              </Link>
              <Link href="/linkedin" onClick={() => setIsMenuOpen(false)} className="block text-black hover:bg-purple-50 hover:text-purple-600 py-2 px-2 rounded transition-colors">
                LinkedIn Posts
              </Link>
              <Link href="/templates" onClick={() => setIsMenuOpen(false)} className="block text-black hover:bg-purple-50 hover:text-purple-600 py-2 px-2 rounded transition-colors">
                Templates
              </Link>
              <Link href="/trends" onClick={() => setIsMenuOpen(false)} className="block text-black hover:bg-purple-50 hover:text-purple-600 py-2 px-2 rounded transition-colors">
                Trends
              </Link>
              <Link href="/community" onClick={() => setIsMenuOpen(false)} className="block text-black hover:bg-purple-50 hover:text-purple-600 py-2 px-2 rounded transition-colors">
                Community
              </Link>
              <Link href="/analytics" onClick={() => setIsMenuOpen(false)} className="block text-black hover:bg-purple-50 hover:text-purple-600 py-2 px-2 rounded transition-colors">
                Analytics
              </Link>
            </div>

            {/* Profile Section Mobile */}
            <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
              <p className="text-xs font-semibold text-gray-500 px-2 py-1">PROFILE</p>
              <Link href="/settings?tab=account" onClick={() => setIsMenuOpen(false)} className="flex items-center text-black hover:bg-purple-50 hover:text-purple-600 py-2 px-2 rounded transition-colors">
                <span className="mr-2">👤</span> Profile Settings
              </Link>
              <Link href="/settings?tab=voice" onClick={() => setIsMenuOpen(false)} className="flex items-center text-black hover:bg-purple-50 hover:text-purple-600 py-2 px-2 rounded transition-colors">
                <span className="mr-2">🎤</span> Voice Trainer
              </Link>
              <Link href="/drafts-library" onClick={() => setIsMenuOpen(false)} className="flex items-center text-black hover:bg-purple-50 hover:text-purple-600 py-2 px-2 rounded transition-colors">
                <span className="mr-2">📝</span> My Drafts
              </Link>
              <Link href="/challenges" onClick={() => setIsMenuOpen(false)} className="flex items-center text-black hover:bg-purple-50 hover:text-purple-600 py-2 px-2 rounded transition-colors">
                <span className="mr-2">🏆</span> Challenges
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  handleSignOut()
                }}
                className="flex items-center w-full text-red-600 hover:bg-red-50 py-2 px-2 rounded transition-colors"
              >
                <span className="mr-2">🚪</span> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
