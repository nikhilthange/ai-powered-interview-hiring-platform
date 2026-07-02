import { Card, CardContent } from '../ui/Card'

export default function ScoreCard({ score, label, subtitle, size = 'lg' }) {
  const getScoreColor = (s) => {
    if (s >= 80) return { stroke: '#22c55e', text: 'text-emerald-600 dark:text-emerald-400' }
    if (s >= 60) return { stroke: '#f59e0b', text: 'text-amber-600 dark:text-amber-400' }
    return { stroke: '#ef4444', text: 'text-red-600 dark:text-red-400' }
  }

  const colors = getScoreColor(score)
  const radius = size === 'lg' ? 42 : 32
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (circumference * score) / 100
  const dim = size === 'lg' ? 'w-24 h-24' : 'w-20 h-20'
  const textSize = size === 'lg' ? 'text-2xl' : 'text-xl'

  return (
    <Card>
      <CardContent className="p-6 text-center">
        <div className={`relative mx-auto mb-4 ${dim}`}>
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={colors.stroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 50 50)"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`${textSize} font-bold ${colors.text}`}>{score}</span>
          </div>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">{label}</p>
        {subtitle && <p className="text-xs text-[var(--text-tertiary)]">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}
