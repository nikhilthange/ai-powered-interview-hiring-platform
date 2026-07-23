import { useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Textarea from '../../components/ui/Textarea'
import FileDropzone from '../../components/FileUpload/FileDropzone'
import AIStepLoader from '../../components/ui/AIStepLoader'
import CountUp from '../../components/ui/CountUp'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import { cn } from '../../lib/utils'
import {
  Sparkles, FileText, CheckCircle2, ArrowRight, Copy, Download, Save,
  Check, AlertTriangle, ArrowLeft, RefreshCw, Layers, ShieldCheck, Zap
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { staggerContainer, staggerItem } from '../../lib/motion'

export default function ResumeTailor() {
  const { toast } = useToast()
  const shouldReduceMotion = useReducedMotion()
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileChange = useCallback((f) => setFile(f), [])

  const handleTailor = (e) => {
    e.preventDefault()
    if (!file || !jobDescription.trim()) {
      toast.error('Please upload a resume and provide a job description.')
      return
    }

    setIsAnalyzing(true)
    setResult(null)

    // Simulate AI Tailoring Process
    setTimeout(() => {
      setIsAnalyzing(false)
      setResult({
        atsScoreBefore: 64,
        atsScoreAfter: 94,
        summaryBefore: 'Experienced software developer proficient in React, JavaScript, and Web Development seeking a frontend engineering role.',
        summaryAfter: 'Results-driven Senior Frontend Engineer with 5+ years of expertise in architecting high-performance React application suites, optimizing client-side state, and streamlining CI/CD pipelines to deliver scalable enterprise web applications.',
        addedKeywords: ['TypeScript', 'State Management (Redux/Zustand)', 'Micro-frontends', 'RESTful APIs', 'Jest/RTL', 'Performance Optimization'],
        missingKeywords: ['Docker', 'AWS S3', 'GraphQL'],
        bulletImprovements: [
          {
            before: 'Built React components for the main web application and fixed bugs.',
            after: 'Architected reusable, high-performance React component primitives, reducing web bundle size by 28% and boosting Lighthouse performance scores to 98+.'
          },
          {
            before: 'Worked with backend developers to fetch API data and show on screen.',
            after: 'Integrated resilient REST APIs and WebSocket streams with optimistic UI updates, decreasing client network latency by 35%.'
          },
          {
            before: 'Helped team with testing and deploying new website features.',
            after: 'Pioneered automated End-to-End Cypress test suites and GitHub Action workflows, elevating test coverage from 60% to 92% across core release cycles.'
          }
        ],
        suggestions: [
          'Incorporate quantitative metrics (e.g. % improvements, latency reductions) into your experience section.',
          'Add TypeScript and State Management explicitly to the top 3 bullet points.',
          'Align your project headline directly with the target job title.'
        ]
      })
      toast.success('Resume tailored successfully!')
    }, 2800)
  }

  const handleCopy = () => {
    if (!result) return
    const text = `
TAILORED PROFESSIONAL SUMMARY:
${result.summaryAfter}

KEY ATS KEYWORDS ADDED:
${result.addedKeywords.join(', ')}

IMPROVED EXPERIENCE BULLETS:
${result.bulletImprovements.map(b => `• ${b.after}`).join('\n')}
    `.trim()

    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Tailored content copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPdf = () => {
    toast.success('Downloading Tailored PDF Resume...')
  }

  const handleSaveResume = () => {
    setSaved(true)
    toast.success('Saved to My Resumes')
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : staggerContainer(0.08)}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-8 pb-16"
    >
      {/* Header */}
      <motion.div variants={shouldReduceMotion ? undefined : staggerItem} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
            <Sparkles className="h-7 w-7 text-indigo-500" /> AI Resume Tailor
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Instantly adapt your resume to any job description and boost your ATS Match Score.
          </p>
        </div>
      </motion.div>

      {/* Input Form Card */}
      {!result && !isAnalyzing && (
        <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
          <form onSubmit={handleTailor} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="h-full border-[var(--border-color)]">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    <span>Upload Resume (PDF / DOCX)</span>
                  </div>
                  <FileDropzone onFileSelect={handleFileChange} selectedFile={file} />
                </CardContent>
              </Card>

              <Card className="h-full border-[var(--border-color)]">
                <CardContent className="p-6 space-y-4 flex flex-col h-full">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                    <Layers className="h-4 w-4 text-purple-500" />
                    <span>Target Job Description</span>
                  </div>
                  <Textarea
                    rows={6}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="flex-1"
                    required
                  />
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                variant="gradient"
                disabled={!file || !jobDescription.trim()}
                className="w-full sm:w-auto"
              >
                <Sparkles className="h-4 w-4" />
                Tailor Resume with AI
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Stepped AI Loader */}
      {isAnalyzing && (
        <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
          <Card className="border-indigo-200 dark:border-indigo-900/40">
            <AIStepLoader title="HireMate AI is tailoring your resume for the job" />
          </Card>
        </motion.div>
      )}

      {/* Results View */}
      {result && !isAnalyzing && (
        <motion.div variants={shouldReduceMotion ? undefined : staggerContainer(0.08)} initial="hidden" animate="visible" className="space-y-6">
          
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setResult(null)}>
                <RefreshCw className="h-3.5 w-3.5" /> Tailor Another
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy All'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                <Download className="h-3.5 w-3.5" /> Download PDF
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveResume} success={saved}>
                <Save className="h-3.5 w-3.5" /> Save as New Resume
              </Button>
            </div>
          </div>

          {/* ATS Score Before vs After Split Banner */}
          <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-indigo-500/20 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="grid sm:grid-cols-2 gap-6 items-center relative z-10">
                <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="flex flex-col items-center justify-center h-20 w-20 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400">
                    <span className="text-xs uppercase font-bold text-red-300">Before</span>
                    <span className="text-2xl font-extrabold"><CountUp value={result.atsScoreBefore} />%</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-200">Original ATS Score</h3>
                    <p className="text-xs text-slate-400 mt-1">Generic resume structure with key skill gaps.</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 backdrop-blur-md">
                  <div className="flex flex-col items-center justify-center h-20 w-20 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                    <span className="text-xs uppercase font-bold text-emerald-100">After</span>
                    <span className="text-2xl font-extrabold"><CountUp value={result.atsScoreAfter} />%</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-emerald-300 flex items-center gap-1.5">
                      <Zap className="h-4 w-4 fill-current" /> Tailored ATS Match
                    </h3>
                    <p className="text-xs text-emerald-100/80 mt-1">+30% match improvement for this job post.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Professional Summary Comparison */}
          <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
            <Card className="border-[var(--border-color)]">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  Professional Summary Upgrade
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
                    <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Before</span>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{result.summaryBefore}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 space-y-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Tailored & Impactful
                    </span>
                    <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">{result.summaryAfter}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Added Keywords & Skills */}
          <motion.div variants={shouldReduceMotion ? undefined : staggerItem} className="grid md:grid-cols-2 gap-6">
            <Card className="border-[var(--border-color)]">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  ATS Keywords Added
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.addedKeywords.map((kw, i) => (
                    <Badge key={i} variant="primary" size="md">
                      <Check className="h-3 w-3 mr-1" /> {kw}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[var(--border-color)]">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Missing Skills to Consider
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.missingKeywords.map((kw, i) => (
                    <Badge key={i} variant="warning" size="md">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bullet Points Improvement Comparison */}
          <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
            <Card className="border-[var(--border-color)]">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Experience Bullet Point Enhancements</h3>
                <div className="space-y-4">
                  {result.bulletImprovements.map((bullet, index) => (
                    <div key={index} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] overflow-hidden shadow-sm">
                      <div className="p-4 bg-red-50/30 dark:bg-red-950/10 border-b border-[var(--border-color)]">
                        <span className="text-xs font-bold text-red-500 uppercase tracking-wider block mb-1">Original Bullet</span>
                        <p className="text-sm text-[var(--text-secondary)]">{bullet.before}</p>
                      </div>
                      <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> High-Impact Tailored Bullet
                        </span>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{bullet.after}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </motion.div>
      )}
    </motion.div>
  )
}
