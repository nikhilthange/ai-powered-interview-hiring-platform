import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { jobApi } from '../../services/jobApi'
import { applicationApi } from '../../services/applicationApi'
import { profileApi } from '../../services/profileApi'
import Button from '../../components/ui/Button'
import { PageSpinner } from '../../components/ui/Spinner'
import { CheckCircle, Upload, ArrowLeft, FileText, AlertCircle } from 'lucide-react'

export default function ApplyJob() {
  const { id } = useParams()
  const fileRef = useRef(null)
  const [resume, setResume] = useState(null)
  const [resumeSource, setResumeSource] = useState('upload')
  const [coverLetter, setCoverLetter] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { data: jobData, isLoading: jobLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getJob(id).then((r) => r.data),
  })

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getMyProfile().then((r) => r.data),
  })

  const { data: dupCheck, isLoading: dupLoading } = useQuery({
    queryKey: ['application-duplicate', id],
    queryFn: () => applicationApi.checkDuplicate(id).then((r) => r.data),
  })

  const profile = profileData?.data?.profile
  const existingResumeUrl = profile?.resumeUrl
  const existingResumeName = existingResumeUrl ? existingResumeUrl.split('/').pop() || 'Existing Resume' : null

  const mutation = useMutation({
    mutationFn: (formData) => applicationApi.submitApplication(id, formData),
    onSuccess: () => setSubmitted(true),
  })

  const isLoading = jobLoading || profileLoading || dupLoading
  if (isLoading) return <PageSpinner />

  const job = jobData?.data?.job
  if (!job) return <p className="text-[var(--text-tertiary)]">Job not found.</p>

  const hasApplied = dupCheck?.data?.hasApplied

  if (hasApplied) {
    return (
      <div className="max-w-lg mx-auto space-y-6 text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Already Applied</h1>
        <p className="text-[var(--text-secondary)]">You have already submitted an application for <strong>{job.title}</strong>.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to={`/my-applications`}><Button>View My Applications</Button></Link>
          <Link to={`/jobs/${id}`}><Button variant="outline">Back to Job</Button></Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto space-y-6 text-center py-12 animate-fadeIn">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-300" />
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Application Submitted!</h1>
        <p className="text-[var(--text-secondary)]">
          Your application for <strong>{job.title}</strong> has been submitted successfully.
          {coverLetter && ' Your cover letter has been included.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/my-applications"><Button>Track Application</Button></Link>
          <Link to="/jobs"><Button variant="outline">Browse More Jobs</Button></Link>
        </div>
      </div>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData()
    if (resumeSource === 'upload' && resume) {
      formData.append('resume', resume)
    }
    formData.append('coverLetter', coverLetter)
    if (resumeSource === 'existing' && existingResumeUrl) {
      formData.append('existingResumeUrl', existingResumeUrl)
    }
    mutation.mutate(formData)
  }

  const canSubmit = (resumeSource === 'upload' && !!resume) || (resumeSource === 'existing' && !!existingResumeUrl)

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-section">
      <Link to={`/jobs/${id}`} className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <ArrowLeft className="h-4 w-4" />
        Back to job
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Apply for {job.title}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{job.location} &middot; {job.jobType}</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6 space-y-6">
        {/* Resume Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--text-primary)]">Resume *</label>

          {existingResumeUrl ? (
            <div className="space-y-2">
              <label className="flex items-center gap-3 rounded-lg border border-[var(--border-color)] p-4 cursor-pointer hover:bg-[var(--bg-tertiary)] has-[:checked]:border-[var(--color-primary-500)] has-[:checked]:bg-[var(--color-primary-50)] dark:has-[:checked]:bg-[var(--color-primary-900)]">
                <input
                  type="radio"
                  name="resumeSource"
                  checked={resumeSource === 'existing'}
                  onChange={() => setResumeSource('existing')}
                  className="h-4 w-4 text-[var(--color-primary-600)]"
                />
                <FileText className="h-5 w-5 text-[var(--color-primary-600)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Use existing resume</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{existingResumeName}</p>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-[var(--border-color)] p-4 cursor-pointer hover:bg-[var(--bg-tertiary)] has-[:checked]:border-[var(--color-primary-500)] has-[:checked]:bg-[var(--color-primary-50)] dark:has-[:checked]:bg-[var(--color-primary-900)]">
                <input
                  type="radio"
                  name="resumeSource"
                  checked={resumeSource === 'upload'}
                  onChange={() => setResumeSource('upload')}
                  className="h-4 w-4 text-[var(--color-primary-600)]"
                />
                <Upload className="h-5 w-5 text-[var(--text-tertiary)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Upload new resume</p>
                  <p className="text-xs text-[var(--text-tertiary)]">PDF, DOC, or DOCX (max 5 MB)</p>
                </div>
              </label>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-tertiary)]">Upload your resume below.</p>
          )}

          {resumeSource === 'upload' && (
            <>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files[0])} className="hidden" />
              {resume ? (
                <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-700 dark:text-green-300">{resume.name}</span>
                  <button type="button" onClick={() => setResume(null)} className="ml-auto text-sm text-red-600 hover:text-red-500 dark:text-red-400">Remove</button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--border-color)] p-6 text-sm text-[var(--text-secondary)] hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-600)]">
                  <Upload className="h-5 w-5" />
                  Upload Resume (PDF, DOC, DOCX)
                </button>
              )}
            </>
          )}
        </div>

        {/* Cover Letter */}
        <div className="space-y-1">
          <label htmlFor="coverLetter" className="block text-sm font-medium text-[var(--text-primary)]">
            Cover Letter <span className="text-[var(--text-tertiary)] font-normal">(optional)</span>
          </label>
          <textarea
            id="coverLetter"
            rows={5}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="block w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 resize-y"
            placeholder="Introduce yourself and explain why you're a great fit for this role..."
          />
        </div>

        {/* Error */}
        {mutation.isError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{mutation.error?.response?.data?.message || 'Failed to submit application. Please try again.'}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" loading={mutation.isPending} disabled={!canSubmit} className="flex-1">
            {mutation.isPending ? 'Submitting...' : 'Submit Application'}
          </Button>
          <Link to={`/jobs/${id}`}>
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}