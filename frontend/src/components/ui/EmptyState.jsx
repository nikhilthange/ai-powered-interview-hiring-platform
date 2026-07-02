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
}) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      small ? 'py-12 px-4' : 'py-16 sm:py-20 px-6',
      className
    )}>
      <div className={cn(
        'mb-5 flex items-center justify-center rounded-2xl bg-[var(--bg-tertiary)] ring-1 ring-[var(--border-color)]',
        small ? 'h-12 w-12' : 'h-16 w-16'
      )}>
        <Icon className={cn('text-[var(--text-tertiary)]', small ? 'h-6 w-6' : 'h-8 w-8')} />
      </div>
      <h3 className={cn('font-semibold text-[var(--text-primary)]', small ? 'text-base' : 'text-lg')}>{title}</h3>
      {description && (
        <p className={cn('mt-1.5 max-w-sm text-sm text-[var(--text-secondary)] leading-relaxed', className)}>{description}</p>
      )}
      {action && (
        <div className="mt-6">
          <Button {...action.props}>{action.label}</Button>
        </div>
      )}
    </div>
  )
}
