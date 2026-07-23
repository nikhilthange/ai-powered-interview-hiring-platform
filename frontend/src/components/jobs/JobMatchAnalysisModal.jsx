import Modal from '../ui/Modal'
import Button from '../ui/Button'
import CountUp from '../ui/CountUp'
import Badge from '../ui/Badge'
import { motion } from 'framer-motion'
import { Sparkles, CheckCircle2, XCircle, Zap, Target, BookOpen } from 'lucide-react'

export default function JobMatchAnalysisModal({ open, onClose, job, matchScore = 94 }) {
  if (!job) return null

  const matchedSkills = job.requirements?.slice(0, 3) || ['React', 'Node.js', 'TypeScript']
  const missingSkills = ['Docker', 'AWS S3']

  return (
    <Modal open={open} onClose={onClose} title="AI Job Match Analysis" size="lg">
      <div className="space-y-6">
        {/* Match Header Gauge */}
        <div className="flex items-center gap-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white border border-indigo-500/30">
          <div className="flex flex-col items-center justify-center h-20 w-20 rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 shrink-0">
            <span className="text-2xl font-extrabold"><CountUp value={matchScore} />%</span>
            <span className="text-[10px] uppercase font-bold text-indigo-200">Match</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">{job.title}</h3>
            <p className="text-xs text-indigo-200/80 mt-1">
              Your profile and skills align exceptionally well with this job requirement.
            </p>
          </div>
        </div>

        {/* Matched & Missing Skills Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 space-y-2">
            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Matched Skills ({matchedSkills.length})
            </h4>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {matchedSkills.map((s, i) => (
                <Badge key={i} variant="success" size="sm">
                  ✔ {s}
                </Badge>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 space-y-2">
            <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="h-4 w-4" /> Missing / Gap Skills ({missingSkills.length})
            </h4>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {missingSkills.map((s, i) => (
                <Badge key={i} variant="danger" size="sm">
                  ❌ {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* AI Preparation Advice */}
        <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-2">
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-indigo-500" /> AI Recommendation
          </h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Highlight your strong experience with {matchedSkills.join(', ')} during interviews. Briefly review basic concepts for {missingSkills.join(' & ')} to confidently handle interview questions.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="gradient" onClick={onClose}>
            <Zap className="h-4 w-4" /> Tailor Resume for this Job
          </Button>
        </div>
      </div>
    </Modal>
  )
}
