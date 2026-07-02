import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import NotificationBell from '../notifications/NotificationBell'
import { Menu, LogOut, User, CreditCard, Shield, Moon, Sun, Search } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function Navbar({ onMenuClick }) {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setProfileOpen(false)
    }
    if (profileOpen) document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [profileOpen])

  const initial = (user?.name || user?.email || 'U').charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-[var(--bg-primary)]/80 backdrop-blur-xl border-[var(--border-color)] px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] lg:hidden transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link to="/" className="flex items-center gap-2.5 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-sm">
          AI
        </div>
        <span className="font-semibold text-[var(--text-primary)]">HireMate</span>
      </Link>

      {isAuthenticated && (
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search jobs, skills, companies..."
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] px-1.5 py-0.5 text-[10px] text-[var(--text-tertiary)] font-mono">
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
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        )}

        {isAuthenticated && (
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        )}

        {isAuthenticated && <NotificationBell />}

        {isAuthenticated && (
          <div ref={ref} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 rounded-xl p-1.5 pr-3 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              aria-label="Profile menu"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-sm">
                {initial}
              </div>
              <span className="hidden text-sm font-medium text-[var(--text-primary)] md:block">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </span>
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl border bg-[var(--bg-primary)]/95 backdrop-blur-xl border-[var(--border-color)] shadow-lg shadow-black/5 py-2 animate-scaleIn"
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
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    to="/plans"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-5 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                    role="menuitem"
                  >
                    <CreditCard className="h-4 w-4" />
                    Plans & Billing
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-5 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                      role="menuitem"
                    >
                      <Shield className="h-4 w-4" />
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
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
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
