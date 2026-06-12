import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import NotificationBell from '../notifications/NotificationBell'
import { Menu, LogOut, User, CreditCard, Shield, Moon, Sun } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function Navbar({ onMenuClick }) {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [profileOpen, setProfileOpen] = useState(false)
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-[var(--bg-primary)]/80 backdrop-blur-xl border-[var(--border-color)] px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] lg:hidden transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link to="/" className="flex items-center gap-2.5 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] text-white text-sm font-bold shadow-sm">
          AI
        </div>
        <span className="font-semibold text-[var(--text-primary)]">AI Interview</span>
      </Link>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] text-white font-semibold text-sm shadow-sm">
                {initial}
              </div>
              <span className="hidden text-sm font-medium text-[var(--text-primary)] md:block">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </span>
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl border bg-[var(--bg-primary)] border-[var(--border-color)] shadow-elevated py-2 animate-scaleIn"
                role="menu"
              >
                <div className="px-5 py-3 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] text-white font-semibold text-sm">
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
                    className="flex w-full items-center gap-3 px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
              className="rounded-xl bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-white hover:from-[var(--color-primary-600)] hover:to-[var(--color-primary-700)] shadow-sm shadow-[var(--color-primary-500)]/20 transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
