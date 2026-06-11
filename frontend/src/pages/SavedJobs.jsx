import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from '../hooks/useApi'
import { savedJobApi } from '../services/savedJobApi'
import JobCard from '../components/jobs/JobCard'
import { PageSpinner } from '../components/ui/Spinner'
import { Bookmark } from 'lucide-react'

export default function SavedJobs() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useApi(['saved-jobs'], () =>
    savedJobApi.getSavedJobs().then((r) => r.data)
  )

  const unsaveMutation = useMutation({
    mutationFn: savedJobApi.unsaveJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-jobs'] }),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bookmark className="h-6 w-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
      </div>

      {data?.data?.jobs?.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Bookmark className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-500">No saved jobs yet.</p>
          <p className="text-sm text-gray-400">Click the bookmark icon on jobs to save them.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.data?.jobs?.map((job) => (
            <div key={job._id} className="relative">
              <JobCard job={job} />
              <button
                onClick={() => unsaveMutation.mutate(job._id)}
                className="absolute right-4 top-4 text-sm text-red-600 hover:text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
