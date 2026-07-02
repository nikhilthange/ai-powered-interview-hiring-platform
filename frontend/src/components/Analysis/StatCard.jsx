import { Card, CardContent } from '../ui/Card'

const colorMap = {
  primary: { bg: 'bg-indigo-50 dark:bg-indigo-950', text: 'text-indigo-600 dark:text-indigo-400' },
  success: { bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-600 dark:text-emerald-400' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-600 dark:text-amber-400' },
  danger: { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-600 dark:text-red-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-600 dark:text-purple-400' },
  default: { bg: 'bg-[var(--bg-tertiary)]', text: 'text-[var(--text-tertiary)]' },
}

export default function StatCard({ icon: Icon, label, value, subtitle, color = 'default' }) {
  const c = colorMap[color] || colorMap.default
  return (
    <Card>
      <CardContent className="p-5 text-center">
        {Icon && (
          <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
        <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
        {subtitle && <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}
