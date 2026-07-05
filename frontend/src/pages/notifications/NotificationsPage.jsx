import { memo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNotifications } from '../../hooks/useNotifications'

import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { cn } from '../../lib/utils'
import {
  Bell, CheckCheck, CheckCircle, AlertCircle,
  Info, AlertTriangle, Calendar, Briefcase,
  Star, MessageCircle,
} from 'lucide-react'

import { formatDateRelative } from '../../lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  application: Briefcase,
  interview: Calendar,
  message: MessageCircle,
  job: Briefcase,
  promotion: Star,
}

const NotificationItem = memo(function NotificationItem({ notification, onMarkRead }) {
  const Icon = typeIcons[notification.type] || Bell

  return (
    <motion.div
      variants={itemVariants}
      onClick={() => { if (!notification.isRead) onMarkRead(notification._id) }}
      className={cn(
        'cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all',
        !notification.isRead
          ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/50'
          : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:shadow-sm'
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          !notification.isRead ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
        )}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={cn(
                'text-sm',
                !notification.isRead ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-primary)]'
              )}>
                {notification.title}
              </p>
              {notification.message && (
                <p className="mt-0.5 text-sm text-[var(--text-secondary)] line-clamp-2">{notification.message}</p>
              )}
            </div>
            {!notification.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />}
          </div>
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">{formatDateRelative(notification.createdAt)}</p>
        </div>
      </div>
    </motion.div>
  )
})

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead()
  }, [markAllAsRead])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">Notifications</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            {unreadCount > 0 && ` (${unreadCount} unread)`}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="shrink-0">
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Mark All Read
          </Button>
        )}
      </motion.div>

      {notifications.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up! Notifications will appear here when you have new activity."
          />
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
          {notifications.map((n) => (
            <NotificationItem key={n._id} notification={n} onMarkRead={markAsRead} />
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
