import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <main id="main-content" role="region" aria-label="Authentication" className="min-h-screen bg-[var(--bg-secondary)]">
      <Outlet />
    </main>
  )
}
