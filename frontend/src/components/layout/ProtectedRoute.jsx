import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Spinner } from '../ui'
import { ShieldAlert } from 'lucide-react'

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner icon="sparkles" label="Verifying your session..." />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 ring-1 ring-amber-200/50 dark:ring-amber-800/30">
          <ShieldAlert className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Access Denied</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-sm">
          You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
        </p>
        <button
          onClick={() => window.history.back()}
          className="rounded-xl bg-[var(--color-primary-500)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-600)] transition-all"
        >
          Go Back
        </button>
      </div>
    )
  }

  return <Outlet />
}
