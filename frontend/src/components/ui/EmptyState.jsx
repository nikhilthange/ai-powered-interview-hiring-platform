import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Inbox, Briefcase, FileText, Bell, Bookmark, Building2, CalendarCheck } from 'lucide-react'
import Button from './Button'

const PRESETS = {
  NoJobs: {
    icon: Briefcase,
    title: 'No jobs found',
    description: 'We couldn’t find any jobs matching your search criteria. Try adjusting your search or filters.',
  },
  NoApplications: {
    icon: FileText,
    title: 'No applications yet',
    description: 'You haven’t submitted any applications. Browse open roles and start applying today!',
  },
  NoNotifications: {
    icon: Bell,
    title: 'No notifications yet',
    description: 'You’re all caught up! Updates about your applications and interviews will appear here.',
  },
  NoSavedJobs: {
    icon: Bookmark,
    title: 'No saved jobs',
    description: 'Bookmark jobs you’re interested in to easily review and apply to them later.',
  },
  NoCompanies: {
    icon: Building2,
    title: 'No companies found',
    description: 'No organization matched your current filter selection. Try adjusting your parameters.',
  },
  NoInterviews: {
    icon: CalendarCheck,
    title: 'No upcoming interviews',
    description: 'When recruiters schedule mock sessions or interviews, they will be listed here.',
  },
}

export default function EmptyState({
  preset,
  icon: IconOverride,
  title: titleOverride,
  description: descriptionOverride,
  action,
  className,
  small,
  animated = true,
  gradient = true,
}) {
  const shouldReduceMotion = useReducedMotion()
  const presetConfig = preset ? PRESETS[preset] : null

  const Icon = IconOverride || presetConfig?.icon || Inbox
  const title = titleOverride || presetConfig?.title || 'Nothing here yet'
  const description = descriptionOverride || presetConfig?.description

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center relative overflow-hidden rounded-3xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-sm',
        small ? 'py-10 px-4' : 'py-16 sm:py-20 px-6',
        className
      )}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
        animate={shouldReduceMotion ? false : { scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
        className={cn(
          'mb-5 flex items-center justify-center rounded-2xl ring-1 shadow-inner relative z-10',
          gradient
            ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/60 dark:to-purple-950/60 ring-indigo-200/60 dark:ring-indigo-800/40 text-indigo-600 dark:text-indigo-400'
            : 'bg-[var(--bg-tertiary)] ring-[var(--border-color)] text-[var(--text-tertiary)]',
          small ? 'h-12 w-12' : 'h-16 w-16 sm:h-20 sm:w-20'
        )}
      >
        <Icon className={small ? 'h-6 w-6' : 'h-8 w-8 sm:h-10 sm:w-10'} aria-hidden="true" />
      </motion.div>

      <h3 className={cn('font-bold text-[var(--text-primary)] tracking-tight relative z-10', small ? 'text-base' : 'text-xl sm:text-2xl')}>{title}</h3>

      {description && (
        <p className={cn('mt-2 max-w-sm text-sm text-[var(--text-secondary)] leading-relaxed relative z-10')}>{description}</p>
      )}

      {action && (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6 relative z-10"
        >
          <Button {...action.props}>{action.label}</Button>
        </motion.div>
      )}
    </div>
  )

  if (animated && !shouldReduceMotion) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {content}
      </motion.div>
    )
  }

  return content
}
