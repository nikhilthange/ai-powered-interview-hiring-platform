import { cn } from '../../lib/utils'

export function Card({ className, hover, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-[var(--bg-primary)] border-[var(--border-color)] shadow-sm',
        hover && 'transition-all duration-200 hover:shadow-md hover:border-[var(--color-primary-200)] dark:hover:border-[var(--color-primary-800)]',
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
    <div className={cn('px-5 py-4 border-b border-[var(--border-color)]', className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('px-5 py-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('px-5 py-4 border-t border-[var(--border-color)]', className)} {...props}>
      {children}
    </div>
  )
}
