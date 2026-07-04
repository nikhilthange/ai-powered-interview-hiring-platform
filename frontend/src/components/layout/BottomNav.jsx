import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
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
  const location = useLocation()

  if (!isAuthenticated) return null

  const isActive = (path) => {
    if (path === '/profile') {
      return location.pathname === '/profile' || location.pathname === '/recruiter/profile'
    }
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/90 backdrop-blur-xl lg:hidden safe-area-bottom" aria-label="Mobile navigation">
      <div className="flex items-center justify-around py-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-[10px] font-medium transition-colors rounded-xl',
                active
                  ? 'text-[var(--color-primary-600)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              )}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.div
                  layoutId="bottomNav"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-[var(--color-primary-500)]"
                />
              )}
              <Icon className={cn('h-5 w-5', active && 'text-[var(--color-primary-500)]')} />
              <span>{item.label}</span>
              {item.label === 'Alerts' && unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 right-1/2 translate-x-5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--color-error)] px-1 text-[9px] font-bold text-white leading-none"
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
