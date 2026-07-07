import { motion } from 'framer-motion'
import { getProfileCompletionDetails } from '../../lib/utils'
import { CheckCircle2, Circle, PartyPopper, AlertTriangle, Award } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'

export default function ProfileCompletion({ profile, user }) {
  const { completionPercentage, completedFields, missingFields } = getProfileCompletionDetails(profile, user)

  const getBarColor = (pct) => {
    if (pct >= 100) return 'from-emerald-400 to-emerald-500'
    if (pct >= 70) return 'from-amber-400 to-amber-500'
    if (pct >= 40) return 'from-orange-400 to-orange-500'
    return 'from-red-400 to-red-500'
  }

  const getLabelColor = (pct) => {
    if (pct >= 100) return 'text-emerald-600 dark:text-emerald-400'
    if (pct >= 70) return 'text-amber-600 dark:text-amber-400'
    if (pct >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 sm:p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50">
          <Award className="h-5 w-5 text-amber-600" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-semibold text-[var(--text-primary)]">Profile Completion</h2>
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-1">
        <span className={`text-3xl font-bold ${getLabelColor(completionPercentage)}`}>
          {completionPercentage}%
        </span>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${getBarColor(completionPercentage)}`}
        />
      </div>

      {completionPercentage === 100 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          <PartyPopper className="h-5 w-5 shrink-0" />
          <span className="font-medium">Profile Complete!</span>
        </div>
      )}

      {completionPercentage < 70 && completionPercentage > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>Complete your profile to improve recruiter visibility.</span>
        </div>
      )}

      {completedFields.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Completed</h3>
          <div className="flex flex-wrap gap-1.5">
            {completedFields.map((field) => (
              <span
                key={field}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"
              >
                <CheckCircle2 className="h-3 w-3" />
                {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {missingFields.length > 0 && (
        <div className="mt-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Missing</h3>
          <div className="flex flex-wrap gap-1.5">
            {missingFields.map((field) => (
              <span
                key={field}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-tertiary)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]"
              >
                <Circle className="h-3 w-3" />
                {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {missingFields.length > 0 && (
        <div className="mt-4">
          <Link to="/profile">
            <Button size="sm" className="w-full">
              Complete Your Profile
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
