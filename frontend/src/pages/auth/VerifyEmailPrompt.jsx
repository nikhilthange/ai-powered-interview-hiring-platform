import { motion } from 'framer-motion'
import { useLocation, Link } from 'react-router-dom'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Mail, ArrowRight, Sparkles } from 'lucide-react'

export default function VerifyEmailPrompt() {
  const location = useLocation()
  const email = location.state?.email || 'your email'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/5 blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <Card>
          <CardContent className="p-5 sm:p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 ring-1 ring-indigo-200/50 dark:ring-indigo-800/30"
            >
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Mail className="h-10 w-10 text-indigo-600" />
              </motion.div>
            </motion.div>
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 mt-8 text-[var(--text-tertiary)]"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-xs">Join thousands of professionals using AI-powered career tools</span>
        </motion.div>
      </motion.div>
    </div>
  )
}
