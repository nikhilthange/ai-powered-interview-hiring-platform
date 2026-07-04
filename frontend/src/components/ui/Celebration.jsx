import { useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { CheckCircle, Sparkles, PartyPopper } from 'lucide-react'
import Button from './Button'

const shapes = ['circle', 'square', 'triangle']

const colors = [
  'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
  'bg-emerald-500', 'bg-amber-500', 'bg-cyan-500',
]

const focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Celebration({
  open,
  onClose,
  title = 'Success!',
  description = 'Action completed successfully.',
  action,
  variant = 'success',
}) {
  const contentRef = useRef(null)
  const triggerRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
      requestAnimationFrame(() => {
        const firstFocusable = contentRef.current?.querySelector(focusableSelector)
        firstFocusable?.focus()
      })
    } else {
      if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
        requestAnimationFrame(() => triggerRef.current.focus())
      }
    }
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

  const IconMap = {
    success: CheckCircle,
    sparkles: Sparkles,
    party: PartyPopper,
  }
  const Icon = IconMap[variant] || CheckCircle

  const motionProps = prefersReducedMotion ? { initial: {}, animate: {}, exit: {}, transition: {} } : {}

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          animate={prefersReducedMotion ? {} : { opacity: 1 }}
          exit={prefersReducedMotion ? {} : { opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {!prefersReducedMotion && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: -20,
                    rotate: 0,
                    scale: 0.5 + Math.random() * 0.5,
                  }}
                  animate={{
                    y: window.innerHeight + 20,
                    rotate: 720,
                    x: Math.random() * window.innerWidth,
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    repeat: Infinity,
                    ease: 'easeIn',
                  }}
                  className={cn(
                    'absolute h-3 w-3',
                    shapes[i % 3] === 'circle' ? 'rounded-full' : shapes[i % 3] === 'square' ? '' : 'rotate-45',
                    colors[i % 6]
                  )}
                />
              ))}
            </div>
          )}
          <motion.div
            ref={contentRef}
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-sm rounded-2xl border bg-[var(--bg-primary)] border-[var(--border-color)] shadow-elevated p-8 text-center"
            {...motionProps}
          >
            <motion.div
              initial={prefersReducedMotion ? {} : { scale: 0 }}
              animate={prefersReducedMotion ? {} : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 ring-1 ring-emerald-200/50 dark:ring-emerald-800/30"
            >
              <Icon className="h-10 w-10 text-emerald-500" aria-hidden="true" />
            </motion.div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{title}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2">{description}</p>
            {action && (
              <div className="mt-6">
                <Button {...action.props} className="w-full">{action.label}</Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
