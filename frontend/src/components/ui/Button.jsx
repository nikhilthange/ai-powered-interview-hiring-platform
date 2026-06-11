import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)] shadow-sm shadow-[var(--color-primary-500)]/20',
  secondary: 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-color)] focus:ring-[var(--color-neutral-400)]',
  danger: 'bg-[var(--color-error)] text-white hover:opacity-90 focus:ring-[var(--color-error)] shadow-sm shadow-[var(--color-error)]/20',
  ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] focus:ring-[var(--color-neutral-400)]',
  outline: 'border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] focus:ring-[var(--color-primary-500)]',
}

const sizes = {
  xs: 'px-2.5 py-1 text-xs rounded-md',
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-base rounded-xl',
  xl: 'px-6 py-3 text-base rounded-xl',
}

const Button = forwardRef(function Button(
  { className, variant = 'primary', size = 'md', loading, disabled, children, icon, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : icon && (typeof icon === 'function' || icon?.$$typeof) ? (
        (() => { const I = icon; return <I className="h-4 w-4" /> })()
      ) : icon ? icon : null}
      {children}
    </button>
  )
})

export default Button
