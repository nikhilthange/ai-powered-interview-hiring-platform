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
import { ArrowLeft, Save, Plus, X } from 'lucide-react'

export default function EditJob() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [form, setForm] = useState(null)
  const [newSkill, setNewSkill] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getJobById(id).then((r) => r.data?.data?.job || r.data?.data || r.data),
  })

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title || '',
        company: data.company || '',
        location: data.location || '',
        description: data.description || '',
        requirements: Array.isArray(data.requirements) ? data.requirements.join('\n') : data.requirements || '',
        jobType: data.jobType || 'Full-time',
        experienceLevel: data.experienceLevel || 'Mid-Level',
        salary: data.salary || '',
        skills: data.skills || [],
        responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities.join('\n') : data.responsibilities || '',
      })
    }
  }, [data])

  const mutation = useMutation({
    mutationFn: (formData) => jobApi.updateJob(id, formData),
    onSuccess: () => {
      toast.success('Job Updated', 'Your job has been updated successfully.')
      navigate('/recruiter/my-jobs')
    },
    onError: (err) => {
      toast.error('Failed to Update', err?.response?.data?.message || 'Something went wrong.')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form) return
    mutation.mutate({
      ...form,
      requirements: form.requirements.split('\n').filter(Boolean),
      responsibilities: form.responsibilities.split('\n').filter(Boolean),
    })
  }

  const addSkill = () => {
    const skill = newSkill.trim()
    if (skill && form && !form.skills.includes(skill)) {
      setForm({ ...form, skills: [...form.skills, skill] })
      setNewSkill('')
    }
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
              <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
              <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <Input label="Salary" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Job Type</label>
                <select value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                  {['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Experience Level</label>
                <select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                  {['Entry-Level', 'Mid-Level', 'Senior', 'Lead', 'Manager'].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Description</label>
              <textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Requirements (one per line)</label>
              <textarea rows={4} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Responsibilities (one per line)</label>
              <textarea rows={4} value={form.responsibilities} onChange={(e) => setForm({ ...form, responsibilities: e.target.value })} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Skills</label>
              <div className="flex items-center gap-2 mb-3">
                <input type="text" placeholder="Add a skill..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                <Button type="button" onClick={addSkill} disabled={!newSkill.trim()} size="sm"><Plus className="h-4 w-4" />Add</Button>
              </div>
              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 px-3 py-1.5 text-xs font-medium">
                      {skill}
                      <button type="button" onClick={() => setForm({ ...form, skills: form.skills.filter((s) => s !== skill) })}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
