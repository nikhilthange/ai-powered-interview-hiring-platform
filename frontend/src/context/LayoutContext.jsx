import { createContext, useContext, useState, useCallback } from 'react'

const LayoutContext = createContext(null)

export function LayoutProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const toggleCollapsed = useCallback(() => setCollapsed((prev) => !prev), [])

  return (
    <LayoutContext.Provider value={{ sidebarOpen, collapsed, toggleSidebar, closeSidebar, toggleCollapsed }}>
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const ctx = useContext(LayoutContext)
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider')
  return ctx
}
