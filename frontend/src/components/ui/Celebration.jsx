import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { CheckCircle, Sparkles, PartyPopper } from 'lucide-react'
import Button from './Button'

const shapes = ['circle', 'square', 'triangle']

const colors = [
  'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
  'bg-emerald-500', 'bg-amber-500', 'bg-cyan-500',
]

export default function Celebration({
  open,
  onClose,
  title = 'Success!',
  description = 'Action completed successfully.',
  action,
  variant = 'success',
}) {
  const IconMap = {
    success: CheckCircle,
    sparkles: Sparkles,
    party: PartyPopper,
  }
  const Icon = IconMap[variant] || CheckCircle

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-sm rounded-2xl border bg-[var(--bg-primary)] border-[var(--border-color)] shadow-elevated p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 ring-1 ring-emerald-200/50 dark:ring-emerald-800/30"
            >
              <Icon className="h-10 w-10 text-emerald-500" />
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
