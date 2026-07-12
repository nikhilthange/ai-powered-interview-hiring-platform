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
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
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
      <div className="flex flex-col min-h-screen bg-[var(--bg-secondary)] max-w-full overflow-x-clip">
        {!isLanding && <Navbar />}
        <div className="flex flex-1 max-w-full overflow-x-clip">
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
              'flex-1 overflow-y-auto max-w-full overflow-x-clip transition-all duration-300',
              !isLanding && (collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"),
              isLanding ? '' : 'px-4 pt-4 sm:p-6 pb-24 lg:pb-8'
            )}
          >
            <div className={cn(isLanding ? 'w-full' : 'mx-auto w-full max-w-7xl')}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
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
