import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import { useLayout } from '../../context/LayoutContext'
import { cn } from '../../lib/utils'
import { LayoutDashboard, Sparkles, Bell, User, Search } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/jobs', label: 'Jobs', icon: Search },
  { to: '/resume-analyzer', label: 'AI', icon: Sparkles },
  { to: '/notifications', label: 'Alerts', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function BottomNav() {
  const { isAuthenticated } = useAuth()
  const { unreadCount } = useNotifications()
  const { sidebarOpen } = useLayout()
  const location = useLocation()

  if (!isAuthenticated) return null

  const isActive = (path) => {
    if (path === '/profile') {
      return location.pathname === '/profile' || location.pathname === '/recruiter/profile'
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
                    className="absolute -top-1 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--color-error)] px-1 text-[9px] font-bold text-white leading-none shadow-sm border border-white dark:border-[#0f172a]"
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
