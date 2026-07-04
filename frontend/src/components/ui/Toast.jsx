import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

const ToastContext = createContext(null)

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles = {
  success: 'border-green-200/50 bg-green-50 text-green-800 dark:border-green-800/50 dark:bg-green-950/80 dark:text-green-200',
  error: 'border-red-200/50 bg-red-50 text-red-800 dark:border-red-800/50 dark:bg-red-950/80 dark:text-red-200',
  warning: 'border-amber-200/50 bg-amber-50 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/80 dark:text-amber-200',
  info: 'border-blue-200/50 bg-blue-50 text-blue-800 dark:border-blue-800/50 dark:bg-blue-950/80 dark:text-blue-200',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, type, title, message }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toastActions = {
    success: (title, message) => addToast({ type: 'success', title, message }),
    error: (title, message) => addToast({ type: 'error', title, message }),
    warning: (title, message) => addToast({ type: 'warning', title, message }),
    info: (title, message) => addToast({ type: 'info', title, message }),
  }

  return (
    <ToastContext.Provider value={{ toast: toastActions, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const Icon = icons[t.type] || Info
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 100, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={cn(
                  'pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-xl',
                  styles[t.type] || styles.info
                )}
                role="alert"
              >
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="flex-1 min-w-0">
                  {t.title && <p className="font-medium text-sm">{t.title}</p>}
                  {t.message && <p className="text-sm opacity-90 mt-0.5">{t.message}</p>}
                </div>
                <button onClick={() => removeToast(t.id)} className="shrink-0 rounded-lg p-0.5 opacity-60 hover:opacity-100 transition-opacity" aria-label="Dismiss">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
