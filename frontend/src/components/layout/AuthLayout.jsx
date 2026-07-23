import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { pageVariants } from '../../lib/motion'

export default function AuthLayout() {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()

  return (
    <main id="main-content" role="region" aria-label="Authentication" className="min-h-screen bg-[var(--bg-secondary)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={shouldReduceMotion ? undefined : pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full min-h-screen"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
