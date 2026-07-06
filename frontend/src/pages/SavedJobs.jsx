import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { savedJobApi } from '../services/savedJobApi'
import { Card, CardContent } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SkeletonList } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { useToast } from '../components/ui/Toast'
import {
  Bookmark, MapPin, DollarSign, Briefcase,
  GraduationCap, AlertCircle, X, Loader2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

export default function SavedJobs() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: () => savedJobApi.getSavedJobs().then((r) => r.data),
  })

  const unsaveMutation = useMutation({
    mutationFn: (jobId) => savedJobApi.unsaveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job removed from saved')
    },
    onError: (err) => {
      toast.error('Failed to remove', err?.response?.data?.message || 'Please try again.')
    },
  })

  const jobs = data?.data?.jobs || data?.data || []

  if (isLoading) return (
    <div className="space-y-6">
      <div className="skeleton-shimmer h-8 w-48 rounded-xl" />
      <SkeletonList count={3} />
    </div>
  )

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load saved jobs"
        action={{ label: 'Retry', props: { onClick: () => refetch() } }}
      />
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50">
              <Bookmark className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">Saved Jobs</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                {jobs.length} saved job{jobs.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
        <Link to="/jobs">
          <Button variant="outline" disabled={unsaveMutation.isPending}>
            <Briefcase className="h-4 w-4" />
            Browse Jobs
          </Button>
        </Link>
      </motion.div>

      {jobs.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={Bookmark}
            title="No saved jobs"
            description="Save jobs you're interested in to review them later."
            action={{ label: 'Browse Jobs', props: { as: Link, to: '/jobs' } }}
          />
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => (
            <motion.div key={job._id} variants={itemVariants}>
              <Card className="h-full relative">
                <CardContent className="p-5">
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => { e.preventDefault(); unsaveMutation.mutate(job._id) }}
                      disabled={unsaveMutation.isPending}
                      className="rounded-xl p-2 text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      aria-label="Remove saved job"
                    >
                      {unsaveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    </button>
                  </div>
                  <Link to={`/jobs/${job._id}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                        {job.title?.charAt(0) || 'J'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-[var(--text-primary)] truncate">{job.title}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                          <span className="text-sm text-[var(--text-secondary)] truncate">{job.location || 'Location N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {job.location && (
                        <Badge variant="default" size="xs">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </Badge>
                      )}
                      {job.salaryRange?.min > 0 && (
                        <Badge variant="primary" size="xs">
                          <DollarSign className="h-3 w-3" />
                          ₹{job.salaryRange.min.toLocaleString('en-IN')}
                        </Badge>
                      )}
                      {job.jobType && <Badge variant="info" size="xs">{job.jobType}</Badge>}
                      {job.experienceLevel && (
                        <Badge variant="warning" size="xs">
                          <GraduationCap className="h-3 w-3" />
                          {job.experienceLevel}
                        </Badge>
                      )}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
