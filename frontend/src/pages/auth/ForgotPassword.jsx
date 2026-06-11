import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../../services/authApi'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-50)]">
          <Mail className="h-8 w-8 text-[var(--color-primary-600)]" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Check your email</h2>
        <p className="text-[var(--text-secondary)]">
          If an account exists with that email, we've sent a password reset link.
        </p>
        <Link to="/login" className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)]">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-center text-2xl font-bold text-[var(--text-primary)]">Reset your password</h2>
      <p className="text-center text-sm text-[var(--text-secondary)]">
        Enter your email and we'll send you a reset link.
      </p>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">{error}</div>}

      <Input
        id="email"
        label="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />

      <Button type="submit" loading={loading} className="w-full">
        Send reset link
      </Button>

      <Link
        to="/login"
        className="flex items-center justify-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
    </form>
  )
}
