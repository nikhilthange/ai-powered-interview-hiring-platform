import { forwardRef, useId } from 'react'
import { cn } from '../../lib/utils'
import { ChevronDown } from 'lucide-react'

const Select = forwardRef(function Select(
  { className, label, labelHidden, error, options, placeholder, id, ...props },
  ref
) {
  const generatedId = useId()
  const selectId = id || generatedId
  const errorId = `${selectId}-error`

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className={cn('block text-sm font-medium text-[var(--text-primary)]', labelHidden && 'sr-only')}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full appearance-none rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 pr-10 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] transition-all duration-200',
            error && 'border-red-400 focus:ring-red-500/20 focus:border-red-500',
            !props.value && 'text-[var(--text-tertiary)]',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] pointer-events-none" aria-hidden="true" />
      </div>
      {error && (
        <p id={errorId} className="text-xs text-red-500 mt-1" role="alert">{error}</p>
      )}
    </div>
  )
})

export default Select
