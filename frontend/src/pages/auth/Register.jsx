import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { User, Briefcase } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'candidate' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role })
      navigate('/verify-email-prompt', { state: { email: form.email } })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Create your account</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Get started with AI-powered job hunting.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <Input
        id="name"
        label="Full name"
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="John Doe"
        required
      />

      <Input
        id="email"
        label="Email address"
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="you@example.com"
        required
      />

      <Input
        id="password"
        label="Password"
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="At least 8 characters"
        required
      />

      <Input
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={form.confirmPassword}
        onChange={handleChange}
        placeholder="Repeat your password"
        required
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--text-primary)]">I am a</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'candidate', label: 'Candidate', icon: User },
            { value: 'recruiter', label: 'Recruiter', icon: Briefcase },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, role: value }))}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all',
                form.role === value
                  ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-300)]'
                  : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--color-neutral-300)] dark:hover:border-[var(--color-neutral-600)]'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full" size="lg">
        Create account
      </Button>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)]">
          Sign in
        </Link>
      </p>
    </form>
  )
}
