import { useLocation, Link } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Mail, ArrowRight } from 'lucide-react'

export default function VerifyEmailPrompt() {
  const location = useLocation()
  const email = location.state?.email || 'your email'

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
              <Mail className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Check your email</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-3 leading-relaxed">
              We sent a verification link to <strong className="text-[var(--text-primary)]">{email}</strong>. Please check your inbox and click the link to verify your account.
            </p>
            <div className="mt-6 space-y-3">
              <Link to="/login">
                <Button className="w-full">
                  Go to Sign In
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-[var(--text-tertiary)]">
                Didn't receive the email? Check your spam folder or{' '}
                <button className="text-indigo-600 hover:text-indigo-700 font-medium">resend</button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
