import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { jobApi } from '../../services/jobApi'
import { recruiterAiApi } from '../../services/recruiterAiApi'
import { useToast } from '../../components/ui/Toast'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, AlertCircle, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CreateJob() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    title: '', location: '', description: '',
    requirements: '', jobType: 'Full-time', experienceLevel: 'Junior',
    salaryMin: '', salaryMax: '',
  })

  const [aiModal, setAiModal] = useState({ open: false, data: null })

  const aiMutation = useMutation({
    mutationFn: recruiterAiApi.generateJobDescription,
    onSuccess: (res) => {
      const data = res?.data
      if (data) {
        setForm({
          title: data.title || form.title,
          location: data.location || form.location,
          description: data.description || form.description,
          requirements: Array.isArray(data.requirements) ? data.requirements.join('\n') : data.requirements || form.requirements,
          jobType: data.jobType || form.jobType,
          experienceLevel: data.experienceLevel || form.experienceLevel,
          salaryMin: data.salaryRange?.min?.toString() || form.salaryMin,
          salaryMax: data.salaryRange?.max?.toString() || form.salaryMax,
        })
        setAiModal({ open: true, data })
        toast.success('Job description generated! Fill in any remaining details.')
      }
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'AI generation failed.'),
  })

  const mutation = useMutation({
    mutationFn: jobApi.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] })
      toast.success('Job created successfully!')
      navigate('/recruiter/my-jobs')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create job.')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({
      title: form.title,
      description: form.description,
      location: form.location,
      jobType: form.jobType,
      experienceLevel: form.experienceLevel,
      requirements: form.requirements.split('\n').filter(Boolean),
      salaryRange: {
        min: parseInt(form.salaryMin) || 0,
        max: parseInt(form.salaryMax) || 0,
      },
    })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link to="/recruiter/my-jobs" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to my jobs
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">Post a Job</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Create a new job listing to find the perfect candidate</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative">
                <Input label="Job Title" placeholder="e.g. Senior Frontend Developer" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">&nbsp;</label>
                <Button
                  type="button" variant="outline" size="md"
                  onClick={() => aiMutation.mutate({
                    title: form.title || 'Software Engineer',
                    location: form.location || 'Remote',
                    jobType: form.jobType,
                    experienceLevel: form.experienceLevel,
                    requirements: form.requirements.split('\n').filter(Boolean),
                  })}
                  loading={aiMutation.isPending}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                  Generate with AI
                </Button>
              </div>
              <Input label="Location" placeholder="e.g. San Francisco, CA" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <Input label="Salary Min (₹)" placeholder="e.g. 50000" type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
              <Input label="Salary Max (₹)" placeholder="e.g. 150000" type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Job Type</label>
                <select value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                  {['Full-time', 'Part-time', 'Contract', 'Remote'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Experience Level</label>
                <select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                  {['Junior', 'Mid', 'Senior'].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Description</label>
              <textarea rows={5} placeholder="Describe the role, team, and company..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Requirements (one per line)</label>
              <textarea rows={4} placeholder={`• 5+ years of React experience\n• Experience with TypeScript\n• Strong communication skills`} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y" />
            </div>

            {mutation.isError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p>{mutation.error?.response?.data?.message || 'Failed to create job'}</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" loading={mutation.isPending} size="lg">
                <Save className="h-4 w-4" />
                Post Job
              </Button>
              <Link to="/recruiter/my-jobs">
                <Button variant="ghost" size="lg">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Modal open={aiModal.open} onClose={() => setAiModal({ open: false, data: aiModal.data })} title="AI Generated Job Description" size="lg">
        <div className="space-y-4">
          <pre className="whitespace-pre-wrap text-sm text-[var(--text-primary)] font-sans leading-relaxed max-h-[50vh] overflow-y-auto">
            {aiModal.data && JSON.stringify(aiModal.data, null, 2)}
          </pre>
          <div className="flex gap-2 justify-end pt-2 border-t border-[var(--border-color)]">
            <Button variant="ghost" size="sm" onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(aiModal.data, null, 2))
              toast.success('Copied!')
            }}>Copy</Button>
            <Button size="sm" onClick={() => setAiModal({ open: false, data: aiModal.data })}>Done</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}
