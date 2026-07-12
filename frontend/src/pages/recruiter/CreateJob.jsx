import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { jobApi } from '../../services/jobApi'
import { recruiterAiApi } from '../../services/recruiterAiApi'
import { useToast } from '../../components/ui/Toast'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Save, AlertCircle, Sparkles, Copy, Check, RefreshCw, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CreateJob() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    title: '', location: '', description: '',
    requirements: '', jobType: 'Full-time', experienceLevel: 'Mid',
    salaryMin: '', salaryMax: '',
  })

  const [aiPrompt, setAiPrompt] = useState('')
  const [aiData, setAiData] = useState(null)
  const [copied, setCopied] = useState(false)

  const aiMutation = useMutation({
    mutationFn: recruiterAiApi.generateJobDescription,
    onSuccess: (res) => {
      if (res?.data) {
        setAiData(res.data)
        toast.success('Job description generated! Review and insert it into the form.')
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

  const handleGenerate = () => {
    if (!aiPrompt.trim()) {
      return toast.error('Please enter a prompt to generate the job description.')
    }
    aiMutation.mutate({ prompt: aiPrompt, title: form.title })
  }

  const handleCopy = () => {
    if (!aiData) return
    const text = formatAiDataAsMarkdown(aiData)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  const formatAiDataAsMarkdown = (data) => {
    let md = `## Summary\n${data.summary}\n\n`
    if (data.responsibilities?.length) {
      md += `## Responsibilities\n${data.responsibilities.map(r => `- ${r}`).join('\n')}\n\n`
    }
    if (data.qualifications?.length) {
      md += `## Qualifications\n${data.qualifications.map(q => `- ${q}`).join('\n')}\n\n`
    }
    if (data.benefits?.length) {
      md += `## Benefits\n${data.benefits.map(b => `- ${b}`).join('\n')}\n`
    }
    return md.trim()
  }

  const handleInsert = () => {
    if (!aiData) return
    const descriptionMd = formatAiDataAsMarkdown(aiData)
    const allRequirements = [
      ...(aiData.requiredSkills || []),
      ...(aiData.preferredSkills || [])
    ]
    setForm(prev => ({
      ...prev,
      title: aiData.title || prev.title,
      location: aiData.location || prev.location,
      jobType: aiData.jobType || prev.jobType,
      experienceLevel: aiData.experienceLevel || prev.experienceLevel,
      salaryMin: aiData.salaryRange?.min?.toString() || prev.salaryMin,
      salaryMax: aiData.salaryRange?.max?.toString() || prev.salaryMax,
      description: descriptionMd,
      requirements: allRequirements.join('\n')
    }))
    toast.success('Generated content inserted into the form!')
  }

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <Link to="/recruiter/my-jobs" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to my jobs
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">Post a Job</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Create a new job listing to find the perfect candidate</p>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <Input 
            label="Job Title" 
            placeholder="e.g. Senior Frontend Developer" 
            value={form.title} 
            onChange={(e) => setForm({ ...form, title: e.target.value })} 
            className="text-lg font-medium"
            required 
          />
        </div>

        <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm overflow-hidden bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-[var(--bg-primary)]">
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--text-primary)]">Generate Job Description with AI ✨</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1 mb-4">
                  Describe your hiring needs and let AI create a complete, professional job post.
                </p>
                <textarea
                  rows={3}
                  placeholder="e.g. Need a Senior React Developer with 5 years experience, strong AWS skills, to lead our frontend team."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={aiMutation.isPending}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y shadow-sm disabled:opacity-50"
                />
                <div className="mt-4">
                  <Button 
                    onClick={handleGenerate} 
                    loading={aiMutation.isPending} 
                    disabled={aiMutation.isPending || !aiPrompt.trim()}
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0 shadow-md text-white font-medium"
                  >
                    <Sparkles className="h-4 w-4" />
                    {aiMutation.isPending ? 'Generating Magic...' : 'Generate with AI'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {aiData && !aiMutation.isPending && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-green-100 dark:border-green-900/30 overflow-hidden shadow-sm">
                <div className="bg-green-50/50 dark:bg-green-900/10 border-b border-green-100 dark:border-green-900/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="font-medium text-green-800 dark:text-green-400 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Generated Content Ready
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleGenerate} className="border-green-200 hover:bg-green-50 text-green-700 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20">
                      <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCopy} className="border-green-200 hover:bg-green-50 text-green-700 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20">
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button size="sm" onClick={handleInsert} className="bg-green-600 hover:bg-green-700 text-white border-0">
                      <FileText className="h-3.5 w-3.5" /> Insert into Form
                    </Button>
                  </div>
                </div>
                <CardContent className="p-0">
                  <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar text-sm text-[var(--text-secondary)] space-y-4">
                    <div>
                      <h4 className="font-semibold text-[var(--text-primary)] mb-1">Title</h4>
                      <p>{aiData.title}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--text-primary)] mb-1">Summary</h4>
                      <p>{aiData.summary}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--text-primary)] mb-1">Responsibilities</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {aiData.responsibilities?.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)] mb-1">Required Skills</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {aiData.requiredSkills?.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)] mb-1">Preferred Skills</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {aiData.preferredSkills?.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4 border-t border-[var(--border-color)]">
          <h3 className="font-semibold text-lg text-[var(--text-primary)]">Manual Job Details</h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Location" placeholder="e.g. San Francisco, CA or Remote" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
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
            <div className="grid grid-cols-2 gap-3">
              <Input label="Min Salary (₹)" placeholder="e.g. 50000" type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
              <Input label="Max Salary (₹)" placeholder="e.g. 150000" type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Job Description (Markdown supported)</label>
            <textarea rows={8} placeholder="Describe the role, team, and company..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y shadow-sm font-mono" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Requirements / Skills (one per line)</label>
            <textarea rows={5} placeholder={`• 5+ years of React experience\n• Experience with TypeScript\n• Strong communication skills`} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y shadow-sm" />
          </div>

          {mutation.isError && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{mutation.error?.response?.data?.message || 'Failed to create job'}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--border-color)]">
            <Link to="/recruiter/my-jobs">
              <Button variant="ghost" size="lg">Cancel</Button>
            </Link>
            <Button type="submit" loading={mutation.isPending} size="lg" className="shadow-md">
              <Save className="h-4 w-4" />
              Post Job
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
