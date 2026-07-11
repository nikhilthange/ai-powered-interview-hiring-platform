import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent } from '../ui/Card'
import Badge from '../ui/Badge'
import { Sparkles, Briefcase, MapPin, GraduationCap, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { cn } from '../../lib/utils'
import MatchBadge, { MatchScoreBar } from './MatchBadge'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: '90', label: '90%+' },
  { key: '80', label: '80%+' },
  { key: 'remote', label: 'Remote' },
  { key: 'junior', label: 'Junior' },
  { key: 'mid', label: 'Mid' },
  { key: 'senior', label: 'Senior' },
]

function SkillTag({ skill, match = true }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium',
      match
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    )}>
      {skill}
    </span>
  )
}

function MatchDetail({ icon: Icon, label, score, feedback }) {
  return (
    <div className="flex items-start gap-2 py-2 px-3 rounded-lg bg-[var(--bg-secondary)]">
      <div className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
        score >= 7 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' :
        score >= 4 ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600' :
        'bg-red-50 dark:bg-red-900/30 text-red-600'
      )}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-[var(--text-primary)]">{label}</span>
          <span className={cn(
            'text-[10px] font-bold px-1.5 py-0.5 rounded',
            score >= 7 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
            score >= 4 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
            'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
          )}>
            {score}/10
          </span>
        </div>
        <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{feedback}</p>
      </div>
    </div>
  )
}

export default function AIMatchedJobs({ jobs, isLoading }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  const filtered = useMemo(() => {
    if (!jobs) return []
    let result = [...jobs]

    switch (activeFilter) {
      case '90':
        result = result.filter(j => j.matchPercentage >= 90)
        break
      case '80':
        result = result.filter(j => j.matchPercentage >= 80)
        break
      case 'remote':
        result = result.filter(j => j.job?.jobType === 'Remote')
        break
      case 'junior':
        result = result.filter(j => j.job?.experienceLevel === 'Junior')
        break
      case 'mid':
        result = result.filter(j => j.job?.experienceLevel === 'Mid')
        break
      case 'senior':
        result = result.filter(j => j.job?.experienceLevel === 'Senior')
        break
    }
    return result
  }, [jobs, activeFilter])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="skeleton-shimmer h-10 w-10 rounded-xl" />
              <div className="space-y-2 flex-1">
                <div className="skeleton-shimmer h-4 w-2/3 rounded-lg" />
                <div className="skeleton-shimmer h-3 w-1/3 rounded-lg" />
              </div>
              <div className="skeleton-shimmer h-8 w-16 rounded-lg" />
            </div>
            <div className="skeleton-shimmer h-2 w-full rounded-full" />
            <div className="flex gap-2">
              <div className="skeleton-shimmer h-5 w-16 rounded-md" />
              <div className="skeleton-shimmer h-5 w-20 rounded-md" />
              <div className="skeleton-shimmer h-5 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <Sparkles className="h-10 w-10 mx-auto text-[var(--text-tertiary)] mb-3" />
        <p className="text-sm font-medium text-[var(--text-primary)]">No AI-matched jobs found</p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">Complete your profile with skills to get personalized recommendations</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
              activeFilter === f.key
                ? 'bg-indigo-500 text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-color)]'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-[var(--text-secondary)]">No jobs match this filter</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item, idx) => {
            const job = item.job
            if (!job) return null
            const isExpanded = expandedId === job._id

            return (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card hover className="overflow-hidden">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold text-sm sm:text-base">
                        {job.title?.charAt(0) || 'J'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link to={`/jobs/${job._id}`} className="text-sm font-semibold text-[var(--text-primary)] hover:text-indigo-600 transition-colors truncate block">
                              {job.title}
                            </Link>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {job.location && (
                                <span className="flex items-center gap-0.5 text-[11px] text-[var(--text-tertiary)]">
                                  <MapPin className="h-3 w-3" />
                                  {job.location}
                                </span>
                              )}
                              {job.jobType && <Badge variant="primary" size="xs">{job.jobType}</Badge>}
                              {job.experienceLevel && <Badge variant="default" size="xs">{job.experienceLevel}</Badge>}
                            </div>
                          </div>
                          <div className="shrink-0">
                            <MatchBadge score={item.matchPercentage} />
                          </div>
                        </div>

                        <div className="mt-3">
                          <MatchScoreBar score={item.matchPercentage} />
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-3">
                          {item.matchingSkills?.slice(0, 4).map((s, i) => (
                            <SkillTag key={i} skill={s} match />
                          ))}
                          {item.missingSkills?.slice(0, 2).map((s, i) => (
                            <SkillTag key={`m-${i}`} skill={s} match={false} />
                          ))}
                          {(item.matchingSkills?.length > 4 || item.missingSkills?.length > 2) && (
                            <span className="text-[10px] text-[var(--text-tertiary)]">+ more</span>
                          )}
                        </div>

                        {item.whyRecommended && (
                          <p className="text-[11px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                            <span className="font-medium text-indigo-500 dark:text-indigo-400">Why:</span> {item.whyRecommended}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : job._id)}
                            className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            {isExpanded ? 'Hide details' : 'View match details'}
                          </button>
                          <Link
                            to={`/jobs/${job._id}`}
                            className="ml-auto flex items-center gap-1 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                          >
                            View job <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>

                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 pt-3 border-t border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-2 gap-2"
                          >
                            <MatchDetail icon={GraduationCap} label="Experience" score={item.experienceMatch?.score || 0} feedback={item.experienceMatch?.feedback || ''} />
                            <MatchDetail icon={Briefcase} label="Education" score={item.educationMatch?.score || 0} feedback={item.educationMatch?.feedback || ''} />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
