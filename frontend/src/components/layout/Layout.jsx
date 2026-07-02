import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { LayoutProvider, useLayout } from '../../context/LayoutContext'

const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/verify-email-prompt']

function LayoutContent() {
  const { sidebarOpen, collapsed, closeSidebar, toggleCollapsed } = useLayout()
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
      <Sidebar
        open={sidebarOpen}
        onClose={closeSidebar}
        collapsed={collapsed}
        onToggle={toggleCollapsed}
      />
      <div className="flex flex-1 flex-col min-w-0 transition-all duration-300">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

export default function Layout() {
  return (
    <LayoutProvider>
      <LayoutContent />
    </LayoutProvider>
  )
}
