import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Inbox } from 'lucide-react'
import Button from './Button'

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  action,
  className,
  small,
  animated = true,
  gradient,
}) {
  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      small ? 'py-12 px-4' : 'py-16 sm:py-20 px-6',
      className
    )}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.05 }}
        className={cn(
          'mb-5 flex items-center justify-center rounded-2xl ring-1 transition-all duration-300',
          gradient
            ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 ring-indigo-200/50 dark:ring-indigo-800/30'
            : 'bg-[var(--bg-tertiary)] ring-[var(--border-color)]',
          small ? 'h-12 w-12' : 'h-16 w-16'
        )}
      >
        <Icon className={cn(
          gradient ? 'text-indigo-500' : 'text-[var(--text-tertiary)]',
          small ? 'h-6 w-6' : 'h-8 w-8'
        )} />
      </motion.div>
      <h3 className={cn('font-semibold text-[var(--text-primary)]', small ? 'text-base' : 'text-lg')}>{title}</h3>
      {description && (
        <p className={cn('mt-1.5 max-w-sm text-sm text-[var(--text-secondary)] leading-relaxed')}>{description}</p>
      )}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6"
        >
          <Button {...action.props}>{action.label}</Button>
        </motion.div>
      )}
    </div>
  )

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {content}
      </motion.div>
    )
  }

  return content
}
