import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { cardHoverMotion, cardHighlightMotion } from '../../lib/motion'

export function Card({ className, hover, children, highlight, ...props }) {
  const Component = hover || highlight ? motion.div : 'div'
  const shouldReduceMotion = useReducedMotion()
  const motionProps = {}

  if (!shouldReduceMotion) {
    if (hover) {
      motionProps.whileHover = cardHoverMotion.whileHover
      motionProps.whileTap = cardHoverMotion.whileTap
    }
    if (highlight) {
      motionProps.whileHover = cardHighlightMotion.whileHover
      motionProps.whileTap = cardHighlightMotion.whileTap
    }
  }

  return (
    <Component
      className={cn(
        'rounded-[24px] bg-[var(--bg-primary)] surface-card',
        highlight && 'relative overflow-hidden',
        className
      )}
      {...motionProps}
      {...props}
    >
      {highlight && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      )}
      {children}
    </Component>
  )
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('px-5 py-4 sm:px-6 sm:py-5 border-b border-[var(--border-color)]', className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('p-5 sm:p-6', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('px-5 py-4 sm:px-6 sm:py-4 border-t border-[var(--border-color)]', className)} {...props}>
      {children}
    </div>
  )
}
