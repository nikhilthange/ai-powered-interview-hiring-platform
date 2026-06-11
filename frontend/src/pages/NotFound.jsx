import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-bold text-gradient">404</div>
      <h2 className="mt-6 text-heading-md font-semibold text-[var(--text-primary)]">Page not found</h2>
      <p className="mt-2 text-body-md text-[var(--text-secondary)] max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="mt-8">
        <Button icon={Home}>Go home</Button>
      </Link>
    </div>
  )
}
