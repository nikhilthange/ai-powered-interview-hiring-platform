import { useEffect } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { Moon, Sun } from 'lucide-react'
import { PageSpinner } from '../ui/Spinner'

export default function AuthLayout() {
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

  if (loading) return <PageSpinner />

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--bg-secondary)] px-4 py-12">
      <button
        onClick={toggleTheme}
        className="absolute right-4 top-4 rounded-xl p-2.5 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] bg-[var(--bg-primary)] transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-500)] text-white font-bold text-lg">
              AI
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">AI Interview</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            AI-Powered Interview & Hiring Platform
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6 sm:p-8 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
