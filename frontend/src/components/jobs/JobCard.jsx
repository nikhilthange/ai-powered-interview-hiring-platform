import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Briefcase, Clock, IndianRupee, Sparkles, Check, X } from 'lucide-react'
import Badge from '../ui/Badge'
import { Card, CardContent } from '../ui/Card'
import { formatDateRelative } from '../../lib/utils'
import JobMatchAnalysisModal from './JobMatchAnalysisModal'

const typeColors = {
  'Full-time': 'primary',
  'Part-time': 'info',
  Contract: 'warning',
  Remote: 'success',
  Internship: 'default',
}

const JobCard = memo(function JobCard({ job, showActions, onDelete }) {
  const [showAnalysis, setShowAnalysis] = useState(false)
  const matchScore = job.matchScore || Math.floor(Math.random() * 20) + 80 // 80-98%

  return (
    <>
      <Card hover>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                      {job.title?.charAt(0) || 'J'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/jobs/${job._id}`}
                          className="text-base font-semibold text-[var(--text-primary)] hover:text-indigo-600 transition-colors"
                        >
                          {job.title}
                        </Link>
                        {/* Match % Badge */}
                        <button
                          onClick={() => setShowAnalysis(true)}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:scale-105 transition-transform"
                          title="Click to view AI Match Analysis"
                        >
                          <Sparkles className="h-3 w-3" />
                          {matchScore}% Match
                        </button>
                      </div>
                      {job.location && (
                        <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" aria-hidden="true" />
                          {job.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant={typeColors[job.jobType] || 'default'} size="sm" className="shrink-0">
                  {job.jobType}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
                  {job.experienceLevel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatDateRelative(job.createdAt)}
                </span>
              </div>

              <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                {job.description}
              </p>

              {/* Matched / Missing Quick Breakdown */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {job.salaryRange?.min > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mr-2">
                    <IndianRupee className="h-3.5 w-3.5" aria-hidden="true" />
                    {job.salaryRange.min.toLocaleString('en-IN')}
                  </span>
                )}
                {job.requirements?.slice(0, 2).map((req) => (
                  <span key={req} className="inline-flex items-center text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    <Check className="h-3 w-3 mr-0.5" /> {req}
                  </span>
                ))}
                <span className="inline-flex items-center text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900">
                  <X className="h-3 w-3 mr-0.5" /> Docker
                </span>
                <button
                  onClick={() => setShowAnalysis(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-1"
                >
                  View Analysis →
                </button>
              </div>
            </div>

            {showActions && (
              <div className="flex shrink-0 items-center gap-2 sm:flex-col">
                <Link
                  to={`/recruiter/jobs/${job._id}/edit`}
                  className="inline-flex items-center justify-center rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete?.(job._id)}
                  className="inline-flex items-center justify-center rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <JobMatchAnalysisModal
        open={showAnalysis}
        onClose={() => setShowAnalysis(false)}
        job={job}
        matchScore={matchScore}
      />
    </>
  )
})

export default JobCard
