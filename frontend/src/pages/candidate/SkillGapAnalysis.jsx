import { motion } from 'framer-motion'
import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { analysisApi } from '../../services/analysisApi'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import FileDropzone from '../../components/FileUpload/FileDropzone'
import SectionCard from '../../components/Analysis/SectionCard'
import StatCard from '../../components/Analysis/StatCard'
import Badge from '../../components/ui/Badge'
import { cn } from '../../lib/utils'
import { Briefcase, Sparkles, Brain, Target, CheckCircle, BookOpen, Zap, Award, Clock, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TARGET_ROLES } from '../../lib/constants'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function SkillGapAnalysis() {
  const [file, setFile] = useState(null)
  const [targetRole, setTargetRole] = useState('')

  const { mutate, data, isPending, isError, error, reset } = useMutation({
    mutationFn: (formData) =>
      analysisApi.skillGapUpload(formData).then((r) => r.data),
    onError: () => {},
  })

  const handleFileChange = useCallback((f) => setFile(f), [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file || !targetRole) return
    const formData = new FormData()
    formData.append('resume', file)
    formData.append('targetRole', targetRole)
    mutate(formData)
  }

  const result = data?.data

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6">
          <Sparkles className="h-4 w-4" /> Back to dashboard
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">Skill Gap Analysis</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Upload your resume, choose a target role, and discover what skills you need to acquire.
          </p>
        </div>
      </motion.div>

      {!result && (
        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Upload Resume</h2>
              <FileDropzone onFile={handleFileChange} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Target Role</h2>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  list="roles"
                  placeholder="Search or type a target role..."
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
                <datalist id="roles">
                  {TARGET_ROLES.map((role) => <option key={role} value={role} />)}
                </datalist>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {TARGET_ROLES.slice(0, 6).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setTargetRole(role)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium border transition-all',
                      targetRole === role
                        ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-transparent hover:bg-purple-50 dark:hover:bg-purple-950'
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-4 py-10">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                <Brain className="h-8 w-8 text-purple-500" />
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--text-primary)]">Analyzing skill gaps...</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Comparing your skills with the target role requirements</p>
              </div>
            </motion.div>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!file || !targetRole || isPending} size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">
              <Sparkles className="h-4 w-4" /> {isPending ? 'Analyzing...' : 'Analyze Skills'}
            </Button>
          </div>

          {isError && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Analysis Failed</p>
                <p className="mt-0.5 opacity-90">{error?.response?.data?.message || 'Unable to analyze skills. Please try again.'}</p>
              </div>
            </motion.div>
          )}
        </motion.form>
      )}

      {result && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Brain} label="Your Skills" value={result.existingSkills?.length || 0} color="purple" />
            <StatCard icon={Target} label="Missing Skills" value={result.missingSkills?.length || 0} color="warning" />
            <StatCard icon={Zap} label="Projects" value={result.projects?.length || result.recommendedProjects?.length || 0} color="primary" />
            <StatCard icon={Award} label="Certifications" value={result.certifications?.length || 0} color="success" />
          </motion.div>

          {result.missingSkills?.length > 0 && (
            <SectionCard icon={Target} title="Missing Skills" badge={result.missingSkills.length} color="amber">
              <div className="grid gap-3 sm:grid-cols-2">
                {result.missingSkills.map((skill, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-[var(--border-color)] p-4 bg-[var(--bg-secondary)]">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="text-sm font-medium text-[var(--text-primary)]">{skill}</span>
                    </div>
                    <Badge variant="warning" size="xs">Missing</Badge>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {result.existingSkills?.length > 0 && (
            <SectionCard icon={CheckCircle} title="Your Skills" badge={result.existingSkills.length} color="success">
              <div className="flex flex-wrap gap-2">
                {result.existingSkills.map((skill, i) => (
                  <Badge key={i} variant="success" size="md">{skill}</Badge>
                ))}
              </div>
            </SectionCard>
          )}

          {result.learningResources?.length > 0 && (
            <SectionCard icon={BookOpen} title="Learning Resources" color="blue">
              <div className="grid gap-3 sm:grid-cols-2">
                {result.learningResources.map((res, i) => (
                  <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 hover:bg-[var(--bg-tertiary)] transition-colors">
                    <p className="font-medium text-sm text-[var(--text-primary)]">{res.title}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">{res.description}</p>
                    {res.url && (
                      <a href={res.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700">
                        Learn more →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {result.recommendedProjects?.length > 0 && (
            <SectionCard icon={Zap} title="Recommended Projects" color="purple">
              <div className="grid gap-3 sm:grid-cols-2">
                {result.recommendedProjects.map((project, i) => (
                  <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                    <p className="font-medium text-sm text-[var(--text-primary)]">{project.title}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">{project.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {project.skills?.map((s, j) => (
                        <Badge key={j} variant="primary" size="xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {result.certifications?.length > 0 && (
            <SectionCard icon={Award} title="Recommended Certifications" color="amber">
              <div className="grid gap-3 sm:grid-cols-2">
                {result.certifications.map((cert, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                      <Award className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{cert.name}</p>
                      {cert.provider && <p className="text-xs text-[var(--text-tertiary)]">{cert.provider}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {result.timeline && (
            <SectionCard icon={Clock} title="Recommended Timeline" color="indigo">
              <div className="space-y-3">
                {result.timeline.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                        item.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' :
                        item.status === 'in-progress' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' :
                        'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                      )}>
                        {i + 1}
                      </div>
                      {i < result.timeline.length - 1 && <div className="w-px flex-1 bg-[var(--border-color)] my-1" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{item.title}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{item.duration}</p>
                      {item.description && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          <motion.div variants={itemVariants} className="flex justify-center pb-4">
            <Button variant="outline" onClick={reset}>Analyze Another Role</Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
