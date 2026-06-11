import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/verify-email-prompt']

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const isAuthPage = authPaths.includes(location.pathname)

  if (isAuthPage) {
    return (
      <main className="min-h-screen bg-[var(--bg-secondary)]">
        <Outlet />
      </main>
    )
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-secondary)]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 lg:p-6 page-section">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
