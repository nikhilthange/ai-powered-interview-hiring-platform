import { useReducedMotion } from 'framer-motion'

// Shared Easing Curves & Springs
export const TRANSITIONS = {
  easeOut: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  fast: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
  slow: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  springSoft: { type: 'spring', stiffness: 400, damping: 28 },
  springBouncy: { type: 'spring', stiffness: 500, damping: 22 },
}

// Page Transition Variants (200 - 300ms duration)
export const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } },
}

// Button Micro-Interactions
export const buttonMotion = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: TRANSITIONS.fast,
}

// Card Hover Lift (-6px)
export const cardHoverMotion = {
  whileHover: { y: -6, transition: TRANSITIONS.easeOut },
  whileTap: { scale: 0.99 },
}

export const cardHighlightMotion = {
  whileHover: { y: -6, transition: TRANSITIONS.easeOut },
  whileTap: { scale: 0.99 },
}

// Dropdown & Popover Motion (Fade + Scale)
export const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1, y: 0, transition: TRANSITIONS.fast },
  exit: { opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.1, ease: 'easeIn' } },
}

// Modal Backdrop & Container Motion
export const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const modalContainerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: TRANSITIONS.easeOut },
  exit: { opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.15, ease: 'easeIn' } },
}

// Staggered Containers & Items
export const staggerContainer = (staggerDelay = 0.05) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
    },
  },
})

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.easeOut,
  },
}

// Interactive State Toggles (Bookmark/Heart burst, Follow button state)
export const stateToggleMotion = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: TRANSITIONS.springBouncy },
  exit: { scale: 0.8, opacity: 0, transition: TRANSITIONS.fast },
}

export const badgePopVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: TRANSITIONS.springBouncy },
  exit: { scale: 0, opacity: 0, transition: TRANSITIONS.fast },
}

// Helper hook to obtain motion props respecting prefers-reduced-motion
export function useMotionConfig(motionProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return {
      initial: motionProps?.initial ? { opacity: 0 } : undefined,
      animate: motionProps?.animate ? { opacity: 1 } : undefined,
      exit: motionProps?.exit ? { opacity: 0 } : undefined,
      whileHover: undefined,
      whileTap: undefined,
      transition: { duration: 0.01 },
    }
  }

  return motionProps
}
