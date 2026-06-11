import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobApi } from '../../services/jobApi'
import JobForm from '../../components/jobs/JobForm'
import { PageSpinner } from '../../components/ui/Spinner'
import { useToast } from '../../components/ui/Toast'

export default function EditJob() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getJob(id).then((r) => r.data),
  })

  const mutation = useMutation({
    mutationFn: (formData) => jobApi.updateJob(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['job', id] })
      toast.success('Job Updated', 'Your job posting has been updated.')
      navigate('/recruiter/my-jobs')
    },
    onError: (err) => {
      toast.error('Failed to Update Job', err?.response?.data?.message || 'Something went wrong. Please try again.')
    },
  })

  if (isLoading) return <PageSpinner />
  if (isError) {
    return (
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">{error?.response?.data?.message || 'Failed to load job details.'}</p>
          <button onClick={() => navigate('/recruiter/my-jobs')} className="mt-4 text-sm font-medium text-red-600 hover:text-red-500">
            Back to My Jobs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <JobForm
          initialData={data?.data?.job}
          onSubmit={(formData) => mutation.mutate(formData)}
          loading={mutation.isPending}
        />
      </div>
    </div>
  )
}
