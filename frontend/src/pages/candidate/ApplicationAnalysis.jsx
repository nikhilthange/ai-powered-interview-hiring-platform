import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { applicationApi } from '../../services/applicationApi'
import { SkeletonPage } from '../../components/ui/Skeleton'
import StatCard from '../../components/Analysis/StatCard'
import SectionCard from '../../components/Analysis/SectionCard'
import { ArrowLeft, CheckCircle, AlertCircle, FileText, Star, Target, Brain, BarChart3 } from 'lucide-react'

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
    queryFn: () => applicationApi.getApplicationAnalysis(id).then((r) => r.data),
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
        <StatCard label="ATS Score" value={analysis?.atsScore || 'N/A'} icon={Star} color="success" />
        <StatCard label="Match %" value={analysis?.matchPercent ? `${analysis.matchPercent}%` : 'N/A'} icon={Target} color="primary" />
        <StatCard label="Overall" value={analysis?.overallScore ? `${analysis.overallScore}%` : 'N/A'} icon={Brain} color="purple" />
        <StatCard label="Status" value={analysis?.status || 'N/A'} icon={BarChart3} color="warning" />
      </motion.div>

      {analysis?.strengths?.length > 0 && (
        <motion.div variants={itemVariants}>
          <SectionCard icon={CheckCircle} title="Strengths" color="emerald">
            <ul className="space-y-2">
              {analysis.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {s}
                </li>
              ))}
            </ul>
          </SectionCard>
        </motion.div>
      )}

      {analysis?.improvements?.length > 0 && (
        <motion.div variants={itemVariants}>
          <SectionCard icon={AlertCircle} title="Areas for Improvement" color="amber">
            <ul className="space-y-2">
              {analysis.improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {imp}
                </li>
              ))}
            </ul>
          </SectionCard>
        </motion.div>
      )}

      {analysis?.feedback && (
        <motion.div variants={itemVariants}>
          <SectionCard icon={FileText} title="Detailed Feedback" color="indigo">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{analysis.feedback}</p>
          </SectionCard>
        </motion.div>
      )}
    </motion.div>
  )
}
