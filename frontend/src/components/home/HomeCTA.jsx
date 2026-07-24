import { memo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default memo(function HomeCTA() {
  const { isAuthenticated } = useAuth()

  return (
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
  )
})
