import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Card, CardContent } from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { cn } from '../../lib/utils'
import {
  FileText, Calendar, Building2, MapPin, ChevronRight,
  MoreVertical, CheckCircle2, XCircle, Clock, UserCheck
} from 'lucide-react'
import { Link } from 'react-router-dom'

const KANBAN_STAGES = [
  { id: 'Applied', name: 'Applied', color: 'border-blue-500/40 bg-blue-500/5 text-blue-600 dark:text-blue-400' },
  { id: 'Reviewing', name: 'Under Review', color: 'border-purple-500/40 bg-purple-500/5 text-purple-600 dark:text-purple-400' },
  { id: 'Interview Scheduled', name: 'Interview Scheduled', color: 'border-amber-500/40 bg-amber-500/5 text-amber-600 dark:text-amber-400' },
  { id: 'Technical Round', name: 'Technical Round', color: 'border-cyan-500/40 bg-cyan-500/5 text-cyan-600 dark:text-cyan-400' },
  { id: 'HR Round', name: 'HR Round', color: 'border-indigo-500/40 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400' },
  { id: 'Offered', name: 'Offer', color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' },
  { id: 'Rejected', name: 'Rejected', color: 'border-red-500/40 bg-red-500/5 text-red-600 dark:text-red-400' },
]

export default function KanbanBoard({ applications = [], onStageChange, isRecruiter = false }) {
  const shouldReduceMotion = useReducedMotion()

  const getStageApps = (stageId) => {
    return applications.filter((app) => {
      const status = app.status || 'Applied'
      if (stageId === 'Reviewing') return status === 'Reviewing' || status === 'Shortlisted'
      if (stageId === 'Offered') return status === 'Offered' || status === 'Hired'
      return status === stageId
    })
  }

  return (
    <div className="w-full overflow-x-auto pb-6 scrollbar-thin">
      <div className="flex gap-4 min-w-[1400px]">
        {KANBAN_STAGES.map((stage) => {
          const stageApps = getStageApps(stage.id)

          return (
            <div key={stage.id} className="w-[280px] shrink-0 flex flex-col rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-3">
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-1.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className={cn('h-2.5 w-2.5 rounded-full border', stage.color.split(' ')[0])} />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{stage.name}</h3>
                </div>
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-1.5 text-[11px] font-extrabold text-[var(--text-secondary)]">
                  {stageApps.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="flex-1 space-y-3 min-h-[350px]">
                {stageApps.length === 0 ? (
                  <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-[var(--border-color)] p-4 text-center">
                    <p className="text-xs text-[var(--text-tertiary)]">No applications</p>
                  </div>
                ) : (
                  stageApps.map((app) => (
                    <motion.div
                      key={app._id}
                      layout={!shouldReduceMotion}
                      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                            {app.jobId?.title || app.candidateId?.name || 'Application'}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                            {app.companyId?.name || app.candidateId?.email || 'Company'}
                          </p>
                        </div>
                        {app.atsScore > 0 && (
                          <span className={cn('text-[10px] font-extrabold px-1.5 py-0.5 rounded border shrink-0', app.atsScore >= 80 ? 'text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' : 'text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30')}>
                            ATS {app.atsScore}%
                          </span>
                        )}
                      </div>

                      {app.jobId?.location && (
                        <div className="flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{app.jobId.location}</span>
                        </div>
                      )}

                      {/* Recruiter Stage Selector Quick Action */}
                      {isRecruiter && onStageChange && (
                        <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between">
                          <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-semibold">Move Stage</span>
                          <select
                            value={app.status || 'Applied'}
                            onChange={(e) => onStageChange(app._id, e.target.value)}
                            className="text-xs bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-lg px-2 py-1 text-[var(--text-primary)] focus:outline-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {KANBAN_STAGES.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
