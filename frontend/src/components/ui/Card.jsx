import { cn } from '../../lib/utils'

export function Card({ className, hover, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-[var(--bg-primary)] border-[var(--border-color)] shadow-sm',
        hover && 'card-hover-effect',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('px-5 py-4 sm:px-6 sm:py-5 border-b border-[var(--border-color)]', className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('p-5 sm:p-6', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('px-5 py-4 sm:px-6 sm:py-4 border-t border-[var(--border-color)]', className)} {...props}>
      {children}
    </div>
  )
}
