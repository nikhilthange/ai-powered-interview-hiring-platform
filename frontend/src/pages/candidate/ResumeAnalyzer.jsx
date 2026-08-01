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
import AIStepLoader from '../../components/ui/AIStepLoader'
import { AlertCircle, Sparkles, Target, Award, Star, Zap, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEO from '../../components/seo/SEO'
import SEOPageContent from '../../components/seo/SEOPageContent'
import { buildWebPageSchema, buildBreadcrumbSchema, buildHowToSchema, buildFAQSchema } from '../../utils/schemaGenerator'

const RESUME_ANALYZER_FAQS = [
  {
    question: 'What is ATS and why is resume scoring important?',
    answer: 'Applicant Tracking Systems (ATS) are software tools used by employers to scan, rank, and filter resume submissions based on keywords, experience metrics, and formatting before human recruiters read them.',
  },
  {
    question: 'How does the HireMate AI Resume Analyzer work?',
    answer: 'HireMate parses your resume file using natural language processing algorithms, compares your technical skills and impact metrics against target job descriptions, and calculates an instant compatibility score.',
  },
  {
    question: 'How can I fix a low ATS resume score?',
    answer: 'Incorporate missing technical skills directly into your experience bullet points, quantify results with numerical metrics, use clean text section headers, and avoid multi-column graphic layouts that confuse ATS parsers.',
  },
]

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

  const resumeAnalyzerSchemas = [
    buildWebPageSchema({
      title: 'Free AI Resume Analyzer & ATS Score Checker | HireMate',
      description: 'Instantly score your resume against ATS filters, detect formatting errors, and get actionable AI recommendations to land technical interviews.',
      path: '/resume-analyzer',
    }),
    buildBreadcrumbSchema([{ name: 'Resume Analyzer', path: '/resume-analyzer' }]),
    buildFAQSchema(RESUME_ANALYZER_FAQS),
    buildHowToSchema({
      name: 'How to Analyze and Optimize Your Resume for ATS',
      description: 'Step-by-step workflow to check ATS compatibility and increase interview callbacks.',
      steps: [
        { name: 'Upload Resume File', text: 'Select your PDF or DOCX resume document.', url: '/resume-analyzer' },
        { name: 'Provide Job Description', text: 'Paste the target job description requirements into the text box.' },
        { name: 'Run AI Compatibility Analysis', text: 'Click Analyze Resume to trigger natural language ATS keyword extraction.' },
        { name: 'Implement Suggestions', text: 'Apply highlighted missing skills, action verbs, and formatting fixes.' },
      ],
    }),
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      <SEO
        title="Free AI Resume Analyzer & ATS Score Checker | HireMate"
        description="Instantly score your resume against ATS filters, detect formatting errors, and get actionable AI recommendations to land technical interviews."
        path="/resume-analyzer"
        schema={resumeAnalyzerSchemas}
      />
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
            <Card>
              <AIStepLoader title="HireMate AI is analyzing your resume" />
            </Card>
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

      <SEOPageContent
        summary="Audit your resume for applicant tracking system (ATS) compatibility with instant keyword gap analysis and AI-driven formatting checks."
        definition="The HireMate ATS Resume Analyzer evaluates candidate CVs against hiring algorithms, scoring readability, section header alignment, and technical keyword density."
        questions={[
          {
            question: 'Why do resumes get rejected by ATS filters before reaching hiring managers?',
            answer: 'ATS software rejects resumes due to missing technical keywords, complex graphic formatting (such as tables or text boxes), non-standard font choices, or lack of quantifiable project impact metrics.',
          },
          {
            question: 'How often should I analyze my resume against job descriptions?',
            answer: 'Analyze your resume for every unique engineering application to ensure target keywords match the employer\'s specific technical requirements.',
          },
        ]}
        steps={[
          { title: 'Upload Resume', desc: 'Select your PDF or DOCX file for instant AI parsing.' },
          { title: 'Paste Job Post', desc: 'Add target job requirements to calculate keyword match precision.' },
          { title: 'Review Score', desc: 'Inspect your overall ATS compatibility score and section breakdown.' },
          { title: 'Fix Keyword Gaps', desc: 'Incorporate recommended skills into experience bullet points.' },
        ]}
        takeaways={[
          'Instant ATS compatibility scoring and section breakdown',
          'Automated technical keyword gap detection',
          'Quantifiable impact metric suggestions for engineering resumes',
        ]}
        faqs={RESUME_ANALYZER_FAQS}
      />
    </motion.div>
  )
}
