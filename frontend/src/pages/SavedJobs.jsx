import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../hooks/useApi'
import { savedJobApi } from '../services/savedJobApi'
import JobCard from '../components/jobs/JobCard'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import { SkeletonList } from '../components/ui/Skeleton'
import { Bookmark, Briefcase, X } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SavedJobs() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useApi(['saved-jobs'], () =>
    savedJobApi.getSavedJobs().then((r) => r.data)
  )

  const unsaveMutation = useMutation({
    mutationFn: savedJobApi.unsaveJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-jobs'] }),
  })

  const jobs = data?.data?.jobs || []

  if (isLoading) return (
    <div className="space-y-6 page-section">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Saved Jobs</h1>
          <p className="text-sm text-[var(--text-secondary)]">Jobs you've bookmarked</p>
        </div>
      </div>
      <SkeletonList count={3} />
    </div>
  )

  return (
    <div className="space-y-6 page-section">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Saved Jobs</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {jobs.length > 0 ? `${jobs.length} saved job${jobs.length !== 1 ? 's' : ''}` : 'Jobs you\'ve bookmarked'}
          </p>
        </div>
        <Link to="/jobs">
          <Button variant="outline" size="sm">
            <Briefcase className="h-4 w-4" /> Browse Jobs
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Click the bookmark icon on jobs to save them and revisit later."
          action={{ label: 'Find Jobs', props: { onClick: () => window.location.href = '/jobs' } }}
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job._id} className="relative group animate-fadeIn">
              <JobCard job={job} />
              <button
                onClick={() => unsaveMutation.mutate(job._id)}
                disabled={unsaveMutation.isPending}
                className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-white/90 dark:bg-[var(--bg-primary)]/90 backdrop-blur-sm border border-[var(--border-color)] px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50"
                aria-label={`Remove ${job.title} from saved jobs`}
              >
                <X className="h-3 w-3" />
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
