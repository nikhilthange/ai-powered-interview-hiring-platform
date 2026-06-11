import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { notificationApi } from '../../services/notificationApi'
import useNotifications from '../../hooks/useNotifications'
import { PageSpinner } from '../../components/ui/Spinner'
import { Bell, CheckCheck, ArrowLeft } from 'lucide-react'
import { cn } from '../../lib/utils'
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={() => markAllAsRead()}
            className="ml-auto flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Bell className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => { if (!n.isRead) markAsRead(n._id) }}
              className={cn(
                'cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition hover:bg-gray-50',
                !n.isRead && 'border-indigo-200 bg-indigo-50/50'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{n.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                </div>
                {!n.isRead && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                )}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
