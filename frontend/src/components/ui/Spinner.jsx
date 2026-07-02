import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

export default function Spinner({ className, size = 'md' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={cn('animate-spin text-[var(--color-primary-500)]', sizes[size], className)} />
    </div>
  )
}
