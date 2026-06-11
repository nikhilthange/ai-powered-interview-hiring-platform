import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router-dom'
import useNotifications from '../../hooks/useNotifications'
import { cn } from '../../lib/utils'

export default function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead, newNotif, clearNewNotif } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (newNotif) {
      clearNewNotif()
    }
  }, [newNotif, clearNewNotif])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isAuthenticated) return null

  const recent = notifications.slice(0, 5)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--color-error)] px-1 text-[10px] font-bold text-white leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border bg-[var(--bg-primary)] border-[var(--border-color)] shadow-lg animate-scaleIn">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => { markAllAsRead(); setOpen(false) }}
                className="text-xs text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {recent.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[var(--text-tertiary)]">No notifications yet</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {recent.map((n) => (
                <li
                  key={n._id}
                  onClick={() => { if (!n.isRead) markAsRead(n._id) }}
                  className={cn(
                    'cursor-pointer border-b border-[var(--border-color)] px-4 py-3 text-sm transition hover:bg-[var(--bg-tertiary)]',
                    !n.isRead && 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary-500)]" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm', n.isRead ? 'text-[var(--text-primary)]' : 'font-semibold text-[var(--text-primary)]')}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 truncate text-[var(--text-secondary)]">{n.message}</p>
                      <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-[var(--border-color)] px-4 py-2.5 text-center text-xs font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  )
}
