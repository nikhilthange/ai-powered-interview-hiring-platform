import { Component } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import { RefreshCw, Home, Bug } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    this.setState({ errorInfo: info })
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-red-500/5 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl" />
          </div>
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-2xl bg-red-100 dark:bg-red-950/30 opacity-30" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50 ring-1 ring-red-200/50 dark:ring-red-800/30">
              <Bug className="h-10 w-10 text-[var(--color-error)]" />
            </div>
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Something went wrong</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              An unexpected error occurred. Our team has been notified. Please try again or return home.
            </p>
            {this.state.error?.message && (
              <p className="text-xs text-[var(--text-tertiary)] font-mono mt-2 p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] max-w-md mx-auto truncate">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Link to="/">
              <Button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
