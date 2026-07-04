import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import { cn } from '../lib/utils'
import { ArrowRight, Sparkles, Shield, Zap, BarChart3, Users, Target, Star, MessageCircle, Award, TrendingUp } from 'lucide-react'
import { useRef } from 'react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '50K+', label: 'Resumes Analyzed' },
  { value: '5K+', label: 'Mock Interviews' },
  { value: '95%', label: 'Satisfaction Rate' },
]

const features = [
  {
    icon: BarChart3,
    title: 'Resume Analysis',
    desc: 'Get instant ATS scores and detailed AI feedback on your resume to stand out from the crowd.',
    color: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950',
    iconColor: 'text-indigo-600',
  },
  {
    icon: Target,
    title: 'Skill Gap Analysis',
    desc: 'Discover missing skills and get personalized learning recommendations tailored to your career goals.',
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950',
    iconColor: 'text-purple-600',
  },
  {
    icon: MessageCircle,
    title: 'Mock Interviews',
    desc: 'Practice with AI-powered interviews and get real-time feedback to ace your actual interviews.',
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Users,
    title: 'Smart Job Matching',
    desc: 'Get matched with jobs that fit your skills and experience using AI-powered recommendations.',
    color: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950',
    iconColor: 'text-amber-600',
  },
  {
    icon: TrendingUp,
    title: 'Career Roadmaps',
    desc: 'Follow personalized career paths with milestones and resources to reach your dream role.',
    color: 'from-rose-500 to-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-950',
    iconColor: 'text-rose-600',
  },
  {
    icon: Award,
    title: 'AI-Powered Insights',
    desc: 'Get intelligent recommendations to accelerate your career growth and stay ahead of the competition.',
    color: 'from-cyan-500 to-cyan-600',
    bg: 'bg-cyan-50 dark:bg-cyan-950',
    iconColor: 'text-cyan-600',
  },
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Frontend Developer',
    avatar: 'SC',
    content: 'The AI resume analysis helped me identify gaps I never noticed. Landed my dream job within 2 weeks!',
    rating: 5,
  },
  {
    name: 'James Wilson',
    role: 'Product Manager',
    avatar: 'JW',
    content: 'The mock interviews are incredibly realistic. They gave me the confidence I needed for my actual interviews.',
    rating: 5,
  },
  {
    name: 'Priya Patel',
    role: 'Data Scientist',
    avatar: 'PP',
    content: 'The career roadmap feature helped me chart a clear path forward. Highly recommended for any professional.',
    rating: 5,
  },
]

export default function Home() {
  const { isAuthenticated } = useAuth()
  const statsRef = useRef(null)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[var(--bg-secondary)]"
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl animate-pulse-slow" />
          <motion.div
            animate={{ y: [0, -10, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 left-1/4 h-16 w-16 rounded-full bg-indigo-500/5 blur-2xl"
          />
          <motion.div
            animate={{ y: [0, 10, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-20 right-1/4 h-24 w-24 rounded-full bg-purple-500/5 blur-2xl"
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-32">
          <motion.div variants={itemVariants} className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 px-4 py-1.5 text-sm text-indigo-700 dark:text-indigo-300 mb-6 shadow-sm"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              AI-Powered Career Platform
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse-slow" />
            </motion.div>
            <h1 className="text-[clamp(1.75rem,5vw,3.75rem)] font-bold text-[var(--text-primary)] tracking-tight leading-tight">
              Land Your Dream Job with{' '}
              <span className="text-gradient-premium">AI</span>
            </h1>
            <p className="mt-6 text-sm sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
              AI-powered resume analysis, skill gap detection, mock interviews, and career roadmaps — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8">
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
                      <ArrowRight className="h-5 w-5" aria-hidden="true" />
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10 text-xs sm:text-sm text-[var(--text-tertiary)]"
            >
              <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" /> Free forever plan</span>
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" /> Powered by AI</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Everything you need to succeed</h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto">Intelligent tools to accelerate your career journey</p>
        </motion.div>
        <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="group rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6 hover:shadow-lg hover:border-[var(--color-primary-300)] dark:hover:border-indigo-500/30 transition-all cursor-default"
              >
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br', feature.bg, 'group-hover:scale-110 transition-transform duration-200')}>
                    <Icon className={cn('h-6 w-6', feature.iconColor)} aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-primary-600)] transition-colors">{feature.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Testimonials */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Loved by professionals</h2>
        </motion.div>
        <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-1 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                ))}
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">"{t.content}"</p>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--border-color)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-xs">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{t.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Stats */}
      <div ref={statsRef} className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-3xl font-bold text-gradient">{stat.value}</p>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-4 py-20 text-center relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-r from-indigo-500/5 to-purple-500/5 blur-3xl" />
        </div>
        <motion.div variants={itemVariants} className="relative">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Ready to accelerate your career?</h2>
          <p className="mt-3 text-sm sm:text-lg text-[var(--text-secondary)] max-w-lg mx-auto">
            Join thousands of professionals who landed their dream jobs with AI-powered tools.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            {!isAuthenticated && (
              <Link to="/register">
                <Button size="xl">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
