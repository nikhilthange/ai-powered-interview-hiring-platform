import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import { useLayout } from '../../context/LayoutContext'
import { cn } from '../../lib/utils'
import { LayoutDashboard, Sparkles, Bell, User, Search } from 'lucide-react'

export default function BottomNav() {
  const { user, isAuthenticated } = useAuth()
  const { unreadCount } = useNotifications()
  const { sidebarOpen } = useLayout()
  const location = useLocation()

  if (!isAuthenticated) return null

  const getDashboardPath = () => {
    if (user?.role === 'recruiter') return '/recruiter/dashboard'
    if (user?.role === 'admin') return '/admin/dashboard'
    return '/dashboard'
  }

  const getJobsPath = () => {
    if (user?.role === 'recruiter') return '/recruiter/my-jobs'
    if (user?.role === 'admin') return '/admin/jobs'
    return '/jobs'
  }

  const getAIPath = () => {
    if (user?.role === 'recruiter') return '/recruiter/ai-interview-assistant'
    if (user?.role === 'admin') return '/admin/ai-config'
    return '/resume-analyzer'
  }

  const getProfilePath = () => {
    if (user?.role === 'recruiter') return '/recruiter/profile'
    if (user?.role === 'admin') return '/admin/settings'
    return '/profile'
  }

  const navItems = [
    { to: getDashboardPath(), label: 'Dashboard', icon: LayoutDashboard },
    { to: getJobsPath(), label: user?.role === 'recruiter' ? 'My Jobs' : 'Jobs', icon: Search },
    { to: getAIPath(), label: 'AI', icon: Sparkles },
    { to: user?.role === 'admin' ? '/admin/notifications' : '/notifications', label: 'Alerts', icon: Bell },
    { to: getProfilePath(), label: user?.role === 'admin' ? 'Settings' : 'Profile', icon: User },
  ]

  const isActive = (path) => {
    if (path === '/profile' || path === '/recruiter/profile' || path === '/admin/settings') {
      return location.pathname === '/profile' || location.pathname === '/recruiter/profile' || location.pathname === '/admin/settings'
    }
    if (path === '/dashboard' || path === '/recruiter/dashboard' || path === '/admin/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/recruiter/dashboard' || location.pathname === '/admin/dashboard'
    }
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-[8000] h-[72px] border-t border-[#ececec] dark:border-[var(--border-color)] bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl lg:hidden safe-area-bottom pb-[env(safe-area-inset-bottom)] transition-all duration-300 ${sidebarOpen ? 'opacity-40 blur-[2px] pointer-events-none' : ''}`} aria-label="Mobile navigation">
      <div className="flex items-center justify-between h-full px-1 gap-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className="relative flex-1 flex flex-col items-center justify-center h-full transition-all group"
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <div className={cn(
                'relative flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-2xl transition-all',
                active
                  ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40'
                  : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50'
              )}>
                <Icon className={cn('h-5 w-5', active && 'scale-110 transition-transform')} aria-hidden="true" />
                <span className="text-[11px] font-bold leading-none">{item.label}</span>
                {item.label === 'Alerts' && unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white leading-none shadow-xs border border-white dark:border-slate-800"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
