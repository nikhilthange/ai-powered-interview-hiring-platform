import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-4">
        404
      </div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Page not found</h1>
      <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex items-center gap-3 mt-8">
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
      </div>
    </div>
  )
}
