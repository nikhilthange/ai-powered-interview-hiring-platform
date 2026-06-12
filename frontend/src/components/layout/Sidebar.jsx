import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'
import { chatApi } from '../../services/chatApi'
import {
  LayoutDashboard, Briefcase, FileText, Bookmark, MessageCircle,
  GraduationCap, FileSearch, Target, BarChart3,
  Users, X, Calendar,
} from 'lucide-react'

const candidateLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/jobs', label: 'Find Jobs', icon: Briefcase },
  { to: '/my-applications', label: 'Applications', icon: FileText },
  { to: '/my-interviews', label: 'Interviews', icon: Calendar },
  { to: '/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
  { to: '/resume-analyzer', label: 'Resume AI', icon: FileSearch },
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
  const { user } = useAuth()
  const location = useLocation()

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
      } catch {}
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-[var(--bg-primary)] border-[var(--border-color)] transition-transform duration-300 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--border-color)] px-5">
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] text-white text-sm font-bold shadow-sm">
              AI
            </div>
            <span className="font-semibold text-[var(--text-primary)]">AI Interview</span>
          </Link>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] lg:hidden transition-colors" aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to + '/'))
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-950)] dark:text-[var(--color-primary-300)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{link.label}</span>
                {link.label === 'Messages' && unreadCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[var(--border-color)] p-3">
          {user && (
            <Link
              to={user?.role === 'recruiter' ? '/recruiter/profile' : '/profile'}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] text-white font-semibold text-xs shadow-sm">
                {(user?.name?.charAt(0) || 'U').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">{user?.name || user?.email?.split('@')[0] || 'User'}</p>
                <p className="truncate text-xs text-[var(--text-tertiary)] capitalize">{user?.role}</p>
              </div>
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}
