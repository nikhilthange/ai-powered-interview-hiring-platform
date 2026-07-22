import { memo, useState, useCallback, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobApi } from '../services/jobApi'
import { savedJobApi } from '../services/savedJobApi'
import { Card, CardContent } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SkeletonCard } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { useToast } from '../components/ui/Toast'
import { Link } from 'react-router-dom'
import { cn } from '../lib/utils'
import { useDebounce } from '../hooks/useDebounce'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import {
  Search, MapPin, Briefcase,
  Check, Bookmark, DollarSign,
  GraduationCap, X, Filter, Building2
} from 'lucide-react'
import { getMediaUrl } from '../lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
}

const JobListItem = memo(function JobListItem({ job, savedIds, onSaveToggle, savePending }) {
  const queryClient = useQueryClient()
  const isSaved = savedIds?.has(job._id)

  const handleMouseEnter = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: ['job', job._id],
      queryFn: () => jobApi.getJob(job._id).then((r) => r.data),
      staleTime: 30000,
    })
  }, [queryClient, job._id])

  const handleSaveClick = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    onSaveToggle?.(job._id)
  }, [job._id, onSaveToggle])

  return (
    <motion.div variants={itemVariants}>
      <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] p-5 group cursor-pointer h-full flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-hidden font-bold text-lg">
            {job.companyId?.logo && job.companyId.logo !== 'default-company-logo.png' ? (
              <img src={getMediaUrl(job.companyId.logo)} alt={job.companyId?.name || 'Company'} className="w-full h-full object-contain p-1" />
            ) : (
              <Building2 className="h-6 w-6 text-[var(--text-tertiary)]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link to={`/jobs/${job._id}`} onMouseEnter={handleMouseEnter}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">{job.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-medium text-[var(--text-secondary)]">
                      {job.companyId?.name || job.recruiterId?.email}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {job.location && (
                  <Badge variant="default" size="xs">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {job.location}
                  </Badge>
                )}
                {job.salaryRange?.min > 0 && (
                  <Badge variant="primary" size="xs">
                    <DollarSign className="h-3 w-3" aria-hidden="true" />
                    ₹{job.salaryRange.min.toLocaleString('en-IN')}
                  </Badge>
                )}
                {job.jobType && <Badge variant="info" size="xs">{job.jobType}</Badge>}
                {job.experienceLevel && (
                  <Badge variant="warning" size="xs">
                    <GraduationCap className="h-3 w-3" aria-hidden="true" />
                    {job.experienceLevel}
                  </Badge>
                )}
              </div>
            </Link>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
              <Link to={`/jobs/${job._id}/apply`} className="w-full sm:w-auto">
                <Button size="sm" className="w-full">
                  <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                  Apply Now
                </Button>
              </Link>
              <Button
                variant={isSaved ? 'primary' : 'outline'}
                size="sm"
                onClick={handleSaveClick}
                disabled={savePending}
                className="w-full sm:w-auto"
              >
                <Bookmark className={cn('h-3.5 w-3.5', isSaved && 'fill-current')} aria-hidden="true" />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

const FiltersPanel = memo(function FiltersPanel({ search, setSearch, filters, setFilters, jobTypes, expLevels, showFilters, setShowFilters }) {
  return (
    <div className={cn(
      'w-full lg:w-80 shrink-0',
      showFilters ? 'block' : 'hidden lg:block'
    )}>
      <div className="lg:sticky lg:top-[88px] self-start h-fit space-y-4">
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-sm border border-[var(--border-color)] transition-all duration-300">
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text-primary)] text-sm">Filters</h3>
              <button
                onClick={() => { setFilters({}); setSearch(''); setShowFilters(false) }}
                className="text-xs text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors"
              >
                Clear all
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Search</label>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] transition-colors group-focus-within:text-[var(--color-primary-500)]" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Title, company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search jobs"
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] pl-9 pr-8 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] transition-all shadow-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Job Type</label>
              <div className="space-y-1.5">
                {jobTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilters((f) => ({ ...f, type: f.type === type ? undefined : type }))}
                    className={cn(
                      'w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all',
                      filters.type === type
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 font-medium'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                    )}
                  >
                    <div className={cn(
                      'h-4 w-4 rounded border-2 flex items-center justify-center transition-all',
                      filters.type === type ? 'border-indigo-500 bg-indigo-500' : 'border-[var(--border-color)]'
                    )}>
                      {filters.type === type && <Check className="h-3 w-3 text-white" aria-hidden="true" />}
                    </div>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Experience Level</label>
              <div className="space-y-1.5">
                {expLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setFilters((f) => ({ ...f, level: f.level === level ? undefined : level }))}
                    className={cn(
                      'w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all',
                      filters.level === level
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 font-medium'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                    )}
                  >
                    <div className={cn(
                      'h-4 w-4 rounded border-2 flex items-center justify-center transition-all',
                      filters.level === level ? 'border-indigo-500 bg-indigo-500' : 'border-[var(--border-color)]'
                    )}>
                      {filters.level === level && <Check className="h-3 w-3 text-white" aria-hidden="true" />}
                    </div>
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Filter by location..."
                  value={filters.location || ''}
                  onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value || undefined }))}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] pl-10 pr-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] transition-all"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

