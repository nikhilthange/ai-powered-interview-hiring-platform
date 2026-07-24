import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme')
      if (stored === 'dark' || stored === 'light') return stored
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('theme-switching')
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
    root.style.colorScheme = theme

    const timer = setTimeout(() => {
      root.classList.remove('theme-switching')
    }, 450)

    return () => clearTimeout(timer)
  }, [theme])

  const toggleTheme = useCallback((event) => {
    const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (isReduced || typeof document === 'undefined' || !document.startViewTransition) {
      setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
      return
    }

    const x = event?.clientX ?? window.innerWidth / 2
    const y = event?.clientY ?? window.innerHeight / 2

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = document.startViewTransition(() => {
      setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
    })

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ]
      document.documentElement.animate(
        {
          clipPath: clipPath
        },
        {
          duration: 500,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      )
    })
  }, [])

  const setTheme = useCallback((t) => setThemeState(t), [])

  const value = useMemo(() => ({
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === 'dark',
  }), [theme, toggleTheme, setTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
