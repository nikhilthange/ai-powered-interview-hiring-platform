import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { jobApi } from '../services/jobApi'
import JobCard from '../components/jobs/JobCard'
import Badge from '../components/ui/Badge'
import { SkeletonList } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Briefcase, X, MapPin, Clock, Filter } from 'lucide-react'
import { cn } from '../lib/utils'

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote']
const LEVELS = ['Junior', 'Mid', 'Senior']
const REMOTE_OPTIONS = ['Remote', 'Hybrid', 'On-site']

export default function Jobs() {
  const [search, setSearch] = useState('')
  const [jobType, setJobType] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [location, setLocation] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['jobs', search, jobType, experienceLevel, location, page],
    queryFn: () =>
      jobApi.getJobs({ search, jobType, experienceLevel, location, page, limit: 10 }).then((r) => r.data),
    placeholderData: keepPreviousData,
  })

  const jobs = data?.data?.jobs || []
  const totalPages = data?.totalPages || 1
  const total = data?.results || 0

  const hasFilters = search || jobType || experienceLevel || location

  const clearAll = () => { setSearch(''); setJobType(''); setExperienceLevel(''); setLocation(''); setPage(1) }

  return (
    <div className="space-y-6 page-section">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Find Jobs</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {total > 0 ? `${total} opportunities found` : 'Discover your next opportunity'}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all lg:hidden',
            showFilters
              ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-950)] dark:text-[var(--color-primary-300)]'
              : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
          )}
          aria-label="Toggle filters"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasFilters && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-[10px] font-bold text-white">{Object.values({search, jobType, experienceLevel, location}).filter(Boolean).length}</span>}
        </button>
      </div>

      <div className={cn('space-y-4', !showFilters && 'hidden lg:block')}>
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search by title, skill, or keyword..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] py-2.5 pl-10 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] transition-all"
              aria-label="Search jobs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 lg:flex lg:gap-3">
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <select
                value={jobType}
                onChange={(e) => { setJobType(e.target.value); setPage(1) }}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] pl-10 pr-8 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 appearance-none cursor-pointer"
                aria-label="Filter by job type"
              >
                <option value="">All Types</option>
                {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <select
                value={experienceLevel}
                onChange={(e) => { setExperienceLevel(e.target.value); setPage(1) }}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] pl-10 pr-8 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 appearance-none cursor-pointer"
                aria-label="Filter by experience level"
              >
                <option value="">All Levels</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="relative lg:hidden">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setPage(1) }}
                placeholder="Location"
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 transition-all"
                aria-label="Filter by location"
              />
            </div>
          </div>
        </div>

        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--text-tertiary)]">Active filters:</span>
            {search && (
              <Badge variant="primary" size="sm">
                Search: "{search}"
                <button onClick={() => setSearch('')} className="ml-1 hover:opacity-70" aria-label="Remove search filter">×</button>
              </Badge>
            )}
            {jobType && (
              <Badge variant="info" size="sm">
                {jobType}
                <button onClick={() => setJobType('')} className="ml-1 hover:opacity-70" aria-label="Remove type filter">×</button>
              </Badge>
            )}
            {experienceLevel && (
              <Badge variant="warning" size="sm">
                {experienceLevel}
                <button onClick={() => setExperienceLevel('')} className="ml-1 hover:opacity-70" aria-label="Remove level filter">×</button>
              </Badge>
            )}
            {location && (
              <Badge variant="default" size="sm">
                {location}
                <button onClick={() => setLocation('')} className="ml-1 hover:opacity-70" aria-label="Remove location filter">×</button>
              </Badge>
            )}
            <button
              onClick={clearAll}
              className="text-xs font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <SkeletonList count={5} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description={hasFilters ? 'Try adjusting your search or filter criteria.' : 'No jobs are currently available.'}
          action={hasFilters ? { label: 'Clear Filters', props: { onClick: clearAll } } : undefined}
        />
      ) : (
        <>
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job._id} className="animate-fadeIn">
                <JobCard job={job} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <div className="flex items-center gap-1 flex-wrap justify-center">
                {(() => {
                  const maxVisible = 5
                  const pages = []
                  let start = Math.max(1, page - Math.floor(maxVisible / 2))
                  let end = Math.min(totalPages, start + maxVisible - 1)
                  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)
                  if (start > 1) pages.push(1)
                  if (start > 2) pages.push('...')
                  for (let i = start; i <= end; i++) pages.push(i)
                  if (end < totalPages - 1) pages.push('...')
                  if (end < totalPages) pages.push(totalPages)
                  return pages.map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-[var(--text-tertiary)]">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                          page === p
                            ? 'bg-[var(--color-primary-500)] text-white shadow-sm'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                        )}
                        aria-label={`Page ${p}`}
                        aria-current={page === p ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    )
                  )
                })()}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {isFetching && !isLoading && (
            <div className="fixed bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 z-40">
              <div className="rounded-full border bg-[var(--bg-primary)]/90 backdrop-blur-md px-5 py-2.5 shadow-lg border-[var(--border-color)]">
                <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-primary-500)]" />
                  Updating results...
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
