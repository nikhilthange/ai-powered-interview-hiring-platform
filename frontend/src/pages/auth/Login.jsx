import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login({ email, password })
      const role = data.data?.user?.role
      const from = location.state?.from?.pathname
      if (from && from !== '/login' && from !== '/register') {
        navigate(from, { replace: true })
      } else if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else if (role === 'recruiter') {
        navigate('/recruiter/dashboard', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Welcome back</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Sign in to your account to continue.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <Input
        id="email"
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />

      <Input
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        required
      />

      <div className="flex items-center justify-end">
        <Link to="/forgot-password" className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)]">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" loading={loading} className="w-full" size="lg">
        Sign in
      </Button>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)]">
          Create one
        </Link>
      </p>
    </form>
  )
}
