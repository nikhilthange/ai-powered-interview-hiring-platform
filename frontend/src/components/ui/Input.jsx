import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const Input = forwardRef(function Input(
  { className, label, error, type = 'text', id, prefix, suffix, ...props },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--text-tertiary)]">
            {prefix}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          className={cn(
            'block w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-150',
            'bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20'
              : 'border-[var(--border-color)] focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]/20',
            prefix && 'pl-10',
            suffix && 'pr-10',
            className
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--text-tertiary)]">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
    </div>
  )
})

export default Input
