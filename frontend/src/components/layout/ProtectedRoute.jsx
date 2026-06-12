import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { SkeletonPage } from '../ui/Skeleton'
import { useState, useEffect } from 'react'

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setTimedOut(true)
    }, 10000)
    return () => clearTimeout(timer)
  }, [loading])

  if (loading && !timedOut) {
    return <SkeletonPage />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const rolePaths = {
      candidate: '/dashboard',
      recruiter: '/recruiter/dashboard',
      admin: '/admin/dashboard',
    }
    return <Navigate to={rolePaths[user?.role] || '/'} replace />
  }

  return <Outlet />
}
