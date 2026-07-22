import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import FloatingAIChatWidget from '../ai-chat/FloatingAIChatWidget'
import { LayoutProvider, useLayout } from '../../context/LayoutContext'
import { cn } from '../../lib/utils'

function RouteAnnouncer() {
  const location = useLocation()
  const path = location.pathname === '/' ? 'home' : location.pathname.replace('/', '').replace(/-/g, ' ').replace(/\//g, ' ')
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      Navigated to {path}
    </div>
  )
}

const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/verify-email-prompt']

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

function LayoutContent() {
  const { sidebarOpen, collapsed, closeSidebar, toggleCollapsed } = useLayout()
  const location = useLocation()
  const isAuthPage = authPaths.includes(location.pathname)

  if (isAuthPage) {
    return (
      <>
        <RouteAnnouncer />
        <main id="main-content" role="region" aria-label="Authentication" className="min-h-screen bg-[var(--bg-secondary)]">
          <Outlet />
        </main>
      </>
    )
  }

  const isLanding = location.pathname === '/'

  return (
    <>
      <RouteAnnouncer />
      <div className="flex flex-col min-h-screen bg-[var(--bg-secondary)] max-w-full">
        {!isLanding && <Navbar />}
        <div className="flex flex-1 max-w-full">
          {!isLanding && (
            <Sidebar
              open={sidebarOpen}
              onClose={closeSidebar}
              collapsed={collapsed}
              onToggle={toggleCollapsed}
            />
          )}
          <main
            id="main-content"
            role="region"
            aria-label="Main content"
            className={cn(
              'flex-1 min-w-0 max-w-full transition-all duration-300',
              !isLanding && (collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"),
              isLanding ? '' : 'px-4 pt-4 sm:p-6 pb-24 lg:pb-8'
            )}
          >
            <div className={cn(isLanding ? 'w-full' : 'mx-auto w-full max-w-7xl')}>
              <Outlet />
            </div>
          </main>
        </div>
        {!isLanding && (
          <>
            <FloatingAIChatWidget />
            <BottomNav />
          </>
        )}
      </div>
    </>
  )
}

export default function Layout() {
  return (
    <LayoutProvider>
      <LayoutContent />
    </LayoutProvider>
  )
}
