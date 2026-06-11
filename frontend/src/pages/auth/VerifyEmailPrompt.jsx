import { useLocation, Link } from 'react-router-dom'
import { Mail } from 'lucide-react'

export default function VerifyEmailPrompt() {
  const location = useLocation()
  const email = location.state?.email

  return (
    <div className="text-center space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-50)]">
        <Mail className="h-8 w-8 text-[var(--color-primary-600)]" />
      </div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Check your email</h2>
      <p className="text-[var(--text-secondary)]">
        We sent a verification link to{' '}
        <span className="font-medium text-[var(--text-primary)]">{email || 'your email'}</span>
      </p>
      <p className="text-sm text-[var(--text-tertiary)]">
        Click the link in the email to verify your account. The link expires in 10 minutes.
      </p>
      <Link
        to="/login"
        className="inline-block text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)]"
      >
        Go to sign in
      </Link>
    </div>
  )
}
