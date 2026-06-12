import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { jobApi } from '../services/jobApi'
import JobCard from '../components/jobs/JobCard'
import Badge from '../components/ui/Badge'
import { InlineSpinner } from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react'
import { cn } from '../lib/utils'

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote']
const LEVELS = ['Junior', 'Mid', 'Senior']

export default function Jobs() {
  const [search, setSearch] = useState('')
  const [jobType, setJobType] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['jobs', search, jobType, experienceLevel, page],
    queryFn: () =>
      jobApi.getJobs({ search, jobType, experienceLevel, page, limit: 10 }).then((r) => r.data),
    placeholderData: keepPreviousData,
  })

  const jobs = data?.data?.jobs || []
  const totalPages = data?.totalPages || 1
  const total = data?.results || 0

  const hasFilters = search || jobType || experienceLevel

  return (
    <div className="space-y-6 page-section">
      {/* Header */}
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
            'inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors sm:hidden',
            showFilters
              ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
              : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Search & Filters */}
      <div className={cn('space-y-4', !showFilters && 'hidden sm:block')}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search by title, skill, or keyword..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] transition-all"
            />
          </div>
          <div className="hidden sm:flex gap-3">
            <select
              value={jobType}
              onChange={(e) => { setJobType(e.target.value); setPage(1) }}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
            >
              <option value="">All Types</option>
              {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={experienceLevel}
              onChange={(e) => { setExperienceLevel(e.target.value); setPage(1) }}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20"
            >
              <option value="">All Levels</option>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--text-tertiary)]">Active filters:</span>
            {search && (
              <Badge variant="primary" size="sm">
                Search: "{search}"
                <button onClick={() => setSearch('')} className="ml-1 hover:opacity-70">×</button>
              </Badge>
            )}
            {jobType && (
              <Badge variant="info" size="sm">
                {jobType}
                <button onClick={() => setJobType('')} className="ml-1 hover:opacity-70">×</button>
              </Badge>
            )}
            {experienceLevel && (
              <Badge variant="warning" size="sm">
                {experienceLevel}
                <button onClick={() => setExperienceLevel('')} className="ml-1 hover:opacity-70">×</button>
              </Badge>
            )}
            <button
              onClick={() => { setSearch(''); setJobType(''); setExperienceLevel('') }}
              className="text-xs text-[var(--color-primary-600)] hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Job Listings */}
      {isLoading ? (
        <InlineSpinner />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description={hasFilters ? 'Try adjusting your search or filter criteria.' : 'No jobs are currently available.'}
          action={hasFilters ? { label: 'Clear Filters', props: { onClick: () => { setSearch(''); setJobType(''); setExperienceLevel('') } } } : undefined}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-xl border border-[var(--border-color)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50 transition-colors"
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
                            ? 'bg-[var(--color-primary-500)] text-white'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                        )}
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
                className="inline-flex items-center gap-1 rounded-xl border border-[var(--border-color)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50 transition-colors"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {isFetching && !isLoading && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2">
              <div className="rounded-full border bg-[var(--bg-primary)] px-4 py-2 shadow-lg border-[var(--border-color)]">
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
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
