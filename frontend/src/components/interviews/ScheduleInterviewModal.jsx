import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { interviewApi } from '../../services/interviewApi'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useToast } from '../ui/Toast'
import { Calendar, Video } from 'lucide-react'

export default function ScheduleInterviewModal({ open, onClose, application }) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [scheduledAt, setScheduledAt] = useState('')
  const [meetLink, setMeetLink] = useState('')

  const mutation = useMutation({
    mutationFn: (data) => interviewApi.scheduleInterview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] })
      queryClient.invalidateQueries({ queryKey: ['my-interviews'] })
      toast.success('Interview Scheduled', 'The candidate has been notified.')
      onClose()
    },
    onError: (err) => {
      toast.error('Failed to Schedule', err?.response?.data?.message || 'Something went wrong.')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!scheduledAt) return
    mutation.mutate({
      applicationId: application._id,
      scheduledAt: new Date(scheduledAt).toISOString(),
      meetLink: meetLink.trim(),
    })
  }

  const minDate = new Date().toISOString().slice(0, 16)

  return (
    <Modal open={open} onClose={onClose} title="Schedule Interview" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="text-sm text-gray-600 mb-1">
            Candidate: <span className="font-medium text-gray-900">{application.candidateId?.email?.split('@')[0] || 'Unknown'}</span>
          </p>
          <p className="text-sm text-gray-600">
            Job: <span className="font-medium text-gray-900">{application.jobId?.title || 'Unknown'}</span>
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700">
            Date & Time
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="scheduledAt"
              type="datetime-local"
              min={minDate}
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="meetLink" className="block text-sm font-medium text-gray-700">
            Meeting Link (optional)
          </label>
          <div className="relative">
            <Video className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="meetLink"
              type="url"
              placeholder="https://meet.google.com/... or https://zoom.us/..."
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!scheduledAt || mutation.isPending}>
            {mutation.isPending ? 'Scheduling...' : 'Schedule Interview'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
