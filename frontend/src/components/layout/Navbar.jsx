import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { useLayout } from '../../context/LayoutContext'
import NotificationBell from '../notifications/NotificationBell'
import GlobalSearch from './GlobalSearch'
import { useClickOutside } from '../../hooks/useClickOutside'
import { useApi } from '../../hooks/useApi'
import { profileApi } from '../../services/profileApi'
import { getMediaUrl, cn } from '../../lib/utils'
import { Menu, LogOut, User, Shield, Moon, Sun, Search, Sparkles } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

const Navbar = memo(function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { toggleSidebar } = useLayout()
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const ref = useClickOutside(() => setProfileOpen(false))

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { setProfileOpen(false) }
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
    if (profileOpen) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileOpen])

  const initial = (user?.name || user?.email || 'U').charAt(0).toUpperCase()
  const { data: profileData } = useApi(['profile'], () =>
    profileApi.getMyProfile().then(r => r.data)
  )
  const avatarUrl = getMediaUrl(profileData?.data?.profile?.avatarUrl)

  return (
    <header 
      className={cn(
        "sticky top-0 z-[9000] w-full flex h-[64px] items-center justify-between px-4 md:px-8 transition-all duration-300 pt-[env(safe-area-inset-top)]",
        scrolled 
          ? "bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/10 shadow-sm text-white"
          : "bg-[#0f172a]/80 backdrop-blur-md border-b border-transparent text-white"
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={toggleSidebar}
          className="rounded-xl p-2 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <Link to="/" className="flex items-center gap-2.5" aria-label="HireMate Home">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight hidden min-[360px]:block">HireMate</span>
        </Link>
      </div>

      {/* Center Section */}
      {isAuthenticated && (
        <>
          <div className="hidden md:flex items-center justify-center flex-1 px-4">
            <GlobalSearch />
          </div>
          <div className="flex md:hidden items-center justify-center flex-1 px-2">
            <button 
              onClick={() => setMobileSearchOpen(true)}
              className="rounded-xl p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-1 md:gap-3 shrink-0">

        {isAuthenticated && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="rounded-xl p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors hidden md:block"
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
          <div ref={ref} className="relative ml-1">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 rounded-xl p-1 md:pr-3 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Profile menu"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm shadow-indigo-500/20">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white font-semibold text-sm">
                    {initial}
                  </div>
                )}
              </div>
              <span className="hidden text-sm font-medium text-[var(--text-primary)] lg:block">
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
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-white font-semibold text-sm">
                            {initial}
                          </div>
                        )}
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

      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="absolute top-[100%] left-0 right-0 p-4 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10 z-[8900] flex items-center gap-2 shadow-lg"
          >
            <div className="flex-1">
              <GlobalSearch />
            </div>
            <button 
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white rounded-xl shrink-0 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
})

export default Navbar
