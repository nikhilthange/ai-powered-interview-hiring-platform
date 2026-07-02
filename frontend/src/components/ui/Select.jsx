import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(function Select(
  { className, label, error, id, children, placeholder, ...props },
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
        <select
          ref={ref}
          id={id}
          className={cn(
            'block w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-150 appearance-none',
            'bg-[var(--bg-primary)] text-[var(--text-primary)]',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20'
              : 'border-[var(--border-color)] focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]/20',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
      </div>
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
    </div>
  )
})

export default Select
