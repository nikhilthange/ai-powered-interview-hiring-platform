import { forwardRef, useId } from 'react'
import { cn } from '../../lib/utils'

const Textarea = forwardRef(function Textarea(
  { className, label, labelHidden, error, id, ...props },
  ref
) {
  const generatedId = useId()
  const textareaId = id || generatedId
  const errorId = `${textareaId}-error`

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className={cn('block text-sm font-medium text-[var(--text-primary)]', labelHidden && 'sr-only')}
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] transition-all duration-200 resize-none min-h-[100px]',
          error && 'border-red-400 focus:ring-red-500/20 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs text-red-500 mt-1" role="alert">{error}</p>
      )}
    </div>
  )
})

export default Textarea
