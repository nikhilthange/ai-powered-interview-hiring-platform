import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const Textarea = forwardRef(function Textarea(
  { className, label, error, id, ...props },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          'block w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-150',
          'bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
          'focus:outline-none focus:ring-2 focus:ring-offset-0 resize-y',
          error
            ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20'
            : 'border-[var(--border-color)] focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
    </div>
  )
})

export default Textarea
