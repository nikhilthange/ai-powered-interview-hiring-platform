import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Sparkles, Brain, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

const DEFAULT_STEPS = [
  { icon: '🧠', text: 'Understanding Request...' },
  { icon: '✍️', text: 'Writing Content...' },
  { icon: '⚡', text: 'Optimizing Details...' },
  { icon: '✨', text: 'Finalizing Insights...' },
]

export default function AIStepLoader({
  steps = DEFAULT_STEPS,
  title = 'HireMate AI is processing',
  className,
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (steps.length <= 1) return

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
    }, 1600)

    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 sm:p-12 text-center', className)}>
      {/* Glowing Pulsing Icon Wrapper */}
      <div className="relative mb-6 flex items-center justify-center">
        <motion.div
          animate={shouldReduceMotion ? false : { scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute h-20 w-20 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 blur-xl"
        />
        <motion.div
          animate={shouldReduceMotion ? false : { rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/25 relative z-10"
        >
          <Sparkles className="h-8 w-8 text-white" />
        </motion.div>
      </div>

      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 tracking-tight">{title}</h3>

      {/* Stepped Progress List */}
      <div className="w-full max-w-sm space-y-3 mt-4">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep
          const isCurrent = idx === currentStep
          const isPending = idx > currentStep

          return (
            <motion.div
              key={idx}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={shouldReduceMotion ? false : { opacity: isPending ? 0.4 : 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className={cn(
                'flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-all border',
                isCurrent && 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50 shadow-sm text-indigo-900 dark:text-indigo-200',
                isDone && 'bg-[var(--bg-primary)] border-transparent text-[var(--text-secondary)]',
                isPending && 'bg-transparent border-transparent text-[var(--text-tertiary)]'
              )}
            >
              <span className="text-base shrink-0">{step.icon}</span>
              <span className="flex-1 text-left font-semibold">{step.text}</span>
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : isCurrent ? (
                  <motion.div
                    animate={shouldReduceMotion ? false : { rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="h-4 w-4 text-indigo-500" />
                  </motion.div>
                ) : (
                  <div className="h-2 w-2 rounded-full bg-[var(--border-color)]" />
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
