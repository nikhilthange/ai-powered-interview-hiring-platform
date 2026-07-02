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

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notifications</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            {unreadCount > 0 && ` (${unreadCount} unread)`}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4" />
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
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] || Bell
            return (
              <motion.div
                key={n._id}
                variants={itemVariants}
                onClick={() => { if (!n.isRead) markAsRead(n._id) }}
                className={cn(
                  'cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all',
                  !n.isRead
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/50'
                    : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:shadow-sm'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    !n.isRead ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={cn(
                          'text-sm',
                          !n.isRead ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-primary)]'
                        )}>
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="mt-0.5 text-sm text-[var(--text-secondary)] line-clamp-2">{n.message}</p>
                        )}
                      </div>
                      {!n.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />}
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-tertiary)]">{formatDateRelative(n.createdAt)}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
