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
    <nav className={`fixed bottom-0 left-0 right-0 z-[8000] border-t border-[#ececec] dark:border-[var(--border-color)] bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl lg:hidden safe-area-bottom pb-[env(safe-area-inset-bottom)] transition-all duration-300 ${sidebarOpen ? 'opacity-40 blur-[2px] pointer-events-none' : ''}`} aria-label="Mobile navigation">
      <div className="flex items-center justify-between px-2 py-2 gap-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'relative flex-1 flex flex-col items-center justify-center gap-1 h-[56px] text-[10px] font-bold transition-all rounded-xl',
                active
                  ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              )}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={cn('h-5 w-5', active && 'scale-110 transition-transform')} aria-hidden="true" />
              <span>{item.label}</span>
              {item.label === 'Alerts' && unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-[calc(50%-18px)] flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--color-error)] px-1 text-[9px] font-bold text-white leading-none shadow-sm border border-white dark:border-[#0f172a]"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
