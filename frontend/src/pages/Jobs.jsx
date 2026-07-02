import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { jobApi } from '../services/jobApi'
import { Card, CardContent } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

import { SkeletonCard } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { Link } from 'react-router-dom'
import { cn } from '../lib/utils'
import {
  Search, MapPin, Briefcase,
  SlidersHorizontal, Check, Bookmark, DollarSign,
  Share2, GraduationCap,
} from 'lucide-react'

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})
  const [selectedJob, setSelectedJob] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const res = await jobApi.getAllJobs()
        setJobs(res.data?.data?.jobs || [])
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load jobs')
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const filteredJobs = jobs.filter((job) => {
    const q = search.toLowerCase()
    if (q && !job.title?.toLowerCase().includes(q) && !job.company?.toLowerCase().includes(q) && !job.location?.toLowerCase().includes(q)) return false
    if (filters.type && job.jobType !== filters.type) return false
    if (filters.level && job.experienceLevel !== filters.level) return false
    if (filters.location && !job.location?.toLowerCase().includes(filters.location.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="skeleton-shimmer h-8 w-48 rounded-xl" />
          <div className="skeleton-shimmer h-10 w-32 rounded-xl" />
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

  if (error) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Failed to load jobs"
        description={error}
        action={{ label: 'Try Again', props: { onClick: () => window.location.reload() } }}
      />
    )
  }

  const jobTypes = [...new Set(jobs.map((j) => j.jobType).filter(Boolean))]
  const expLevels = [...new Set(jobs.map((j) => j.experienceLevel).filter(Boolean))]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Find Jobs</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-tertiary)]" />
        <input
          type="text"
          placeholder="Search by title, company, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] pl-12 pr-4 py-3.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] transition-all shadow-sm"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className={cn(
          'w-full lg:w-64 shrink-0 space-y-4',
          showFilters ? 'block' : 'hidden lg:block'
        )}>
          <Card>
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[var(--text-primary)] text-sm">Filters</h3>
                <button
                  onClick={() => { setFilters({}); setShowFilters(false) }}
                  className="text-xs text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]"
                >
                  Clear all
                </button>
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
                      {filters.type === type && <Check className="h-3.5 w-3.5" />}
                      {(filters.type !== type) && <div className="h-3.5 w-3.5" />}
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
                      {filters.level === level && <Check className="h-3.5 w-3.5" />}
                      {(filters.level !== level) && <div className="h-3.5 w-3.5" />}
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
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

        <div className="flex-1 min-w-0 space-y-3">
          {filteredJobs.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No jobs found"
              description="Try adjusting your search or filters"
            />
          ) : (
            filteredJobs.map((job) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
              >
                <Link to={`/jobs/${job._id}`}>
                  <div className={cn(
                    'rounded-2xl border bg-[var(--bg-primary)] p-5 transition-all',
                    selectedJob?._id === job._id
                      ? 'border-indigo-300 dark:border-indigo-600 shadow-md'
                      : 'border-[var(--border-color)] shadow-sm hover:shadow-md hover:border-[var(--color-primary-300)] dark:hover:border-indigo-500/30'
                  )}>
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 dark:from-indigo-950 dark:to-indigo-900 dark:text-indigo-400 font-bold text-lg">
                        {job.company?.charAt(0) || job.title?.charAt(0) || 'J'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-[var(--text-primary)]">{job.title}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm text-[var(--text-secondary)]">{job.company || 'Company'}</span>
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            </div>
                          </div>
                          {job.aiMatchScore && (
                            <div className="flex flex-col items-center shrink-0">
                              <div className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold',
                                job.aiMatchScore >= 80 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' :
                                job.aiMatchScore >= 60 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' :
                                'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
                              )}>
                                {job.aiMatchScore}%
                              </div>
                              <span className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Match</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {job.location && (
                            <Badge variant="default" size="xs">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </Badge>
                          )}
                          {job.salary && (
                            <Badge variant="primary" size="xs">
                              <DollarSign className="h-3 w-3" />
                              {job.salary}
                            </Badge>
                          )}
                          {job.jobType && (
                            <Badge variant="info" size="xs">{job.jobType}</Badge>
                          )}
                          {job.experienceLevel && (
                            <Badge variant="warning" size="xs">
                              <GraduationCap className="h-3 w-3" />
                              {job.experienceLevel}
                            </Badge>
                          )}
                        </div>
                        {job.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {job.skills.slice(0, 4).map((skill) => (
                              <Badge key={skill} variant="default" size="xs">{skill}</Badge>
                            ))}
                            {job.skills.length > 4 && (
                              <Badge variant="default" size="xs">+{job.skills.length - 4}</Badge>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-4">
                          <Button size="sm">
                            <Briefcase className="h-3.5 w-3.5" />
                            Apply Now
                          </Button>
                          <Button variant="outline" size="sm">
                            <Bookmark className="h-3.5 w-3.5" />
                            Save
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}
