import { forwardRef, useId } from 'react'
import { cn } from '../../lib/utils'

const Input = forwardRef(function Input(
  { className, label, labelHidden, error, suffix, prefix, id, floating = true, ...props },
  ref
) {
  const generatedId = useId()
  const inputId = id || generatedId
  const errorId = `${inputId}-error`

  if (!floating || labelHidden) {
    return (
      <div className="space-y-1.5">
        {label && !labelHidden && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--text-primary)]"
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
              'w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/30 focus:border-[var(--color-primary-500)] transition-all duration-200 shadow-sm',
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
  }

  // Floating label style
  return (
    <div className="relative group w-full">
      <div className="relative w-full">
        <input
          ref={ref}
          id={inputId}
          placeholder={props.placeholder || ' '}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'peer w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 pb-2 pt-6 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/30 focus:border-[var(--color-primary-500)] transition-all duration-200 shadow-sm placeholder:opacity-0 focus:placeholder:opacity-100',
            error && 'border-red-400 focus:ring-red-500/20 focus:border-red-500',
            prefix && 'pl-10',
            suffix && 'pr-10',
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'absolute left-4 top-2 text-xs text-[var(--text-tertiary)] transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--color-primary-500)] cursor-text select-none z-10',
              prefix && 'peer-placeholder-shown:left-10 left-10 peer-focus:left-4',
              error && 'peer-focus:text-red-500'
            )}
          >
            {label}
          </label>
        )}
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] z-20" aria-hidden="true">
            {prefix}
          </div>
        )}
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] z-20" aria-hidden="true">
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
