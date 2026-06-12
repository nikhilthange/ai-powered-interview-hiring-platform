import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const variants = {
  primary: 'bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] shadow-sm shadow-[var(--color-primary-500)]/20 hover:shadow-md hover:shadow-[var(--color-primary-500)]/30 active:scale-[0.97]',
  secondary: 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-color)] active:scale-[0.97]',
  danger: 'bg-[var(--color-error)] text-white hover:opacity-90 shadow-sm shadow-[var(--color-error)]/20 active:scale-[0.97]',
  ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
  outline: 'border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--color-primary-300)] active:scale-[0.97]',
}

const sizes = {
  xs: 'px-2.5 py-1 text-xs rounded-lg',
  sm: 'px-3 py-1.5 text-sm rounded-xl',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-5 py-2.5 text-base rounded-xl',
  xl: 'px-6 py-3 text-base rounded-xl',
}

const Button = forwardRef(function Button(
  { className, variant = 'primary', size = 'md', loading, disabled, children, icon: Icon, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/30 disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      {children}
    </button>
  )
})

export default Button
