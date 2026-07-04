import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Loader2, Sparkles, Brain } from 'lucide-react'

export default function Spinner({ className, size = 'md', icon = 'default', label }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  const icons = {
    default: Loader2,
    sparkles: Sparkles,
    brain: Brain,
  }

  const rotations = {
    default: true,
    sparkles: true,
    brain: false,
  }

  const IconComponent = icons[icon] || Loader2

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4">
      <motion.div
        animate={rotations[icon] ? { rotate: 360 } : { scale: [1, 1.15, 1] }}
        transition={rotations[icon]
          ? { duration: 1.5, repeat: Infinity, ease: 'linear' }
          : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <IconComponent className={cn('text-[var(--color-primary-500)]', sizes[size], className)} />
      </motion.div>
      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-[var(--text-secondary)]"
        >
          {label}
        </motion.p>
      )}
    </div>
  )
}
