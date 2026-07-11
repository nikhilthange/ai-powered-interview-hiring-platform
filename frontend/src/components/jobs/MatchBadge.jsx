import { cn } from '../../lib/utils'

const LEVELS = [
  { min: 95, label: 'Excellent Match', class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' },
  { min: 85, label: 'Good Match', class: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-300 dark:border-green-700' },
  { min: 70, label: 'Average Match', class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-700' },
  { min: 50, label: 'Fair Match', class: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-300 dark:border-orange-700' },
  { min: 0, label: 'Needs Improvement', class: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-300 dark:border-red-700' },
]

function getLevel(score) {
  return LEVELS.find(l => score >= l.min) || LEVELS[LEVELS.length - 1]
}

export default function MatchBadge({ score, size = 'md' }) {
  const level = getLevel(score)
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1'

  return (
    <div className={cn('inline-flex items-center gap-1.5', size === 'sm' ? '' : 'flex-col')}>
      <span className={cn(
        'inline-flex items-center gap-1 rounded-lg border font-semibold',
        level.class,
        sizeClass
      )}>
        <span className={cn(
          'rounded-sm',
          score >= 95 ? 'text-emerald-600 dark:text-emerald-300' :
          score >= 85 ? 'text-green-600 dark:text-green-300' :
          score >= 70 ? 'text-amber-600 dark:text-amber-300' :
          score >= 50 ? 'text-orange-600 dark:text-orange-300' :
          'text-red-600 dark:text-red-300'
        )}>
          {score}%
        </span>
      </span>
      {size !== 'sm' && (
        <span className="text-[10px] font-medium text-[var(--text-tertiary)]">{level.label}</span>
      )}
    </div>
  )
}

export function MatchScoreBar({ score }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            score >= 95 ? 'bg-emerald-500' :
            score >= 85 ? 'bg-green-500' :
            score >= 70 ? 'bg-amber-500' :
            score >= 50 ? 'bg-orange-500' :
            'bg-red-500'
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={cn(
        'text-xs font-bold w-10 text-right',
        score >= 95 ? 'text-emerald-600 dark:text-emerald-400' :
        score >= 85 ? 'text-green-600 dark:text-green-400' :
        score >= 70 ? 'text-amber-600 dark:text-amber-400' :
        score >= 50 ? 'text-orange-600 dark:text-orange-400' :
        'text-red-600 dark:text-red-400'
      )}>
        {score}%
      </span>
    </div>
  )
}
