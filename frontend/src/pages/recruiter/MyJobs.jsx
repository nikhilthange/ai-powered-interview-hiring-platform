import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { jobApi } from '../../services/jobApi'
import JobCard from '../../components/jobs/JobCard'
import { SkeletonCard } from '../../components/ui/Skeleton'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { Plus, Users, AlertCircle } from 'lucide-react'

export default function MyJobs() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading, isError, error } = useApi(['my-jobs'], () =>
    jobApi.getMyJobs().then((r) => r.data)
  )

  const deleteMutation = useMutation({
    mutationFn: jobApi.deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] })
      toast.success('Job Deleted', 'Job listing has been removed.')
    },
    onError: (err) => {
      toast.error('Delete Failed', err?.response?.data?.message || 'Could not delete job.')
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <Link to="/recruiter/jobs/create">
            <Button><Plus className="h-4 w-4" /> Post a Job</Button>
          </Link>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <Link to="/recruiter/jobs/create">
            <Button><Plus className="h-4 w-4" /> Post a Job</Button>
          </Link>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-red-700">{error?.response?.data?.message || 'Failed to load your job listings.'}</p>
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ['my-jobs'] })} className="mt-4 text-sm font-medium text-red-600 hover:text-red-500">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
        <Link to="/recruiter/jobs/create">
          <Button><Plus className="h-4 w-4" /> Post a Job</Button>
        </Link>
      </div>

      {data?.data?.jobs?.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">You haven't posted any jobs yet.</p>
          <Link to="/recruiter/jobs/create">
            <Button className="mt-4">Post Your First Job</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.data?.jobs?.map((job) => (
            <div key={job._id} className="relative">
              <JobCard
                job={job}
                showActions
                onDelete={(id) => {
                  if (confirm('Delete this job listing?')) {
                    deleteMutation.mutate(id)
                  }
                }}
              />
              <Link
                to={`/recruiter/jobs/${job._id}/applications`}
                className="absolute right-4 bottom-4 flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                <Users className="h-4 w-4" />
                View Applications
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
