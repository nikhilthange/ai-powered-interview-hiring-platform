import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'
import { chatApi } from '../../services/chatApi'
import {
  LayoutDashboard, Briefcase, FileText, Bookmark, MessageCircle,
  GraduationCap, FileSearch, Target, BarChart3, LogOut,
  Users, X, Calendar,
} from 'lucide-react'

const candidateLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/jobs', label: 'Find Jobs', icon: Briefcase },
  { to: '/my-applications', label: 'My Applications', icon: FileText },
  { to: '/my-interviews', label: 'My Interviews', icon: Calendar },
  { to: '/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
  { to: '/resume-analyzer', label: 'Resume Analyzer', icon: FileSearch },
  { to: '/skill-gap-analysis', label: 'Skill Gap', icon: Target },
  { to: '/mock-interview', label: 'Mock Interview', icon: GraduationCap },
  { to: '/career-roadmap', label: 'Career Roadmap', icon: BarChart3 },
  { to: '/chat', label: 'Messages', icon: MessageCircle },
]

const recruiterLinks = [
  { to: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/recruiter/my-jobs', label: 'My Jobs', icon: Briefcase },
  { to: '/recruiter/jobs/create', label: 'Post a Job', icon: FileText },
  { to: '/recruiter/interviews', label: 'Interviews', icon: Calendar },
  { to: '/recruiter/chat', label: 'Messages', icon: MessageCircle },
]

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
]

export default function Sidebar({ open, onClose }) {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const getLinks = () => {
    if (!user) return []
    switch (user.role) {
      case 'admin': return adminLinks
      case 'recruiter': return recruiterLinks
      default: return candidateLinks
    }
  }

  const links = getLinks()

  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await chatApi.getUnreadCount()
        setUnreadCount(res.data.data.count)
      } catch {
        // silently ignore
      }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    onClose?.()
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-[var(--bg-sidebar)] border-[var(--border-color)] transition-transform duration-300 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--border-color)] px-6">
          <Link to="/" className="flex items-center gap-2" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-500)] text-white text-sm font-bold">
              AI
            </div>
            <span className="font-semibold text-[var(--text-primary)]">AI Interview</span>
          </Link>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/')
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-300)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{link.label}</span>
                {link.label === 'Messages' && unreadCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[var(--border-color)] p-4 space-y-3">
          {isAuthenticated && (
            <>
              <Link
                to={user?.role === 'recruiter' ? '/recruiter/profile' : '/profile'}
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--text-primary)]">{user?.name || user?.email?.split('@')[0] || 'User'}</p>
                  <p className="truncate text-xs text-[var(--text-tertiary)] capitalize">{user?.role}</p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
