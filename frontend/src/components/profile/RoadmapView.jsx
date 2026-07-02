import { useState } from 'react'
import Badge from '../ui/Badge'
import { cn } from '../../lib/utils'
import { MapPin, CheckCircle, Clock, ChevronDown, BookOpen } from 'lucide-react'

export default function RoadmapView({ existingRoadmap, skills }) {
  const [expanded, setExpanded] = useState(null)
  const roadmap = existingRoadmap
  const milestones = roadmap?.milestones || roadmap?.steps || []

  if (!milestones || milestones.length === 0) {
    return null
  }

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 dark:text-indigo-400">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold text-[var(--text-primary)]">Career Roadmap</h2>
          <p className="text-xs text-[var(--text-tertiary)]">Your personalized career progression plan</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent" />
        <div className="space-y-4">
          {milestones.map((m, i) => {
            const isExpanded = expanded === i
            const isCompleted = m.status === 'completed'
            const isInProgress = m.status === 'in-progress'
            return (
              <div key={i} className="relative pl-10">
                <div className={cn(
                  'absolute left-2.5 top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 text-[8px] font-bold',
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-600'
                    : isInProgress
                    ? 'bg-amber-50 border-amber-400 text-amber-600'
                    : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-tertiary)]'
                )}>
                  {isCompleted ? <CheckCircle className="h-3 w-3" /> : i + 1}
                </div>
                <div
                  onClick={() => setExpanded(isExpanded ? null : i)}
                  className="cursor-pointer rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3.5 hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{m.title || m.name}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{m.description}</p>
                      {m.duration && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <Clock className="h-3 w-3 text-[var(--text-tertiary)]" />
                          <span className="text-[10px] text-[var(--text-tertiary)]">{m.duration}</span>
                        </div>
                      )}
                    </div>
                    <ChevronDown className={cn('h-4 w-4 text-[var(--text-tertiary)] transition-transform shrink-0', isExpanded && 'rotate-180')} />
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-[var(--border-color)] space-y-2">
                      {m.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {m.skills.map((s, j) => (
                            <Badge key={j} variant="primary" size="xs">{s}</Badge>
                          ))}
                        </div>
                      )}
                      {m.resources?.length > 0 && (
                        <div className="space-y-1">
                          {m.resources.map((r, j) => (
                            <div key={j} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                              <BookOpen className="h-3 w-3 shrink-0 text-indigo-500" />
                              <span>{r.title || r}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
