import { forwardRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'
import { buttonMotion } from '../../lib/motion'

const variants = {
  primary: 'bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] shadow-sm shadow-[var(--color-primary-500)]/20 hover:shadow-md hover:shadow-[var(--color-primary-500)]/30',
  secondary: 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-color)]',
  danger: 'bg-[var(--color-error)] text-white hover:opacity-90 shadow-sm shadow-[var(--color-error)]/20',
  ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
  outline: 'border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--color-primary-300)]',
  gradient: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-sm shadow-indigo-500/20 hover:shadow-md hover:shadow-indigo-500/30',
}

const sizes = {
  xs: 'px-3 py-1.5 text-xs rounded-full',
  sm: 'px-4 py-2 text-sm rounded-full',
  md: 'px-5 py-2.5 text-sm rounded-full',
  lg: 'px-6 py-3 text-base rounded-full',
  xl: 'px-8 py-3.5 text-base rounded-full',
}

const Button = forwardRef(function Button(
  { className, variant = 'primary', size = 'md', loading, disabled, children, icon: Icon, ...props },
  ref
) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      whileTap={!disabled && !loading && !shouldReduceMotion ? buttonMotion.whileTap : undefined}
      whileHover={!disabled && !loading && !shouldReduceMotion ? buttonMotion.whileHover : undefined}
      transition={buttonMotion.transition}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/30 disabled:opacity-50 disabled:cursor-not-allowed select-none relative overflow-hidden',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <motion.div
          animate={shouldReduceMotion ? {} : { rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="flex items-center justify-center"
        >
          <Loader2 className="h-4 w-4" aria-hidden="true" />
        </motion.div>
      ) : Icon ? (
        <Icon className="h-4 w-4" aria-hidden="true" />
      ) : null}
      {children}
    </motion.button>
  )
})

export default Button
