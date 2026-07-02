import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Card, CardContent } from '../../components/ui/Card'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { authApi } from '../../services/authApi'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.forgotPassword({ email })
      setSent(true)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md">
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reset password</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {sent ? 'Check your email for the reset link' : "Enter your email and we'll send you a reset link"}
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              {sent ? (
                <div className="text-center py-4">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950">
                    <CheckCircle className="h-7 w-7 text-emerald-500" />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">Email sent to <strong className="text-[var(--text-primary)]">{email}</strong></p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-2">Check your inbox and follow the instructions.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-3 text-sm text-red-700">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" loading={loading} className="w-full">
                    <Mail className="h-4 w-4" />
                    Send Reset Link
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mt-6">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
