import { Link } from 'react-router-dom'
import { MapPin, Briefcase, Clock, IndianRupee, Building2, ChevronRight } from 'lucide-react'
import Badge from '../ui/Badge'
import { Card, CardContent } from '../ui/Card'
import { formatDateRelative } from '../../lib/utils'

const typeColors = {
  'Full-time': 'primary',
  'Part-time': 'info',
  Contract: 'warning',
  Remote: 'success',
  Internship: 'default',
}

export default function JobCard({ job, showActions, onDelete }) {
  return (
    <Card hover>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-primary-100)] text-[var(--color-primary-600)] dark:from-[var(--color-primary-950)] dark:to-[var(--color-primary-900)] dark:text-[var(--color-primary-400)] font-semibold text-sm">
                    {job.company?.charAt(0) || job.title?.charAt(0) || 'J'}
                  </span>
                  <div>
                    <Link
                      to={`/jobs/${job._id}`}
                      className="text-base font-semibold text-[var(--text-primary)] hover:text-[var(--color-primary-600)] transition-colors"
                    >
                      {job.title}
                    </Link>
                    {job.company && (
                      <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3" />
                        {job.company}
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
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                {job.experienceLevel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {formatDateRelative(job.createdAt)}
              </span>
            </div>

            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {job.description}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {job.salaryRange?.min > 0 && (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <IndianRupee className="h-3.5 w-3.5" />
                  {job.salaryRange.min.toLocaleString('en-IN')}
                  {job.salaryRange.max > 0 && ` - ${job.salaryRange.max.toLocaleString('en-IN')}`}
                </span>
              )}
              {job.skills?.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="default" size="xs">{skill}</Badge>
              ))}
              {job.skills?.length > 3 && (
                <span className="text-xs text-[var(--text-tertiary)]">+{job.skills.length - 3}</span>
              )}
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
  )
}
