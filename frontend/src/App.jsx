import { lazy, Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { SocketProvider } from './context/SocketContext'
import { ToastProvider } from './components/ui/Toast'
import ErrorBoundary from './components/layout/ErrorBoundary'
import { router } from './routes'

const ReactQueryDevtools = lazy(() =>
  import('@tanstack/react-query-devtools').then((mod) => ({
    default: mod.ReactQueryDevtools,
  }))
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
})

function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--color-primary-500)] focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-none"
    >
      Skip to main content
    </a>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <SkipToContent />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <ToastProvider>
                <RouterProvider router={router} />
                {import.meta.env.DEV && (
                  <Suspense fallback={null}>
                    <ReactQueryDevtools buttonPosition="bottom-left" />
                  </Suspense>
                )}
              </ToastProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
