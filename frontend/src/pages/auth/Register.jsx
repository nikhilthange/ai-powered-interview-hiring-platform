import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Card, CardContent } from '../../components/ui/Card'
import { Eye, EyeOff, UserPlus, AlertCircle, Sparkles, Mail, Lock, User } from 'lucide-react'
import { cn } from '../../lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'candidate' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordStrength = (() => {
    const p = form.password
    let score = 0
    if (p.length >= 6) score++
    if (p.length >= 10) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  })()

  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-green-500']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/verify-email-prompt', { state: { email: form.email } })
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/5 blur-3xl" />
        <motion.div
          animate={{ y: [0, -8, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 right-1/4 h-32 w-32 rounded-full bg-purple-500/5 blur-2xl"
        />
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)]">HireMate</span>
          </motion.div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Create an account</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Start your career journey with AI-powered tools</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
                    role="alert"
                    aria-live="assertive"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>{error}</p>
                  </motion.div>
                )}

                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  prefix={<User className="h-4 w-4" />}
                  autoComplete="name"
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  prefix={<Mail className="h-4 w-4" />}
                  autoComplete="email"
                  required
                />

                <div>
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    prefix={<Lock className="h-4 w-4" />}
                    suffix={
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                      </button>
                    }
                    autoComplete="new-password"
                    required
                  />
                  {form.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 space-y-1"
                    >
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className={cn(
                              'h-1.5 flex-1 rounded-full transition-colors origin-left',
                              i < passwordStrength ? strengthColor[passwordStrength - 1] : 'bg-[var(--bg-tertiary)]'
                            )}
                          />
                        ))}
                      </div>
                      <p className={cn(
                        'text-xs font-medium',
                        passwordStrength <= 2 ? 'text-red-500' : passwordStrength <= 3 ? 'text-amber-500' : 'text-emerald-500'
                      )}>
                        {strengthLabel[passwordStrength - 1] || ''}
                      </p>
                    </motion.div>
                  )}
                </div>

                <div role="radiogroup" aria-label="Account type">
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">I am a</label>
                  <div className="grid grid-cols-2 gap-2 min-w-0">
                    {[
                      { value: 'candidate', label: 'Job Seeker' },
                      { value: 'recruiter', label: 'Recruiter' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={form.role === option.value}
                        onClick={() => setForm({ ...form, role: option.value })}
                        className={cn(
                          'rounded-xl px-4 py-3 text-sm font-medium border transition-all',
                          form.role === option.value
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-800 shadow-sm'
                            : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" loading={loading} className="w-full">
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  Create Account
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center mt-6">
          <p className="text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
