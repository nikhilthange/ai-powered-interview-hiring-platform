import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { authApi } from '../../services/authApi'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import { CheckCircle, XCircle } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/5 blur-3xl" />
      </div>
      <div className="w-full max-w-md relative">
        <Card>
          <CardContent className="p-8 text-center">
            {status === 'loading' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <Spinner icon="sparkles" size="xl" label="Verifying your email..." />
                <p className="text-sm text-[var(--text-secondary)] mt-2">Please wait a moment</p>
              </motion.div>
            )}
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 ring-1 ring-emerald-200/50 dark:ring-emerald-800/30"
                >
                  <CheckCircle className="h-10 w-10 text-emerald-500" />
                </motion.div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{message}</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-2">You can now sign in to your account.</p>
                <Link to="/login">
                  <Button className="mt-6">Sign In</Button>
                </Link>
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50 ring-1 ring-red-200/50 dark:ring-red-800/30"
                >
                  <XCircle className="h-10 w-10 text-red-500" />
                </motion.div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Verification failed</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-2">{message}</p>
                <Link to="/login">
                  <Button className="mt-6" variant="outline">Back to Sign In</Button>
                </Link>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
