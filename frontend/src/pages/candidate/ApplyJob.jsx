import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { jobApi } from '../../services/jobApi'
import api from '../../services/axios'
import { useToast } from '../../components/ui/Toast'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'

import { SkeletonPage } from '../../components/ui/Skeleton'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, AlertCircle, Upload } from 'lucide-react'

export default function ApplyJob() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ coverLetter: '', additionalInfo: '' })
  const [resume, setResume] = useState(null)

  const { data: jobData, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getJobById(id).then((r) => r.data),
  })

  const mutation = useMutation({
    mutationFn: (data) => api.post(`/applications/${id}/apply`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      toast.success('Application Submitted', 'Your application has been sent successfully!')
      navigate('/my-applications')
    },
    onError: (err) => {
      toast.error('Application Failed', err?.response?.data?.message || 'Something went wrong.')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData()
    if (form.coverLetter) formData.append('coverLetter', form.coverLetter)
    if (resume) formData.append('resume', resume)
    mutation.mutate(formData)
  }

  const job = jobData?.data?.job || jobData?.data

  if (isLoading) return <SkeletonPage />

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div>
        <Link to={`/jobs/${id}`} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to job
        </Link>
        {job && (
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold text-lg">
              {job.title?.charAt(0) || 'J'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">{job.title}</h1>
              <p className="text-sm text-[var(--text-secondary)]">{job.company} • {job.location}</p>
            </div>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Cover Letter (Optional)</label>
              <textarea
                rows={6}
                placeholder="Write a brief cover letter explaining why you're a good fit for this role..."
                value={form.coverLetter}
                onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Resume (Optional)</label>
              <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[var(--border-color)] p-6 text-center hover:border-indigo-300 hover:bg-[var(--bg-tertiary)] transition-all">
                <Upload className="h-6 w-6 text-[var(--text-tertiary)]" />
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {resume ? resume.name : 'Upload a different resume'}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">PDF, DOCX (max 5 MB)</p>
                </div>
                <input type="file" accept=".pdf,.docx,.doc" onChange={(e) => setResume(e.target.files[0])} className="hidden" />
              </label>
            </div>

            {mutation.isError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p>{mutation.error?.response?.data?.message || 'Failed to submit application'}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" loading={mutation.isPending} size="lg">
                <Send className="h-4 w-4" />
                Submit Application
              </Button>
              <Link to={`/jobs/${id}`}>
                <Button variant="ghost" size="lg">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
