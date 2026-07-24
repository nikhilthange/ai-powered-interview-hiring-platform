import { useCallback } from 'react'
import { Link } from 'react-router-dom'

const routeImports = {
  '/': () => import('../../pages/Home'),
  '/jobs': () => import('../../pages/Jobs'),
  '/login': () => import('../../pages/auth/Login'),
  '/register': () => import('../../pages/auth/Register'),
  '/dashboard': () => import('../../pages/candidate/Dashboard'),
  '/profile': () => import('../../pages/candidate/Profile'),
  '/saved-jobs': () => import('../../pages/SavedJobs'),
  '/my-applications': () => import('../../pages/candidate/MyApplications'),
  '/resume-analyzer': () => import('../../pages/candidate/ResumeAnalyzer'),
  '/mock-interview': () => import('../../pages/candidate/MockInterview'),
}

export default function PrefetchLink({ to, children, onMouseEnter, onFocus, ...props }) {
  const handlePrefetch = useCallback(() => {
    const routeKey = typeof to === 'string' ? to.split('?')[0] : to.pathname
    if (routeImports[routeKey]) {
      routeImports[routeKey]()
    }
  }, [to])

  const handleMouseEnter = (e) => {
    handlePrefetch()
    onMouseEnter?.(e)
  }

  const handleFocus = (e) => {
    handlePrefetch()
    onFocus?.(e)
  }

  return (
    <Link to={to} onMouseEnter={handleMouseEnter} onFocus={handleFocus} {...props}>
      {children}
    </Link>
  )
}
