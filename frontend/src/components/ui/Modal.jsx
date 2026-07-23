import { memo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { X } from 'lucide-react'
import { modalOverlayVariants, modalContainerVariants } from '../../lib/motion'

const focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

const Modal = memo(function Modal({ open, onClose, title, children, className, size = 'md' }) {
  const overlayRef = useRef(null)
  const contentRef = useRef(null)
  const triggerRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => {
        const firstFocusable = contentRef.current?.querySelector(focusableSelector)
        firstFocusable?.focus()
      })
    } else {
      document.body.style.overflow = ''
      if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
        requestAnimationFrame(() => triggerRef.current.focus())
      }
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose?.()
      return
    }
    if (e.key === 'Tab' && contentRef.current) {
      const focusables = contentRef.current.querySelectorAll(focusableSelector)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleKeyDown])

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full',
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          variants={prefersReducedMotion ? undefined : modalOverlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === overlayRef.current) onClose?.() }}
          role="dialog"
          aria-modal="true"
          aria-label={title || 'Dialog'}
        >
          <motion.div
            ref={contentRef}
            variants={prefersReducedMotion ? undefined : modalContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'w-full rounded-2xl border bg-[var(--bg-primary)] border-[var(--border-color)] shadow-elevated',
              sizes[size],
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-[var(--border-color)] px-5 py-4 sm:px-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            )}
            <div className={cn('p-5 sm:p-6', !title && 'pt-6')}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

export default Modal
