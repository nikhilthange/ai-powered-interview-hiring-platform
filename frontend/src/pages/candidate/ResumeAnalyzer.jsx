import { motion } from 'framer-motion'
import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { analysisApi } from '../../services/analysisApi'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Textarea from '../../components/ui/Textarea'
import FileDropzone from '../../components/FileUpload/FileDropzone'
import ScoreCard from '../../components/Analysis/ScoreCard'
import SectionCard from '../../components/Analysis/SectionCard'
import StatCard from '../../components/Analysis/StatCard'
import Badge from '../../components/ui/Badge'
import { AlertCircle, Sparkles, Target, Award, Star, Zap, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')

  const { mutate, data, isPending, isError, error, reset } = useMutation({
    mutationFn: (formData) =>
      analysisApi.analyzeResumeUpload(formData).then((r) => r.data),
    onError: () => {},
  })

  const handleFileChange = useCallback((f) => setFile(f), [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file || !jobDescription.trim()) return
    const formData = new FormData()
    formData.append('resume', file)
    formData.append('jobDescription', jobDescription.trim())
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
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">Resume Analyzer</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Upload your resume and paste a job description to get an instant ATS score and detailed AI-powered feedback.
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
              <Textarea
                id="jobDescription"
                label="Job Description"
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here for accurate ATS matching..."
                required
              />
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">{jobDescription.length} characters</p>
            </CardContent>
          </Card>

          {isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-4 py-10">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="h-8 w-8 text-indigo-500" />
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-medium text-[var(--text-primary)]">Analyzing your resume with AI</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Checking ATS compatibility, skills, and more...</p>
              </div>
            </motion.div>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!file || !jobDescription.trim() || isPending} size="lg">
              <Sparkles className="h-4 w-4" /> {isPending ? 'Analyzing...' : 'Analyze Resume'}
            </Button>
          </div>

          {isError && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Analysis Failed</p>
                <p className="mt-0.5 opacity-90">{error?.response?.data?.message || 'Unable to analyze resume. Please try again.'}</p>
              </div>
            </motion.div>
          )}
        </motion.form>
      )}

      {result && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <ScoreCard score={result.atsScore} label="ATS Score" subtitle="out of 100" />
            <StatCard
              icon={FileText}
              label="Match Percent"
              value={`${result.matchPercent}%`}
              subtitle="job requirement match"
              color={result.matchPercent >= 80 ? 'success' : result.matchPercent >= 60 ? 'warning' : 'danger'}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {result.aiAnalysis?.strengths?.length > 0 && (
              <SectionCard icon={Star} title="Strengths" color="emerald">
                <ul className="space-y-2">
                  {result.aiAnalysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}
            {result.aiAnalysis?.weaknesses?.length > 0 && (
              <SectionCard icon={AlertCircle} title="Weaknesses" color="red">
                <ul className="space-y-2">
                  {result.aiAnalysis.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      {w}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}
          </div>

          {result.missingSkills?.length > 0 && (
            <SectionCard icon={Target} title="Missing Skills" badge={result.missingSkills.length} color="amber">
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((skill, i) => (
                  <Badge key={i} variant="warning" size="md">{skill}</Badge>
                ))}
              </div>
            </SectionCard>
          )}

          {result.improvements?.length > 0 && (
            <SectionCard icon={FileText} title="Resume Improvements" color="blue">
              <ul className="space-y-2">
                {result.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    {imp}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {result.suggestedProjects?.length > 0 && (
            <SectionCard icon={Zap} title="Suggested Projects" color="purple">
              <div className="grid gap-3 sm:grid-cols-2">
                {result.suggestedProjects.map((project, i) => (
                  <div key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 hover:bg-[var(--bg-tertiary)] transition-colors">
                    <p className="font-medium text-sm text-[var(--text-primary)]">{project.title}</p>
                    <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">{project.description}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {result.suggestedCertifications?.length > 0 && (
            <SectionCard icon={Award} title="Suggested Certifications" color="amber">
              <div className="grid gap-3 sm:grid-cols-2">
                {result.suggestedCertifications.map((cert, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 hover:bg-[var(--bg-tertiary)] transition-colors">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                      <Award className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{cert.name}</p>
                      {cert.provider && <p className="text-xs text-[var(--text-tertiary)]">{cert.provider}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {result.aiAnalysis?.interviewTips?.length > 0 && (
            <SectionCard icon={Star} title="Interview Tips" color="indigo">
              <ul className="space-y-2">
                {result.aiAnalysis.interviewTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                    {tip}
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          <motion.div variants={itemVariants} className="flex justify-center gap-3 pb-4">
            <Button variant="outline" onClick={reset}>Analyze Another Resume</Button>
            <Button variant="primary" onClick={() => window.print()}><FileText className="h-4 w-4" /> Export PDF Report</Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
