import { memo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import { cn, formatDateRelative } from '../../lib/utils'
import { dropdownVariants, badgePopVariants, buttonMotion } from '../../lib/motion'

const NotificationBell = memo(function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open])

  if (!isAuthenticated) return null

  const recent = notifications.slice(0, 5)

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={shouldReduceMotion ? undefined : buttonMotion.whileHover}
        whileTap={shouldReduceMotion ? undefined : buttonMotion.whileTap}
        onClick={() => setOpen(!open)}
        className="relative flex items-center p-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              variants={shouldReduceMotion ? undefined : badgePopVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--color-error)] px-1 text-[10px] font-bold text-white leading-none shadow-sm"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={shouldReduceMotion ? undefined : dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border bg-[var(--bg-primary)]/95 backdrop-blur-xl border-[var(--border-color)] shadow-lg shadow-black/5"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => { markAllAsRead(); setOpen(false) }}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {recent.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto h-8 w-8 text-[var(--text-tertiary)] mb-2" />
                <p className="text-sm text-[var(--text-tertiary)]">No notifications yet</p>
              </div>
            ) : (
              <ul className="max-h-72 overflow-y-auto" role="list">
                {recent.map((n) => (
                  <motion.li
                    key={n._id}
                    initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
                    animate={shouldReduceMotion ? false : { opacity: 1, x: 0 }}
                    onClick={() => { if (!n.isRead) markAsRead(n._id) }}
                    className={cn(
                      'cursor-pointer border-b border-[var(--border-color)] px-4 py-3 text-sm transition-colors hover:bg-[var(--bg-tertiary)]',
                      !n.isRead && 'bg-indigo-50/50 dark:bg-indigo-950/30'
                    )}
                    role="listitem"
                  >
                    <div className="flex items-start gap-3">
                      {!n.isRead && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                      )}
                      <div className={cn('min-w-0 flex-1', n.isRead && 'ml-5')}>
                        <p className={cn('text-sm', n.isRead ? 'text-[var(--text-primary)]' : 'font-semibold text-[var(--text-primary)]')}>
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--text-secondary)] line-clamp-2">{n.message}</p>
                        <p className="mt-1 text-[10px] text-[var(--text-tertiary)]">
                          {formatDateRelative(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}

            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="block border-t border-[var(--border-color)] px-4 py-2.5 text-center text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              View all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

export default NotificationBell
