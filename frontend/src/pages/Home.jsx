import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import { cn } from '../lib/utils'
import { ArrowRight, Sparkles, Shield, Zap, BarChart3, Users, Briefcase, Target } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[var(--bg-secondary)]"
    >
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-32">
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 px-4 py-1.5 text-sm text-indigo-700 dark:text-indigo-300 mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Career Platform
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] tracking-tight">
              Land Your Dream Job with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">AI</span>
            </h1>
            <p className="mt-6 text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl mx-auto">
              AI-powered resume analysis, skill gap detection, mock interviews, and career roadmaps — all in one platform.
            </p>
            <div className="flex items-center justify-center gap-4 mt-8">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="xl">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="xl">
                      Get Started Free
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="xl">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-20">
        <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: BarChart3,
              title: 'Resume Analysis',
              desc: 'Get instant ATS scores and detailed AI feedback on your resume.',
              color: 'from-indigo-500 to-indigo-600',
              bg: 'bg-indigo-50 dark:bg-indigo-950',
            },
            {
              icon: Target,
              title: 'Skill Gap Analysis',
              desc: 'Discover missing skills and get personalized learning recommendations.',
              color: 'from-purple-500 to-purple-600',
              bg: 'bg-purple-50 dark:bg-purple-950',
            },
            {
              icon: Briefcase,
              title: 'Mock Interviews',
              desc: 'Practice with AI-powered interviews and get real-time feedback.',
              color: 'from-emerald-500 to-emerald-600',
              bg: 'bg-emerald-50 dark:bg-emerald-950',
            },
            {
              icon: Users,
              title: 'Smart Job Matching',
              desc: 'Get matched with jobs that fit your skills and experience.',
              color: 'from-amber-500 to-amber-600',
              bg: 'bg-amber-50 dark:bg-amber-950',
            },
            {
              icon: Shield,
              title: 'Career Roadmaps',
              desc: 'Follow personalized career paths with milestones and resources.',
              color: 'from-rose-500 to-rose-600',
              bg: 'bg-rose-50 dark:bg-rose-950',
            },
            {
              icon: Zap,
              title: 'AI-Powered Insights',
              desc: 'Get intelligent recommendations to accelerate your career growth.',
              color: 'from-cyan-500 to-cyan-600',
              bg: 'bg-cyan-50 dark:bg-cyan-950',
            },
          ].map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6 hover:shadow-lg transition-all"
              >
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br', feature.bg)}>
                  <Icon className="h-6 w-6 text-white" style={{ color: 'var(--color-primary-600)' }} />
                </div>
                <h3 className="mt-4 font-semibold text-[var(--text-primary)]">{feature.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Ready to accelerate your career?</h2>
          <p className="mt-3 text-lg text-[var(--text-secondary)] max-w-lg mx-auto">
            Join thousands of professionals who landed their dream jobs with AI-powered tools.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            {!isAuthenticated && (
              <Link to="/register">
                <Button size="xl">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}


