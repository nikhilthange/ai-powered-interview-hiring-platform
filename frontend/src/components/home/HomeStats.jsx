import { memo } from 'react'
import { motion } from 'framer-motion'

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '50K+', label: 'Resumes Analyzed' },
  { value: '5K+', label: 'Mock Interviews' },
  { value: '95%', label: 'Satisfaction Rate' },
]

export default memo(function HomeStats() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
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
  )
})
