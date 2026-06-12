import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { jobApi } from '../../services/jobApi'
import { applicationApi } from '../../services/applicationApi'
import { profileApi } from '../../services/profileApi'
import Button from '../../components/ui/Button'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { SkeletonPage } from '../../components/ui/Skeleton'
import { CheckCircle, Upload, ArrowLeft, FileText, AlertCircle, MapPin, Briefcase, IndianRupee, Send, Building2, Clock } from 'lucide-react'
import { formatDateRelative } from '../../lib/utils'

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
  if (isLoading) return <SkeletonPage />

  const job = jobData?.data?.job
  if (!job) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-lg font-medium text-[var(--text-primary)]">Job not found</p>
      <Link to="/jobs" className="mt-4 text-sm font-medium text-[var(--color-primary-600)]">
        Back to jobs
      </Link>
    </div>
  )

  const hasApplied = dupCheck?.data?.hasApplied

  if (hasApplied) {
    return (
      <div className="max-w-lg mx-auto page-section">
        <Card>
          <CardContent className="p-8 text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Already Applied</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                You have already submitted an application for <strong className="text-[var(--text-primary)]">{job.title}</strong>.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Link to="/my-applications"><Button>View My Applications</Button></Link>
              <Link to={`/jobs/${id}`}><Button variant="outline">Back to Job</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto page-section">
        <Card>
          <CardContent className="p-8 text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Application Submitted!</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                Your application for <strong className="text-[var(--text-primary)]">{job.title}</strong> has been submitted successfully.
              </p>
              <div className="mt-4 rounded-xl bg-[var(--bg-tertiary)] p-4 text-left space-y-2">
                <p className="text-sm text-[var(--text-secondary)]">
                  <span className="font-medium text-[var(--text-primary)]">Job:</span> {job.title}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  <span className="font-medium text-[var(--text-primary)]">Company:</span> {job.company || 'N/A'}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  <span className="font-medium text-[var(--text-primary)]">Cover letter:</span> {coverLetter ? 'Included' : 'Not provided'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Link to="/my-applications"><Button>Track Application</Button></Link>
              <Link to="/jobs"><Button variant="outline">Browse More Jobs</Button></Link>
            </div>
          </CardContent>
        </Card>
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
    <div className="max-w-3xl mx-auto page-section">
      <Link
        to={`/jobs/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to job
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Apply for this position</h1>
              <p className="text-sm text-[var(--text-secondary)]">
                Complete the form below to submit your application.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    Resume <span className="text-red-500">*</span>
                  </h2>

                  {existingResumeUrl ? (
                    <div className="grid gap-2">
                      <label className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] p-4 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors has-[:checked]:border-[var(--color-primary-500)] has-[:checked]:bg-[var(--color-primary-50)] dark:has-[:checked]:bg-[var(--color-primary-950)]">
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
                      <label className="flex items-center gap-3 rounded-xl border border-[var(--border-color)] p-4 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors has-[:checked]:border-[var(--color-primary-500)] has-[:checked]:bg-[var(--color-primary-50)] dark:has-[:checked]:bg-[var(--color-primary-950)]">
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
                    <p className="text-xs text-[var(--text-tertiary)]">Upload your resume below to apply.</p>
                  )}

                  {resumeSource === 'upload' && (
                    <div className="space-y-2">
                      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files[0])} className="hidden" />
                      {resume ? (
                        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50/50 p-4 dark:border-green-800 dark:bg-green-950/30">
                          <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-green-700 dark:text-green-300 truncate">{resume.name}</p>
                            <p className="text-xs text-green-600 dark:text-green-400">{(resume.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button type="button" onClick={() => { setResume(null); if (fileRef.current) fileRef.current.value = '' }} className="ml-auto shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border-color)] p-6 text-sm text-[var(--text-secondary)] hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] hover:bg-[var(--bg-tertiary)] transition-all"
                        >
                          <Upload className="h-5 w-5" />
                          Choose resume file
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    Cover Letter <span className="font-normal text-[var(--text-tertiary)]">(optional)</span>
                  </h2>
                  <textarea
                    id="coverLetter"
                    rows={6}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="block w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] resize-y transition-all"
                    placeholder="Introduce yourself and explain why you're a great fit for this role..."
                  />
                  <p className="text-xs text-[var(--text-tertiary)] text-right">{coverLetter.length} characters</p>
                </div>

                {mutation.isError && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>{mutation.error?.response?.data?.message || 'Failed to submit application. Please try again.'}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" loading={mutation.isPending} disabled={!canSubmit} size="lg" className="flex-1">
                    {mutation.isPending ? (
                      <>Submitting...</>
                    ) : (
                      <><Send className="h-4 w-4" /> Submit Application</>
                    )}
                  </Button>
                  <Link to={`/jobs/${id}`}>
                    <Button type="button" variant="outline" size="lg">Cancel</Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Job Summary</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-950)] dark:text-[var(--color-primary-400)] font-semibold text-sm">
                  {job.company?.charAt(0) || job.title?.charAt(0) || 'J'}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{job.title}</p>
                  {job.company && <p className="text-xs text-[var(--text-secondary)]">{job.company}</p>}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <MapPin className="h-3.5 w-3.5" /> {job.location}
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Briefcase className="h-3.5 w-3.5" /> {job.jobType} · {job.experienceLevel}
                </div>
                {job.salaryRange?.min > 0 && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <IndianRupee className="h-3.5 w-3.5" />
                    {job.salaryRange.min.toLocaleString('en-IN')}
                    {job.salaryRange.max > 0 && ` - ${job.salaryRange.max.toLocaleString('en-IN')}`}
                  </div>
                )}
                <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
                  <Clock className="h-3.5 w-3.5" /> Posted {formatDateRelative(job.createdAt)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
