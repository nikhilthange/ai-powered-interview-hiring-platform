import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { notificationApi } from '../../services/notificationApi'
import useNotifications from '../../hooks/useNotifications'
import { SkeletonPage } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Card, CardContent } from '../../components/ui/Card'
import { Bell, CheckCheck, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatDateRelative } from '../../lib/utils'
import { Link } from 'react-router-dom'

export default function NotificationsPage() {
  const [page, setPage] = useState(1)
  const { markAsRead, markAllAsRead } = useNotifications()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-page', page],
    queryFn: () => notificationApi.getNotifications(page).then((r) => r.data),
  })

  const notifications = data?.data?.notifications || []
  const totalPages = data?.totalPages || 1
  const unreadCount = data?.unreadCount || 0

  return (
    <div className="max-w-3xl mx-auto space-y-6 page-section">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors" aria-label="Back to dashboard">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notifications</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead()}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <SkeletonPage />
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              description="When you receive notifications, they'll appear here."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => { if (!n.isRead) markAsRead(n._id) }}
              className={cn(
                'cursor-pointer rounded-xl border p-4 transition-all card-hover-effect',
                !n.isRead
                  ? 'border-[var(--color-primary-200)] bg-[var(--color-primary-50)] dark:border-[var(--color-primary-800)] dark:bg-[var(--color-primary-950)]'
                  : 'border-[var(--border-color)] bg-[var(--bg-primary)]'
              )}
              role="button"
              tabIndex={0}
              aria-label={`${n.title}${!n.isRead ? ' (unread)' : ''}`}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!n.isRead) markAsRead(n._id) } }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!n.isRead && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary-500)]" />
                    )}
                    <p className={cn('text-sm', !n.isRead ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-primary)]')}>
                      {n.title}
                    </p>
                  </div>
                  <p className={cn('mt-1 text-sm', n.isRead ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]')}>
                    {n.message}
                  </p>
                </div>
                {!n.isRead && (
                  <Badge variant="primary" size="xs" className="shrink-0">New</Badge>
                )}
              </div>
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                {formatDateRelative(n.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm text-[var(--text-secondary)]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
