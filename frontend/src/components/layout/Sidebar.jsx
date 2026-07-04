import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'
import {
  LayoutDashboard, Briefcase, FileText, Bookmark, MessageCircle,
  GraduationCap, Search, Target, BarChart3,
  Users, X, Calendar, ChevronLeft, Bell,
  User, CreditCard, LogOut, Sparkles,
} from 'lucide-react'

const candidateLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/jobs', label: 'Find Jobs', icon: Search },
  { to: '/my-applications', label: 'Applications', icon: FileText },
  { to: '/my-interviews', label: 'Interviews', icon: Calendar },
  { to: '/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
  { to: '/resume-analyzer', label: 'Resume AI', icon: Search },
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

export default function Sidebar({ open, onClose, collapsed, onToggle }) {
  const { user, logout } = useAuth()
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

  const bottomLinks = [
    { to: user?.role === 'recruiter' ? '/recruiter/profile' : '/profile', label: 'Profile', icon: User },
    { to: '/plans', label: 'Billing', icon: CreditCard },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-[var(--bg-primary)]/95 backdrop-blur-xl border-[var(--border-color)] transition-all duration-300 lg:static lg:translate-x-0',
          collapsed ? 'w-[72px]' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Sidebar navigation"
      >
        <div className={cn(
          'flex h-16 items-center border-b border-[var(--border-color)]',
          collapsed ? 'justify-center px-0' : 'justify-between px-5'
        )}>
          <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-sm shadow-indigo-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-[var(--text-primary)]">HireMate</span>
            )}
          </Link>
          <button
            onClick={onToggle}
            className={cn(
              'rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors',
              collapsed && 'hidden lg:block mx-auto'
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
          {!collapsed && (
            <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] lg:hidden transition-colors" aria-label="Close sidebar">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to + '/'))
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                )}
                aria-current={isActive ? 'page' : undefined}
                title={collapsed ? link.label : undefined}
              >
                <Icon className={cn('shrink-0', collapsed ? 'h-5 w-5' : 'h-5 w-5')} />
                {!collapsed && <span>{link.label}</span>}
                {isActive && !collapsed && (
                  <motion.span
                    layoutId="activeIndicator"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--color-primary-500)]"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[var(--border-color)] p-3 space-y-1">
          {bottomLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] dark:bg-indigo-500/10 dark:text-indigo-400'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                )}
                title={collapsed ? link.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            )
          })}
          <button
            onClick={logout}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {!collapsed && user && (
          <div className="border-t border-[var(--border-color)] p-3">
            <Link
              to={user?.role === 'recruiter' ? '/recruiter/profile' : '/profile'}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-xs shadow-sm">
                {(user?.name?.charAt(0) || 'U').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">{user?.name || user?.email?.split('@')[0] || 'User'}</p>
                <p className="truncate text-xs text-[var(--text-tertiary)] capitalize">{user?.role}</p>
              </div>
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
