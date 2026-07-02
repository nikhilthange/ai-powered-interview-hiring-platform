import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/axios'
import { Card, CardContent } from '../../components/ui/Card'

import { SkeletonPage } from '../../components/ui/Skeleton'
import { cn } from '../../lib/utils'
import { ArrowLeft, Star, Target, CheckCircle, AlertCircle, FileText, Brain, BarChart3 } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function ApplicationAnalysis() {
  const { id } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['application-analysis', id],
    queryFn: () => api.get(`/applications/${id}/analysis`).then((r) => r.data),
  })

  if (isLoading) return <SkeletonPage />

  const analysis = data?.data || data

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Link to="/my-applications" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to applications
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Application Analysis</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Detailed breakdown of your application performance</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'ATS Score', value: analysis?.atsScore || 'N/A', icon: Star, color: 'emerald' },
          { label: 'Match %', value: analysis?.matchPercent ? `${analysis.matchPercent}%` : 'N/A', icon: Target, color: 'indigo' },
          { label: 'Overall', value: analysis?.overallScore ? `${analysis.overallScore}%` : 'N/A', icon: Brain, color: 'purple' },
          { label: 'Status', value: analysis?.status || 'N/A', icon: BarChart3, color: 'amber' },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-5 text-center">
              <div className={cn(
                'mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl',
                `bg-${item.color}-50 text-${item.color}-600 dark:bg-${item.color}-950 dark:text-${item.color}-400`
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{item.value}</p>
              <p className="text-xs text-[var(--text-tertiary)]">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {analysis?.strengths?.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <h3 className="font-semibold text-[var(--text-primary)]">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {analysis?.improvements?.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-[var(--text-primary)]">Areas for Improvement</h3>
              </div>
              <ul className="space-y-2">
                {analysis.improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {imp}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {analysis?.feedback && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-indigo-500" />
                <h3 className="font-semibold text-[var(--text-primary)]">Detailed Feedback</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{analysis.feedback}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
