import { memo, useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Bell, CheckCheck, Trash2, X, Briefcase, FileText,
  Calendar, Shield, ChevronRight, Check
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { cn, formatDateRelative } from '../../lib/utils'
import { dropdownVariants, badgePopVariants, buttonMotion, modalOverlayVariants, modalContainerVariants } from '../../lib/motion'

function getNotificationIcon(type) {
  switch (type) {
    case 'job_alert':
    case 'job_posted':
    case 'job':
      return { Icon: Briefcase, color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40' }
    case 'application_status':
    case 'application':
      return { Icon: FileText, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40' }
    case 'interview':
      return { Icon: Calendar, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40' }
    case 'system_alert':
    case 'admin':
      return { Icon: Shield, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40' }
    default:
      return { Icon: Bell, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/40' }
  }
}

function groupNotificationsByDate(notifications) {
  const today = []
  const yesterday = []
  const earlier = []

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterdayStart = todayStart - 86400000

  notifications.forEach((item) => {
    const itemDate = new Date(item.createdAt || Date.now()).getTime()
    if (itemDate >= todayStart) {
      today.push(item)
    } else if (itemDate >= yesterdayStart) {
      yesterday.push(item)
    } else {
      earlier.push(item)
    }
  })

  return { today, yesterday, earlier }
}

const NotificationItem = memo(function NotificationItem({ item, onMarkRead, onDelete, shouldReduceMotion }) {
  const { Icon, color } = getNotificationIcon(item.type)
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.li
      layout={!shouldReduceMotion}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? false : { opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'group relative flex items-start gap-3.5 p-3.5 rounded-2xl transition-all duration-200 border',
        !item.isRead
          ? 'bg-indigo-50/60 dark:bg-indigo-950/25 border-indigo-100 dark:border-indigo-900/40 shadow-xs'
          : 'bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] border-[var(--border-color)]'
      )}
      onClick={() => { if (!item.isRead) onMarkRead(item._id) }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      role="listitem"
    >
      {/* Icon Badge */}
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-medium', color)}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            'text-xs sm:text-sm font-semibold truncate',
            !item.isRead ? 'text-indigo-950 dark:text-indigo-100' : 'text-[var(--text-primary)]'
          )}>
            {item.title}
          </p>
          <span className="text-[10px] text-[var(--text-tertiary)] shrink-0 font-medium">
            {formatDateRelative(item.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
          {item.message}
        </p>
      </div>

      {/* Unread indicator / Action buttons */}
      <div className="flex items-center gap-1 shrink-0 self-center">
        {!item.isRead && (
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-sm shadow-indigo-500/50" title="Unread" />
        )}
        
        <div className={cn(
          'flex items-center gap-1 transition-opacity duration-150',
          showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
        )}>
          {!item.isRead && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMarkRead(item._id)
              }}
              className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
              title="Mark as read"
              aria-label="Mark notification as read"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item._id)
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Delete notification"
            aria-label="Delete notification"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.li>
  )
})

export default memo(function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const shouldReduceMotion = useReducedMotion()

  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open && !isMobile && !isTablet) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, isMobile, isTablet])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open])

  // Prevent background scroll on open mobile sheet or tablet modal
  useEffect(() => {
    if (open && (isMobile || isTablet)) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, isMobile, isTablet])

  const grouped = useMemo(() => groupNotificationsByDate(notifications), [notifications])

  const handleMarkAllRead = useCallback(() => {
    markAllAsRead()
  }, [markAllAsRead])

  const handleClearAll = useCallback(() => {
    clearAllNotifications()
  }, [clearAllNotifications])

  if (!isAuthenticated) return null

  const renderSection = (title, items) => {
    if (!items || items.length === 0) return null
    return (
      <div key={title} className="space-y-2">
        <h4 className="px-1 text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
          {title} ({items.length})
        </h4>
        <ul className="space-y-2" role="list">
          {items.map((n) => (
            <NotificationItem
              key={n._id}
              item={n}
              onMarkRead={markAsRead}
              onDelete={deleteNotification}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </ul>
      </div>
    )
  }

  const notificationContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] shrink-0 bg-[var(--bg-primary)]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                {unreadCount} unread alert{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span className="hidden min-[400px]:inline">Mark all read</span>
            </button>
          )}
          {(isMobile || isTablet) && (
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-xl text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              aria-label="Close notifications"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Body List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[220px] text-center px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 mb-3 border border-indigo-100 dark:border-indigo-900/30">
              <Bell className="h-7 w-7" />
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">All caught up!</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-[220px]">
              You don't have any notifications right now.
            </p>
          </div>
        ) : (
          <>
            {renderSection('Today', grouped.today)}
            {renderSection('Yesterday', grouped.yesterday)}
            {renderSection('Earlier', grouped.earlier)}
          </>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-md shrink-0 pb-[calc(0.875rem+env(safe-area-inset-bottom))]">
        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs font-semibold text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
          >
            Clear all
          </button>
        )}
        <Link
          to="/notifications"
          onClick={() => setOpen(false)}
          className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline ml-auto"
        >
          View all notifications
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )

  return (
    <div ref={ref} className="relative">
      {/* Bell Trigger Button */}
      <motion.button
        whileHover={shouldReduceMotion ? undefined : buttonMotion.whileHover}
        whileTap={shouldReduceMotion ? undefined : buttonMotion.whileTap}
        onClick={() => setOpen(!open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              variants={shouldReduceMotion ? undefined : badgePopVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none shadow-xs border border-white dark:border-slate-800"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Render Panel based on Breakpoint */}
      <AnimatePresence>
        {open && (
          <>
            {/* MOBILE: Drag-to-dismiss Bottom Sheet */}
            {isMobile && createPortal(
              <div className="fixed inset-0 z-[99999] flex flex-col justify-end">
                <motion.div
                  variants={shouldReduceMotion ? undefined : modalOverlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                  initial={shouldReduceMotion ? false : { y: '100%' }}
                  animate={shouldReduceMotion ? false : { y: 0 }}
                  exit={shouldReduceMotion ? false : { y: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                  drag="y"
                  dragConstraints={{ top: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, info) => {
                    if (info.offset.y > 100 || info.velocity.y > 400) {
                      setOpen(false)
                    }
                  }}
                  className="relative z-10 w-full h-[80vh] max-h-[85vh] rounded-t-[28px] bg-[var(--bg-primary)] shadow-2xl border-t border-[var(--border-color)] flex flex-col overflow-hidden"
                  role="dialog"
                  aria-label="Notifications Panel"
                >
                  {/* Bottom Sheet Handle */}
                  <div className="w-full py-2.5 flex justify-center items-center cursor-grab active:cursor-grabbing bg-[var(--bg-primary)] border-b border-[var(--border-light)] shrink-0">
                    <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  </div>
                  {notificationContent}
                </motion.div>
              </div>,
              document.body
            )}

            {/* TABLET: Centered Modal */}
            {isTablet && createPortal(
              <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                <motion.div
                  variants={shouldReduceMotion ? undefined : modalOverlayVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 bg-black/50 backdrop-blur-md"
                />

                <motion.div
                  variants={shouldReduceMotion ? undefined : modalContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="relative z-10 w-[500px] max-w-[90vw] h-[640px] max-h-[85vh] rounded-3xl bg-[var(--bg-primary)]/95 backdrop-blur-2xl border border-[var(--border-color)] shadow-2xl overflow-hidden flex flex-col"
                  role="dialog"
                  aria-label="Notifications Panel"
                >
                  {notificationContent}
                </motion.div>
              </div>,
              document.body
            )}

            {/* DESKTOP: Popover Dropdown */}
            {!isMobile && !isTablet && (
              <motion.div
                variants={shouldReduceMotion ? undefined : dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 top-[calc(100%+8px)] z-50 w-[420px] h-[580px] max-h-[calc(100vh-100px)] rounded-2xl bg-[var(--bg-primary)]/95 backdrop-blur-xl border border-[var(--border-color)] shadow-2xl shadow-black/10 overflow-hidden flex flex-col origin-top-right"
                role="dialog"
                aria-label="Notifications"
              >
                {notificationContent}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
})
