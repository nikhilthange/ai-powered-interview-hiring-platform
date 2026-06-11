import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import NotificationBell from '../notifications/NotificationBell'
import { Menu, Moon, Sun } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function Navbar({ onMenuClick }) {
  const { user, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-[var(--bg-primary)] border-[var(--border-color)] px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] lg:hidden"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-500)] text-white text-sm font-bold">
          AI
        </div>
        <span className="font-semibold text-[var(--text-primary)]">AI Interview</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {isAuthenticated && (
          <NotificationBell />
        )}

        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {isAuthenticated && (
          <div ref={ref} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] font-semibold text-sm">
                {(user?.email?.charAt(0) || 'U').toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium text-[var(--text-primary)] md:block">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </span>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-[var(--bg-primary)] border-[var(--border-color)] shadow-lg py-2 animate-scaleIn">
                <div className="px-4 py-2 border-b border-[var(--border-color)]">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{user?.name || user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-xs text-[var(--text-tertiary)] capitalize">{user?.role}</p>
                </div>
                <Link
                  to={user?.role === 'recruiter' ? '/recruiter/profile' : '/profile'}
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                >
                  Profile
                </Link>
                <Link
                  to="/subscription"
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                >
                  Subscription
                </Link>
                <Link
                  to="/plans"
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                >
                  Upgrade Plan
                </Link>
              </div>
            )}
          </div>
        )}

        {!isAuthenticated && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-[var(--color-primary-500)] px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-[var(--color-primary-600)] transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}