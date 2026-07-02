import { Card, CardContent } from '../ui/Card'
import Badge from '../ui/Badge'

export default function SectionCard({ icon: Icon, title, badge, children, color = 'indigo' }) {
  const colorClasses = {
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950', text: 'text-indigo-600 dark:text-indigo-400' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-600 dark:text-emerald-400' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-600 dark:text-amber-400' },
    red: { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-600 dark:text-red-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-600 dark:text-purple-400' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-600 dark:text-blue-400' },
  }
  const c = colorClasses[color] || colorClasses.indigo

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          {Icon && (
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.bg} ${c.text}`}>
              <Icon className="h-4 w-4" />
            </div>
          )}
          <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
          {badge != null && <Badge variant="warning" size="xs">{badge}</Badge>}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}
