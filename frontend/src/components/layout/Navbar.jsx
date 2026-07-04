import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { useLayout } from '../../context/LayoutContext'
import NotificationBell from '../notifications/NotificationBell'
import { useClickOutside } from '../../hooks/useClickOutside'
import { Menu, LogOut, User, CreditCard, Shield, Moon, Sun, Search, Sparkles } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { toggleSidebar } = useLayout()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const ref = useClickOutside(() => setProfileOpen(false))
  const searchRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { setProfileOpen(false); setSearchOpen(false) }
      if (e.key === 'ArrowDown' && profileOpen) {
        e.preventDefault()
        const menu = ref.current?.querySelector('[role="menu"]')
        const items = menu?.querySelectorAll('[role="menuitem"]')
        if (items?.length) {
          const currentIndex = Array.from(items).indexOf(document.activeElement)
          const nextIndex = (currentIndex + 1) % items.length
          items[nextIndex]?.focus()
        }
      }
      if (e.key === 'ArrowUp' && profileOpen) {
        e.preventDefault()
        const menu = ref.current?.querySelector('[role="menu"]')
        const items = menu?.querySelectorAll('[role="menuitem"]')
        if (items?.length) {
          const currentIndex = Array.from(items).indexOf(document.activeElement)
          const prevIndex = (currentIndex - 1 + items.length) % items.length
          items[prevIndex]?.focus()
        }
      }
    }
    if (profileOpen || searchOpen) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileOpen, searchOpen])

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const initial = (user?.name || user?.email || 'U').charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-[var(--bg-primary)]/80 backdrop-blur-xl border-[var(--border-color)] px-4 lg:px-6">
      <button
        onClick={toggleSidebar}
        className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] lg:hidden transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <Link to="/" className="flex items-center gap-2.5 lg:hidden" aria-label="HireMate Home">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-sm">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </div>
        <span className="font-semibold text-[var(--text-primary)]">HireMate</span>
      </Link>

      {isAuthenticated && (
        <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-md" role="search">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] transition-colors group-focus-within:text-[var(--color-primary-500)]" aria-hidden="true" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs, skills..."
              aria-label="Search jobs and skills"
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] pl-9 pr-8 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] transition-all"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] px-1.5 py-0.5 text-[10px] text-[var(--text-tertiary)] font-mono" aria-hidden="true">
              ⌘K
            </kbd>
          </div>
        </div>
      )}

      <div className="flex-1 md:flex-none" />

      <div className="flex items-center gap-1">
        {isAuthenticated && (
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] md:hidden transition-colors"
            aria-label="Toggle search"
            aria-expanded={searchOpen}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        {isAuthenticated && searchOpen && (
          <div className="absolute left-0 right-0 top-16 z-50 p-3 bg-[var(--bg-primary)] border-b border-[var(--border-color)] md:hidden" role="search">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, skills..."
                aria-label="Search jobs and skills"
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] transition-all"
                autoFocus
              />
            </div>
          </div>
        )}

        {isAuthenticated && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
            </motion.div>
          </motion.button>
        )}

        {isAuthenticated && <NotificationBell />}

        {isAuthenticated && user && (
          <div ref={ref} className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 rounded-xl p-1.5 pr-3 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              aria-label="Profile menu"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-sm shadow-indigo-500/20">
                {initial}
              </div>
              <span className="hidden text-sm font-medium text-[var(--text-primary)] md:block">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </span>
            </motion.button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-2xl border bg-[var(--bg-primary)]/95 backdrop-blur-xl border-[var(--border-color)] shadow-lg shadow-black/5 py-2"
                  role="menu"
                >
                  <div className="px-5 py-3 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-sm">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.name || user?.email?.split('@')[0] || 'User'}</p>
                        <p className="text-xs text-[var(--text-tertiary)] capitalize">{user?.role}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      to={user?.role === 'recruiter' ? '/recruiter/profile' : '/profile'}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-5 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                      role="menuitem"
                    >
                      <User className="h-4 w-4" aria-hidden="true" />
                      Profile
                    </Link>
                    <Link
                      to="/plans"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-5 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                      role="menuitem"
                    >
                      <CreditCard className="h-4 w-4" aria-hidden="true" />
                      Plans & Billing
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-5 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                        role="menuitem"
                      >
                        <Shield className="h-4 w-4" aria-hidden="true" />
                        Admin Panel
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-[var(--border-color)] pt-1">
                    <button
                      onClick={() => { setProfileOpen(false); logout() }}
                      className="flex w-full items-center gap-3 px-5 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {!isAuthenticated && (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 shadow-sm shadow-indigo-500/20 transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
