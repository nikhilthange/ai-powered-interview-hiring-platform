import { Link } from 'react-router-dom'
import { MapPin, Briefcase, Clock, IndianRupee } from 'lucide-react'
import Badge from '../ui/Badge'
import { Card, CardContent } from '../ui/Card'

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
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <Link
                to={`/jobs/${job._id}`}
                className="text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--color-primary-600)] transition-colors"
              >
                {job.title}
              </Link>
              <Badge variant={typeColors[job.jobType] || 'default'} size="sm" className="shrink-0">
                {job.jobType}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {job.experienceLevel}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>

            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {job.description}
            </p>

            {job.salaryRange?.min > 0 && (
              <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                <IndianRupee className="h-3.5 w-3.5" />
                <span>
                  {job.salaryRange.min.toLocaleString('en-IN')}
                  {job.salaryRange.max > 0 && ` - ${job.salaryRange.max.toLocaleString('en-IN')}`}
                </span>
              </div>
            )}
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
                className="inline-flex items-center justify-center rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
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
