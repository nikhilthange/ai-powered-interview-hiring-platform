import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, className, size = 'md' }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    if (open) document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose?.() }}
    >
      <div
        className={cn(
          'w-full rounded-2xl border bg-[var(--bg-primary)] border-[var(--border-color)] shadow-xl animate-scaleIn',
          sizes[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-[var(--border-color)] px-6 py-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className={cn('p-6', !title && 'pt-6')}>{children}</div>
      </div>
    </div>
  )
}
