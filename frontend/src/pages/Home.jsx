import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import LazyViewSection from '../components/ui/LazyViewSection'
import { ArrowRight, Sparkles, Shield, Zap, Star } from 'lucide-react'

const HomeFeatures = lazy(() => import('../components/home/HomeFeatures'))
const HomeTestimonials = lazy(() => import('../components/home/HomeTestimonials'))
const HomeStats = lazy(() => import('../components/home/HomeStats'))
const HomeCTA = lazy(() => import('../components/home/HomeCTA'))

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] animate-fadeIn">
      {/* Hero Section - Above the Fold (Immediate Render) */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl animate-pulse-slow" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 px-4 py-1.5 text-sm text-indigo-700 dark:text-indigo-300 mb-6 shadow-sm animate-fadeInUp">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              AI-Powered Career Platform
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse-slow" />
            </div>
            <h1 className="text-[clamp(1.75rem,5vw,3.75rem)] font-bold text-[var(--text-primary)] tracking-tight leading-tight">
              Land Your Dream Job with{' '}
              <span className="text-gradient-primary">AI</span>
            </h1>
            <p className="mt-6 text-sm sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
              AI-powered resume analysis, skill gap detection, mock interviews, and career roadmaps — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="xl">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="xl">
                      Get Started Free
                      <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="xl">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-10 text-xs sm:text-sm text-[var(--text-tertiary)]">
              <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" /> Free forever plan</span>
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" /> Powered by AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Below the Fold: Viewport Lazy Loaded Sections */}
      <LazyViewSection minHeight="400px">
        <Suspense fallback={<div className="h-96" />}>
          <HomeFeatures />
        </Suspense>
      </LazyViewSection>

      <LazyViewSection minHeight="300px">
        <Suspense fallback={<div className="h-80" />}>
          <HomeTestimonials />
        </Suspense>
      </LazyViewSection>

      <LazyViewSection minHeight="150px">
        <Suspense fallback={<div className="h-40" />}>
          <HomeStats />
        </Suspense>
      </LazyViewSection>

      <LazyViewSection minHeight="250px">
        <Suspense fallback={<div className="h-60" />}>
          <HomeCTA />
        </Suspense>
      </LazyViewSection>
    </div>
  )
}
