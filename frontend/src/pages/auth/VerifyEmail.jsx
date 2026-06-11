import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { authApi } from '../../services/authApi'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Verification token is missing.')
      return
    }
    authApi
      .verifyEmail(token)
      .then(({ data }) => {
        setStatus('success')
        setMessage(data.message)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Verification failed.')
      })
  }, [searchParams])

  return (
    <div className="text-center space-y-6">
      {status === 'loading' && <p className="text-[var(--text-secondary)]">Verifying your email...</p>}

      {status === 'success' && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-300" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Email Verified!</h2>
          <p className="text-[var(--text-secondary)]">{message}</p>
          <Link
            to="/login"
            className="inline-block rounded-lg bg-[var(--color-primary-600)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-700)]"
          >
            Sign in
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-300" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Verification Failed</h2>
          <p className="text-[var(--text-secondary)]">{message}</p>
          <Link
            to="/login"
            className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)]"
          >
            Back to sign in
          </Link>
        </>
      )}
    </div>
  )
}
