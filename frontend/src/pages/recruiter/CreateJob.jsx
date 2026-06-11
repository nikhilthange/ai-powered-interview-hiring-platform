import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { jobApi } from '../../services/jobApi'
import JobForm from '../../components/jobs/JobForm'
import { useToast } from '../../components/ui/Toast'

export default function CreateJob() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: jobApi.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast.success('Job Created', 'Your job posting has been published successfully.')
      navigate('/recruiter/my-jobs')
    },
    onError: (err) => {
      toast.error('Failed to Create Job', err?.response?.data?.message || 'Something went wrong. Please try again.')
    },
  })

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <JobForm onSubmit={(data) => mutation.mutate(data)} loading={mutation.isPending} />
      </div>
    </div>
  )
}
