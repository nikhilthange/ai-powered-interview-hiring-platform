import { cn } from '../../lib/utils'

export default function Spinner({ className, size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12', xl: 'h-16 w-16' }
  return (
    <svg className={cn('animate-spin text-[var(--color-primary-500)]', sizes[size], className)} viewBox="0 0 24 24" fill="none" aria-label="Loading">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading page">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-[var(--border-color)]" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-transparent border-t-[var(--color-primary-500)] animate-spin" />
        </div>
        <p className="text-sm text-[var(--text-tertiary)]">Loading...</p>
      </div>
    </div>
  )
}

export function InlineSpinner({ className }) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)} role="status" aria-label="Loading">
      <div className="relative">
        <div className="h-6 w-6 rounded-full border-2 border-[var(--border-color)]" />
        <div className="absolute inset-0 h-6 w-6 rounded-full border-2 border-transparent border-t-[var(--color-primary-500)] animate-spin" />
      </div>
    </div>
  )
}
