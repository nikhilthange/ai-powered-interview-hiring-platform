import { useState, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Textarea from '../../components/ui/Textarea'
import { coverLetterApi } from '../../services/coverLetterApi'
import FileDropzone from '../../components/FileUpload/FileDropzone'
import AIStepLoader from '../../components/ui/AIStepLoader'
import { useToast } from '../../components/ui/Toast'
import { cn } from '../../lib/utils'
import {
  Sparkles, FileText, Copy, Download, RefreshCw, Check, ArrowLeft, Layers, Send
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { staggerContainer, staggerItem } from '../../lib/motion'
import { exportToPdf } from '../../utils/pdfExport'
import { Document, Packer, Paragraph, TextRun } from 'docx'

const TONES = [
  { id: 'Professional', label: 'Professional', desc: 'Balanced, confident, industry-standard tone' },
  { id: 'Friendly', label: 'Friendly & Passionate', desc: 'Warm, enthusiastic, person-first narrative' },
  { id: 'Formal', label: 'Formal & Executive', desc: 'Traditional, structured, executive language' },
]

export default function CoverLetterGenerator() {
  const { toast } = useToast()
  const shouldReduceMotion = useReducedMotion()

  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [tone, setTone] = useState('Professional')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')

  const handleFileChange = useCallback((f) => setFile(f), [])

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!file || !jobDescription.trim()) {
      toast.error('Please upload a resume and provide a job description.')
      return
    }

    setIsGenerating(true)

    try {
      const formData = new FormData()
      if (file) formData.append('resume', file)
      formData.append('jobDescription', jobDescription.trim())
      formData.append('tone', tone)
      const res = await coverLetterApi.generateCoverLetter(formData)
      const data = res.data?.data || res.data
      setCoverLetter(data.content || data)
      toast.success(`Cover letter generated in ${tone} tone!`)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate cover letter.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    if (!coverLetter) return
    navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    toast.success('Cover letter copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadDocx = async () => {
    if (!coverLetter) return
    try {
      const paragraphs = coverLetter.split('\n\n').map(p => new Paragraph({
        children: [new TextRun(p)]
      }))
      const doc = new Document({ sections: [{ children: paragraphs }] })
      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Cover_Letter.docx'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Downloaded DOCX Cover Letter')
    } catch {
      toast.error('Failed to export DOCX file')
    }
  }

  const handleDownloadPdf = () => {
    if (!coverLetter) return
    const formattedHtml = coverLetter.split('\n\n').map(p => `<p style="margin-bottom: 16px;">${p}</p>`).join('')
    exportToPdf({
      title: 'Cover Letter',
      content: `<div style="font-family: Georgia, serif; line-height: 1.8; color: #1e293b;">${formattedHtml}</div>`,
      filename: 'Cover_Letter.pdf'
    })
    toast.success('Generating Cover Letter PDF...')
  }

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : staggerContainer(0.08)}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-8 pb-16"
    >
      {/* Header */}
      <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
          <Sparkles className="h-7 w-7 text-purple-500" /> AI Cover Letter Generator
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Generate a tailored, compelling cover letter in seconds matching your resume and target role.
        </p>
      </motion.div>

      {/* Input Form */}
      {!isGenerating && !coverLetter && (
        <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="h-full border-[var(--border-color)]">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                    <FileText className="h-4 w-4 text-purple-500" />
                    <span>Upload Resume</span>
                  </div>
                  <FileDropzone onFileSelect={handleFileChange} selectedFile={file} />
                </CardContent>
              </Card>

              <Card className="h-full border-[var(--border-color)]">
                <CardContent className="p-6 space-y-4 flex flex-col h-full">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                    <Layers className="h-4 w-4 text-indigo-500" />
                    <span>Job Description</span>
                  </div>
                  <Textarea
                    rows={6}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste job description..."
                    className="flex-1"
                    required
                  />
                </CardContent>
              </Card>
            </div>

            {/* Tone Selector */}
            <Card className="border-[var(--border-color)]">
              <CardContent className="p-6 space-y-3">
                <label className="block text-sm font-semibold text-[var(--text-primary)]">Select Writing Tone</label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {TONES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id)}
                      className={cn(
                        'p-4 rounded-2xl border text-left transition-all',
                        tone === t.id
                          ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 shadow-sm'
                          : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-purple-200'
                      )}
                    >
                      <p className="text-sm font-bold text-[var(--text-primary)]">{t.label}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 leading-snug">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg" variant="gradient" disabled={!file || !jobDescription.trim()}>
                <Sparkles className="h-4 w-4" /> Generate Cover Letter
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Stepped AI Loader */}
      {isGenerating && (
        <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
          <Card className="border-purple-200 dark:border-purple-900/40">
            <AIStepLoader title="HireMate AI is drafting your personalized cover letter" />
          </Card>
        </motion.div>
      )}

      {/* Output Letter Card */}
      {coverLetter && !isGenerating && (
        <motion.div variants={shouldReduceMotion ? undefined : staggerItem} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm">
            <Button variant="outline" size="sm" onClick={() => setCoverLetter('')}>
              <RefreshCw className="h-3.5 w-3.5" /> Start Over
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadDocx}>
                <Download className="h-3.5 w-3.5" /> Download DOCX
              </Button>
              <Button variant="primary" size="sm" onClick={handleDownloadPdf}>
                <Download className="h-3.5 w-3.5" /> Download PDF
              </Button>
            </div>
          </div>

          <Card className="border-[var(--border-color)]">
            <CardContent className="p-8">
              <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-line text-[var(--text-primary)] font-serif">
                {coverLetter}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
