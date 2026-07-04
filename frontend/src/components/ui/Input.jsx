import { forwardRef, useId } from 'react'
import { cn } from '../../lib/utils'

const Input = forwardRef(function Input(
  { className, label, labelHidden, error, suffix, prefix, id, ...props },
  ref
) {
  const generatedId = useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className={cn('block text-sm font-medium text-[var(--text-primary)]', labelHidden && 'sr-only')}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" aria-hidden="true">
            {prefix}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] transition-all duration-200',
            error && 'border-red-400 focus:ring-red-500/20 focus:border-red-500',
            prefix && 'pl-10',
            suffix && 'pr-10',
            className
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" aria-hidden="true">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs text-red-500 mt-1" role="alert">{error}</p>
      )}
    </div>
  )
})

export default Input
