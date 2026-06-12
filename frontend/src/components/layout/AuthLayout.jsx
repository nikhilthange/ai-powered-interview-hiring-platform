import { useEffect } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { SkeletonPage } from '../ui/Skeleton'

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

  if (loading) return <SkeletonPage />

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--bg-secondary)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] text-white font-bold text-lg shadow-lg shadow-[var(--color-primary-500)]/20">
              AI
            </div>
          </Link>
          <h1 className="mt-5 text-2xl font-bold text-[var(--text-primary)]">AI Interview</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            AI-Powered Interview & Hiring Platform
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6 sm:p-8 shadow-sm">
          <Outlet />
        </div>

        <p className="mt-6 text-center text-xs text-[var(--text-tertiary)]">
          &copy; {new Date().getFullYear()} AI Interview. All rights reserved.
        </p>
      </div>
    </div>
  )
}
