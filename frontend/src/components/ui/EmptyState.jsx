import { cn } from '../../lib/utils'
import { Inbox } from 'lucide-react'
import Button from './Button'

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  action,
  className,
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center', className)}>
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)] ring-1 ring-[var(--border-color)]">
        <Icon className="h-8 w-8 text-[var(--text-tertiary)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-[var(--text-secondary)] leading-relaxed">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          <Button {...action.props}>{action.label}</Button>
        </div>
      )}
    </div>
  )
}
