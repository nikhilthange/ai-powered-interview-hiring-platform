import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { ArrowLeft, Home, Search, MapPin } from 'lucide-react'

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 text-center relative overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-32 w-32 rounded-full bg-amber-500/5 blur-3xl animate-float-slow" />
      </div>

      <div className="relative mb-6">
        <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-shift leading-none">
          404
        </div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], y: [0, -5, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-4 -right-4"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 ring-1 ring-amber-200/50 dark:ring-amber-800/30 shadow-lg">
            <Search className="h-7 w-7 text-amber-500" />
          </div>
        </motion.div>
        <motion.div
          animate={{ rotate: [0, -10, 10, 0], y: [0, 5, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-2 -left-8"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 ring-1 ring-indigo-200/50 dark:ring-indigo-800/30">
            <MapPin className="h-5 w-5 text-indigo-500" />
          </div>
        </motion.div>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">Page not found</h1>
      <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-sm leading-relaxed">
        The page you're looking for doesn't exist or has been moved. Let's get you back on track.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 mt-8"
      >
        <Link to="/">
          <Button>
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </Link>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </motion.div>
    </motion.div>
  )
}
