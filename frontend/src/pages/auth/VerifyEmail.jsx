import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { authApi } from '../../services/authApi'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error')
        setMessage('No verification token provided.')
        return
      }
      try {
        await authApi.verifyEmail(token)
        setStatus('success')
        setMessage('Email verified successfully!')
      } catch (err) {
        setStatus('error')
        setMessage(err?.response?.data?.message || 'Verification failed. The link may have expired.')
      }
    }
    verify()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="p-8 text-center">
            {status === 'loading' && (
              <div>
                <Loader2 className="mx-auto h-12 w-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-lg font-medium text-[var(--text-primary)]">Verifying your email...</p>
              </div>
            )}
            {status === 'success' && (
              <div>
                <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
                <p className="text-lg font-medium text-[var(--text-primary)]">{message}</p>
                <Link to="/login">
                  <Button className="mt-6">Sign In</Button>
                </Link>
              </div>
            )}
            {status === 'error' && (
              <div>
                <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <p className="text-lg font-medium text-[var(--text-primary)]">Verification failed</p>
                <p className="text-sm text-[var(--text-secondary)] mt-2">{message}</p>
                <Link to="/login">
                  <Button className="mt-6" variant="outline">Back to Sign In</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
