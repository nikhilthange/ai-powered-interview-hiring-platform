import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { jobApi } from '../../services/jobApi'
import { useToast } from '../../components/ui/Toast'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { SkeletonPage } from '../../components/ui/Skeleton'
import { motion } from 'framer-motion'
import { ArrowLeft, Save } from 'lucide-react'

export default function EditJob() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [form, setForm] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getJob(id).then((r) => r.data?.data?.job || r.data?.data || r.data),
  })

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title || '',
        location: data.location || '',
        description: data.description || '',
        requirements: Array.isArray(data.requirements) ? data.requirements.join('\n') : data.requirements || '',
        jobType: data.jobType || 'Full-time',
        experienceLevel: data.experienceLevel || 'Junior',
        salaryMin: data.salaryRange?.min?.toString() || '',
        salaryMax: data.salaryRange?.max?.toString() || '',
        status: data.status || 'Active',
      })
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: (formData) => jobApi.updateJob(id, formData),
    onSuccess: () => {
      toast.success('Job updated successfully!')
      navigate('/recruiter/my-jobs')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update job.')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form) return
    mutation.mutate({
      title: form.title,
      description: form.description,
      location: form.location,
      jobType: form.jobType,
      experienceLevel: form.experienceLevel,
      status: form.status,
      requirements: form.requirements.split('\n').filter(Boolean),
      salaryRange: {
        min: parseInt(form.salaryMin) || 0,
        max: parseInt(form.salaryMax) || 0,
      },
    })
  }

  if (isLoading || !form) return <SkeletonPage />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link to="/recruiter/my-jobs" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to my jobs
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">Edit Job</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Update your job listing</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Job Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <Input label="Salary Min (₹)" type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
              <Input label="Salary Max (₹)" type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
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
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Description</label>
              <textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Requirements (one per line)</label>
              <textarea rows={4} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" loading={mutation.isPending} size="lg">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
              <Link to="/recruiter/my-jobs">
                <Button variant="ghost" size="lg">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
