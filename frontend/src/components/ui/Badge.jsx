import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
  primary: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  danger: 'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  premium: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white',
}

const sizes = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}

export default function Badge({ className, variant = 'default', size = 'sm', children, pulse, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium leading-none whitespace-nowrap',
        variants[variant],
        sizes[size],
        pulse && 'animate-glow-pulse',
        className
      )}
      {...props}
    >
      {pulse && (
        <span className={cn(
          'inline-block h-1.5 w-1.5 rounded-full animate-pulse',
          variant === 'success' ? 'bg-emerald-500' :
          variant === 'primary' ? 'bg-indigo-500' :
          variant === 'warning' ? 'bg-amber-500' :
          variant === 'danger' ? 'bg-red-500' : 'bg-current'
        )} />
      )}
      {children}
    </span>
  )
}
