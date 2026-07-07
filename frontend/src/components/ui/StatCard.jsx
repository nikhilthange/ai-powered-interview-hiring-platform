import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

const colorMap = {
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950', icon: 'text-indigo-600 dark:text-indigo-400' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950', icon: 'text-emerald-600 dark:text-emerald-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950', icon: 'text-purple-600 dark:text-purple-400' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950', icon: 'text-amber-600 dark:text-amber-400' },
  red: { bg: 'bg-red-50 dark:bg-red-950', icon: 'text-red-600 dark:text-red-400' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-950', icon: 'text-blue-600 dark:text-blue-400' },
  primary: { bg: 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/30', icon: 'text-[var(--color-primary-600)]' },
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  color = 'primary',
  subtitle,
  trend,
  trendLabel,
  onClick,
  className,
}) {
  const colors = colorMap[color] || colorMap.primary
  const TrendIcon = trend > 0 ? TrendingUp : TrendingDown
  const trendColor = trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-600' : 'text-[var(--text-tertiary)]'

  const content = (
    <div className={cn(
      'rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 sm:p-6 transition-all duration-200',
      onClick && 'cursor-pointer hover:shadow-md hover:-translate-y-0.5',
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{label}</span>
        <div className={cn('rounded-xl p-2', colors.bg)}>
          {Icon && <Icon className={cn('h-4 w-4', colors.icon)} />}
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      {subtitle && <p className="text-xs text-[var(--text-tertiary)] mt-1">{subtitle}</p>}
      {trend !== undefined && (
        <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', trendColor)}>
          <TrendIcon className="h-3 w-3" />
          <span>{Math.abs(trend)}%</span>
          {trendLabel && <span className="text-[var(--text-tertiary)] font-normal">vs {trendLabel}</span>}
        </div>
      )}
    </div>
  )

  if (onClick) {
    return <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={onClick}>{content}</motion.div>
  }

  return content
}
