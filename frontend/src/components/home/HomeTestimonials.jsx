import { memo } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

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

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const TestimonialCard = memo(function TestimonialCard({ t }) {
  return (
    <motion.div
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
  )
})

export default memo(function HomeTestimonials() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <motion.div variants={itemVariants} className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Loved by professionals</h2>
      </motion.div>
      <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <TestimonialCard key={t.name} t={t} />
        ))}
      </motion.div>
    </div>
  )
})
