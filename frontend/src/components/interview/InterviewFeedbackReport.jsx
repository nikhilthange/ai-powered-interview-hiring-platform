import { memo, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Card, CardContent } from '../ui/Card'
import Button from '../ui/Button'
import CountUp from '../ui/CountUp'
import Badge from '../ui/Badge'
import { useToast } from '../ui/Toast'
import { cn } from '../../lib/utils'
import {
  Award, CheckCircle2, AlertTriangle, Lightbulb, BookOpen, Download,
  TrendingUp, RefreshCw, Sparkles, Brain, MessageSquare, Eye, Cpu
} from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip
} from 'recharts'
import { staggerContainer, staggerItem } from '../../lib/motion'
import { exportInterviewReportPdf } from '../../utils/pdfExport'

const RadarChartWrapper = memo(function RadarChartWrapper({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="var(--border-color)" />
        <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
        <PolarRadiusAxis domain={[0, 100]} stroke="var(--border-color)" />
        <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  )
})

export default function InterviewFeedbackReport({ sessionData, onRetake }) {
  const { toast } = useToast()
  const shouldReduceMotion = useReducedMotion()

  const overallScore = sessionData?.overallScore || 86
  const metrics = sessionData?.metrics || [
    { name: 'Technical Knowledge', value: 88, fullMark: 100 },
    { name: 'Communication', value: 85, fullMark: 100 },
    { name: 'Confidence', value: 90, fullMark: 100 },
    { name: 'Problem Solving', value: 82, fullMark: 100 },
    { name: 'Grammar', value: 92, fullMark: 100 },
    { name: 'Vocabulary', value: 86, fullMark: 100 },
    { name: 'Fluency', value: 84, fullMark: 100 },
    { name: 'Body Language', value: 89, fullMark: 100 },
  ]

  const strengths = sessionData?.strengths || [
    'Strong structural clarity using STAR method during behavioral responses.',
    'Deep understanding of asynchronous state handling and web performance.',
    'Clear tone, steady speech rate (140 wpm), and confident delivery.'
  ]

  const weaknesses = sessionData?.weaknesses || [
    'Could provide more explicit complexity analysis (Big-O notation) for DSA questions.',
    'Occasional filler words ("like", "um") when navigating tough edge cases.'
  ]

  const suggestions = sessionData?.suggestions || [
    'Practice stating time and space complexity prior to implementing code solutions.',
    'Pause briefly for 2 seconds before answering complex architectural questions.'
  ]

  const practiceQuestions = sessionData?.practiceQuestions || [
    'How would you handle a memory leak in a production React application?',
    'Describe a situation where you resolved a team deadlock on tech stack selection.'
  ]

  const resources = sessionData?.resources || [
    { title: 'System Design Interview Guide', link: 'https://github.com/donnemartin/system-design-primer' },
    { title: 'React Performance Optimization Handbook', link: 'https://react.dev/learn/render-and-commit' }
  ]

  const handleDownloadPdf = () => {
    exportInterviewReportPdf({ overallScore, metrics, strengths, weaknesses, suggestions })
    toast.success('Generating AI Interview Report PDF...')
  }

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : staggerContainer(0.08)}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Top Banner */}
      <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
        <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6 text-center sm:text-left">
              {/* Circular Score Gauge */}
              <div className="relative flex items-center justify-center h-28 w-28 shrink-0 rounded-full bg-indigo-500/20 border-4 border-indigo-500/50 shadow-inner">
                <div className="text-center">
                  <span className="block text-3xl font-extrabold tracking-tight text-white">
                    <CountUp value={overallScore} />
                  </span>
                  <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Overall</span>
                </div>
              </div>
              <div>
                <Badge variant="primary" size="sm" className="mb-2">AI Interview Report</Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Performance Feedback</h2>
                <p className="text-sm text-indigo-200/80 mt-1">Generated by HireMate Evaluation Engine</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Download className="h-4 w-4" /> Download PDF
              </Button>
              {onRetake && (
                <Button variant="gradient" size="sm" onClick={onRetake}>
                  <RefreshCw className="h-4 w-4" /> Retake Practice
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Radar Chart & Metric Bars */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recharts Radar Chart */}
        <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
          <Card className="h-full border-[var(--border-color)]">
            <CardContent className="p-6 flex flex-col h-full">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-500" /> Skill Competency Radar
              </h3>
              <div className="flex-1 w-full min-h-[300px] flex items-center justify-center">
                <RadarChartWrapper data={metrics} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Individual Metric Progress Bars */}
        <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
          <Card className="h-full border-[var(--border-color)]">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-500" /> Metric Breakdown
              </h3>
              <div className="space-y-3">
                {metrics.map((m) => (
                  <div key={m.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-[var(--text-primary)]">
                      <span>{m.name}</span>
                      <span className="text-indigo-600 dark:text-indigo-400"><CountUp value={m.value} />%</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <motion.div
                        initial={shouldReduceMotion ? { scaleX: m.value / 100 } : { scaleX: 0 }}
                        animate={{ scaleX: m.value / 100 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{ transformOrigin: 'left' }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Strengths & Weaknesses */}
      <motion.div variants={shouldReduceMotion ? undefined : staggerItem} className="grid md:grid-cols-2 gap-6">
        <Card className="border-[var(--border-color)]">
          <CardContent className="p-6 space-y-3">
            <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Key Strengths
            </h3>
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-[var(--border-color)]">
          <CardContent className="p-6 space-y-3">
            <h3 className="text-base font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Growth Opportunities
            </h3>
            <ul className="space-y-2">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Practice Questions & Learning Resources */}
      <motion.div variants={shouldReduceMotion ? undefined : staggerItem} className="grid md:grid-cols-2 gap-6">
        <Card className="border-[var(--border-color)]">
          <CardContent className="p-6 space-y-3">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-500" /> Recommended Questions to Practice
            </h3>
            <div className="space-y-2">
              {practiceQuestions.map((q, i) => (
                <div key={i} className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-medium">
                  {q}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--border-color)]">
          <CardContent className="p-6 space-y-3">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" /> Curated Learning Resources
            </h3>
            <div className="space-y-2">
              {resources.map((r, i) => (
                <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-indigo-300 dark:hover:border-indigo-700 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors">
                  {r.title} →
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
