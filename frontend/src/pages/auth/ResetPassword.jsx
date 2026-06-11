import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authApi } from '../../services/authApi'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { CheckCircle2 } from 'lucide-react'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const token = searchParams.get('token')
    if (!token) {
      setError('Reset token is missing.')
      return
    }

    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-300" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Password Reset!</h2>
        <p className="text-[var(--text-secondary)]">Your password has been reset successfully.</p>
        <Button onClick={() => navigate('/login')}>Sign in with new password</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-center text-2xl font-bold text-[var(--text-primary)]">Set new password</h2>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">{error}</div>}

      <Input
        id="password"
        label="New Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="At least 8 characters"
        required
      />

      <Input
        id="confirmPassword"
        label="Confirm New Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Repeat your password"
        required
      />

      <Button type="submit" loading={loading} className="w-full">
        Reset password
      </Button>
    </form>
  )
}
