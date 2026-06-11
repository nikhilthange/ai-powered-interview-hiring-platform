import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

export default function Spinner({ className, size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12', xl: 'h-16 w-16' }
  return (
    <Loader2 className={cn('animate-spin text-[var(--color-primary-500)]', sizes[size], className)} />
  )
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-[var(--text-tertiary)]">Loading...</p>
      </div>
    </div>
  )
}

export function InlineSpinner({ className }) {
  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      <Spinner />
    </div>
  )
}