export default function Jobs() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(search, 300)
  const [jobs, setJobs] = useState([])
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const savedQuery = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: () => savedJobApi.getSavedJobs().then((r) => r.data),
    staleTime: 30000,
  })
  const savedJobIds = useMemo(() => {
    const savedJobs = savedQuery.data?.data?.jobs || savedQuery.data?.data || []
    return new Set(savedJobs.map((j) => j._id))
  }, [savedQuery.data])

  const saveToggleMutation = useMutation({
    mutationFn: (jobId) => savedJobApi.saveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
      toast.success('Job saved')
    },
    onError: (err) => {
      toast.error('Failed to save', err?.response?.data?.message || 'Please try again.')
    },
  })

  const unsaveMutation = useMutation({
    mutationFn: (jobId) => savedJobApi.unsaveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
      toast.success('Job removed from saved')
    },
    onError: (err) => {
      toast.error('Failed to unsave', err?.response?.data?.message || 'Please try again.')
    },
  })

  const handleSaveToggle = useCallback((jobId) => {
    if (savedJobIds.has(jobId)) {
      unsaveMutation.mutate(jobId)
    } else {
      saveToggleMutation.mutate(jobId)
    }
  }, [savedJobIds, saveToggleMutation, unsaveMutation])

  const savePending = saveToggleMutation.isPending || unsaveMutation.isPending

  const queryKey = useMemo(() => ['jobs', debouncedSearch, filters], [debouncedSearch, filters])

  const apiFilters = useMemo(() => {
    const mapped = {}
    if (filters.type) mapped.jobType = filters.type
    if (filters.level) mapped.experienceLevel = filters.level
    if (filters.location) mapped.location = filters.location
    return mapped
  }, [filters])

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: () => jobApi.getJobsPaginated({ search: debouncedSearch, page, limit: 10, ...apiFilters }).then((r) => r.data),
    placeholderData: (prev) => prev,
  })

  useEffect(() => {
    const newJobs = data?.data?.jobs || []
    if (page === 1) {
      setJobs(newJobs)
    } else if (newJobs.length > 0) {
      setJobs(prev => {
        const existingIds = new Set(prev.map((j) => j._id))
        const unique = newJobs.filter((j) => !existingIds.has(j._id))
        return [...prev, ...unique]
      })
    }
  }, [data, page])

  const totalPages = data?.totalPages || data?.pagination?.totalPages || 1
  const hasMore = page < totalPages

  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage((p) => p + 1)
    }
  }, [isFetching, hasMore])

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: isFetching,
  })

  const jobTypes = useMemo(() =>
    [...new Set(jobs.map((j) => j.jobType).filter(Boolean))],
    [jobs]
  )

  const expLevels = useMemo(() =>
    [...new Set(jobs.map((j) => j.experienceLevel).filter(Boolean))],
    [jobs]
  )

  const hasActiveFilters = useMemo(() => Object.keys(filters).length > 0, [filters])

  const handleSetFilters = useCallback((fn) => {
    setFilters(fn)
    setPage(1)
    setJobs([])
  }, [])

  const handleToggleFilters = useCallback(() => setShowFilters((prev) => !prev), [])

  if (isLoading && page === 1) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="skeleton-shimmer h-7 sm:h-8 w-36 sm:w-48 rounded-xl" />
          <div className="skeleton-shimmer h-9 sm:h-10 w-28 sm:w-32 rounded-xl" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="hidden lg:block">
            <SkeletonCard />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Failed to load jobs"
        description={error?.response?.data?.message || 'Something went wrong while loading jobs.'}
        action={{ label: 'Try Again', props: { onClick: () => refetch() } }}
      />
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 min-h-screen"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] truncate">Find Jobs</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFilters}
            className="lg:hidden"
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-2 w-2 rounded-full bg-indigo-500" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <FiltersPanel
          search={search}
          setSearch={setSearch}
          filters={filters}
          setFilters={handleSetFilters}
          jobTypes={jobTypes}
          expLevels={expLevels}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-col gap-3 mb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-3 border-b border-[var(--border-color)] -mx-2 px-2 rounded-t-xl transition-all">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {jobs.length} Jobs <span className="text-sm font-normal text-[var(--text-tertiary)] ml-2">Found</span>
              </h2>
              <div className="text-sm text-[var(--text-secondary)] font-medium cursor-pointer flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors">
                Sort by: <span className="text-[var(--text-primary)] font-semibold">Recommended</span>
                <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            
            {(search || Object.keys(filters).length > 0) && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {search && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-medium border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                    "{search}"
                    <button onClick={() => setSearch('')} className="hover:text-indigo-900 dark:hover:text-indigo-200 transition-colors"><X className="h-3 w-3"/></button>
                  </span>
                )}
                {filters.type && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-medium border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                    {filters.type}
                    <button onClick={() => handleSetFilters(f => ({...f, type: undefined}))} className="hover:text-indigo-900 dark:hover:text-indigo-200 transition-colors"><X className="h-3 w-3"/></button>
                  </span>
                )}
                {filters.level && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-medium border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                    {filters.level}
                    <button onClick={() => handleSetFilters(f => ({...f, level: undefined}))} className="hover:text-indigo-900 dark:hover:text-indigo-200 transition-colors"><X className="h-3 w-3"/></button>
                  </span>
                )}
                {filters.location && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-medium border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                    {filters.location}
                    <button onClick={() => handleSetFilters(f => ({...f, location: undefined}))} className="hover:text-indigo-900 dark:hover:text-indigo-200 transition-colors"><X className="h-3 w-3"/></button>
                  </span>
                )}
                <button onClick={() => { setSearch(''); handleSetFilters({}) }} className="text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:underline ml-1 transition-colors">
                  Clear all filters
                </button>
              </div>
            )}
          </div>
          {jobs.length === 0 ? (
            <div className="py-12 flex flex-col items-center text-center bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-sm">
              <div className="h-20 w-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No jobs found</h3>
              <p className="text-[var(--text-secondary)] text-sm max-w-sm mb-6">
                We couldn't find any jobs matching your criteria. Try adjusting your filters or search terms.
              </p>
              <Button onClick={() => { setSearch(''); handleSetFilters({}) }} variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              {jobs.map((job) => (
                <JobListItem key={job._id} job={job} savedIds={savedJobIds} onSaveToggle={handleSaveToggle} savePending={savePending} />
              ))}
              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center py-4">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--border-color)] border-t-indigo-500" />
                    Loading more jobs...
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
