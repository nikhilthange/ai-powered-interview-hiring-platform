import { memo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Users, Target, MessageCircle, Award, TrendingUp } from 'lucide-react'
import { cn } from '../../lib/utils'

const features = [
  {
    icon: BarChart3,
    title: 'Resume Analysis',
    desc: 'Get instant ATS scores and detailed AI feedback on your resume to stand out from the crowd.',
    bg: 'bg-indigo-50 dark:bg-indigo-950',
    iconColor: 'text-indigo-600',
  },
  {
    icon: Target,
    title: 'Skill Gap Analysis',
    desc: 'Discover missing skills and get personalized learning recommendations tailored to your career goals.',
    bg: 'bg-purple-50 dark:bg-purple-950',
    iconColor: 'text-purple-600',
  },
  {
    icon: MessageCircle,
    title: 'Mock Interviews',
    desc: 'Practice with AI-powered interviews and get real-time feedback to ace your actual interviews.',
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Users,
    title: 'Smart Job Matching',
    desc: 'Get matched with jobs that fit your skills and experience using AI-powered recommendations.',
    bg: 'bg-amber-50 dark:bg-amber-950',
    iconColor: 'text-amber-600',
  },
  {
    icon: TrendingUp,
    title: 'Career Roadmaps',
    desc: 'Follow personalized career paths with milestones and resources to reach your dream role.',
    bg: 'bg-rose-50 dark:bg-rose-950',
    iconColor: 'text-rose-600',
  },
  {
    icon: Award,
    title: 'AI-Powered Insights',
    desc: 'Get intelligent recommendations to accelerate your career growth and stay ahead of the competition.',
    bg: 'bg-cyan-50 dark:bg-cyan-950',
    iconColor: 'text-cyan-600',
  },
]

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const FeatureCard = memo(function FeatureCard({ feature }) {
  const Icon = feature.icon
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="group surface-card p-6 cursor-default relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-150 duration-500">
        <Icon className="w-32 h-32" />
      </div>
      <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br relative z-10', feature.bg, 'group-hover:scale-110 transition-transform duration-200')}>
        <Icon className={cn('h-6 w-6', feature.iconColor)} aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-primary-600)] transition-colors">{feature.title}</h3>
      <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
    </motion.div>
  )
})

export default memo(function HomeFeatures() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <motion.div variants={itemVariants} className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Everything you need to succeed</h2>
        <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto">Intelligent tools to accelerate your career journey</p>
      </motion.div>
      <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.title} feature={feature} />
        ))}
      </motion.div>
    </div>
  )
})
