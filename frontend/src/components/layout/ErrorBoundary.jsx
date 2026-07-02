import { Component } from 'react'
import Button from '../ui/Button'
import { AlertCircle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-error-bg)]">
            <AlertCircle className="h-8 w-8 text-[var(--color-error)]" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Something went wrong</h2>
          <p className="text-sm text-[var(--text-secondary)] text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.href = '/'
            }}
          >
            Go Home
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
