import { memo, useMemo, useEffect, useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useApi } from '../../hooks/useApi'
import { profileApi } from '../../services/profileApi'
import { getMediaUrl, cn } from '../../lib/utils'
import {
  LayoutDashboard, Briefcase, FileText, Bookmark, MessageCircle,
  GraduationCap, Search, Target, BarChart3,
  Users, X, Calendar, ChevronLeft, Bell, ChevronDown,
  User, LogOut, Settings, Sparkles,
  ScrollText, Megaphone, Cpu, Building2
} from 'lucide-react'

const candidateLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/jobs', label: 'Find Jobs', icon: Search },
  { to: '/companies', label: 'Companies', icon: Building2 },
  { to: '/my-applications', label: 'Applications', icon: FileText },
  { to: '/my-interviews', label: 'Interviews', icon: Calendar },
  { to: '/saved-jobs', label: 'Saved Jobs', icon: Bookmark },
  { to: '/resume-builder', label: 'Resume Builder', icon: FileText },
  { to: '/resume-analyzer', label: 'Resume AI', icon: Search },
  { to: '/skill-gap-analysis', label: 'Skill Gap', icon: Target },
  { to: '/mock-interview', label: 'Mock Interview', icon: GraduationCap },
  { to: '/career-roadmap', label: 'Career Roadmap', icon: BarChart3 },
  { to: '/chat', label: 'Messages', icon: MessageCircle },
]

const recruiterLinks = [
  { to: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/recruiter/my-jobs', label: 'My Jobs', icon: Briefcase },
  { to: '/recruiter/company-profile', label: 'Company Profile', icon: Building2 },
  { to: '/recruiter/jobs/create', label: 'Post a Job', icon: FileText },
  { to: '/recruiter/ai-interview-assistant', label: 'AI Interview Assistant', icon: Sparkles },
  { to: '/recruiter/chat', label: 'Messages', icon: MessageCircle },
]

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/admin/applications', label: 'Applications', icon: FileText },
  { to: '/admin/recruiters', label: 'Recruiters', icon: User },
  { to: '/admin/ai-config', label: 'AI Config', icon: Cpu },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { to: '/admin/notifications', label: 'Notifications', icon: Megaphone },
]

const Sidebar = memo(function Sidebar({ open, onClose, collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const { data: profileData } = useApi(['profile'], () =>
    profileApi.getMyProfile().then(r => r.data)
  )
  const avatarUrl = getMediaUrl(profileData?.data?.profile?.avatarUrl)

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }
    
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])
  
  useEffect(() => {
    setIsProfileMenuOpen(false)
  }, [location.pathname])

  const links = useMemo(() => {
    if (!user) return []
    switch (user.role) {
      case 'admin': return adminLinks
      case 'recruiter': return recruiterLinks
      default: return candidateLinks
    }
  }, [user])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])



  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-black/45 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed left-0 flex flex-col border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all duration-300',
          'top-0 h-[100vh] z-[10000] w-[85%] max-w-[340px] rounded-r-2xl shadow-2xl pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
          'lg:top-[64px] lg:h-[calc(100vh-64px)] lg:z-40 lg:rounded-none lg:shadow-none lg:pt-0 lg:pb-0',
          collapsed ? 'lg:w-[72px]' : 'lg:w-[260px]',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Sidebar navigation"
      >
        <div className={cn(
          'flex items-center py-2 shrink-0',
          collapsed ? 'justify-center' : 'justify-end px-3'
        )}>
          <button
            onClick={onToggle}
            className="rounded-lg p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors hidden lg:block"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} aria-hidden="true" />
          </button>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 lg:hidden transition-colors" aria-label="Close sidebar">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-hidden p-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to + '/'))
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={cn(
                  'relative flex items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-100'
                )}
                aria-current={isActive ? 'page' : undefined}
                title={collapsed ? link.label : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveIndicator"
                    className="absolute inset-0 rounded-[14px] bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm z-0"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={cn('shrink-0 relative z-10 h-5 w-5', isActive && 'text-indigo-600 dark:text-indigo-400')} aria-hidden="true" />
                {!collapsed && <span className="relative z-10">{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        {user && (
          <div className="relative border-t border-gray-200 dark:border-slate-800 p-3" ref={profileMenuRef}>
            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={cn(
                    "absolute z-50 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 shadow-xl",
                    collapsed ? "left-full bottom-0 ml-2 w-56" : "bottom-full mb-2 left-0 w-full"
                  )}
                >
                  <Link
                    to={user?.role === 'recruiter' ? '/recruiter/profile' : '/profile'}
                    onClick={() => { onClose?.(); setIsProfileMenuOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    <User className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/notifications"
                    onClick={() => { onClose?.(); setIsProfileMenuOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    <Bell className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Notifications</span>
                  </Link>
                  <div className="my-1 border-t border-gray-200 dark:border-slate-800" />
                  <button
                    onClick={() => { logout(); setIsProfileMenuOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                isProfileMenuOpen && "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100",
                collapsed && "justify-center px-2"
              )}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="true"
            >
              <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-white font-semibold text-xs">
                    {(user?.name?.charAt(0) || 'U').toUpperCase()}
                  </span>
                )}
              </div>
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user?.name || user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user?.role}
                    </p>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    isProfileMenuOpen && "rotate-180"
                  )} />
                </>
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  )
})

export default Sidebar
