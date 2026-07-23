import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Loader2, Sparkles, Brain } from 'lucide-react'

export function AnimatedDots({ className, dotClassName }) {
  const shouldReduceMotion = useReducedMotion()

  const dotVariants = {
    initial: { y: 0, opacity: 0.4 },
    animate: { y: -4, opacity: 1 },
  }

  const containerTransition = {
    repeat: Infinity,
    repeatType: 'reverse',
    duration: 0.4,
    ease: 'easeInOut',
  }

  if (shouldReduceMotion) {
    return (
      <span className={cn('inline-flex items-center gap-1', className)}>
        <span className={cn('h-1.5 w-1.5 rounded-full bg-current opacity-75', dotClassName)} />
        <span className={cn('h-1.5 w-1.5 rounded-full bg-current opacity-75', dotClassName)} />
        <span className={cn('h-1.5 w-1.5 rounded-full bg-current opacity-75', dotClassName)} />
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)} aria-label="Loading">
      <motion.span
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={{ ...containerTransition, delay: 0 }}
        className={cn('h-1.5 w-1.5 rounded-full bg-current', dotClassName)}
      />
      <motion.span
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={{ ...containerTransition, delay: 0.15 }}
        className={cn('h-1.5 w-1.5 rounded-full bg-current', dotClassName)}
      />
      <motion.span
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={{ ...containerTransition, delay: 0.3 }}
        className={cn('h-1.5 w-1.5 rounded-full bg-current', dotClassName)}
      />
    </span>
  )
}

export default function Spinner({ className, size = 'md', icon = 'default', label, variant = 'spinner' }) {
  const shouldReduceMotion = useReducedMotion()

  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-4" role="status" aria-live="polite">
        <AnimatedDots className="text-[var(--color-primary-500)]" dotClassName="h-2 w-2" />
        {label && <p className="text-xs text-[var(--text-secondary)]">{label}</p>}
      </div>
    )
  }

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
    <div className="flex flex-col items-center justify-center gap-3 p-4" role="status" aria-live="polite" aria-label={label || 'Loading'}>
      <motion.div
        animate={shouldReduceMotion ? {} : rotations[icon] ? { rotate: 360 } : { scale: [1, 1.15, 1] }}
        transition={shouldReduceMotion ? {} : rotations[icon]
          ? { duration: 1.5, repeat: Infinity, ease: 'linear' }
          : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <IconComponent className={cn('text-[var(--color-primary-500)]', sizes[size], className)} aria-hidden="true" />
      </motion.div>
      {label && (
        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0 }}
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
