import { motion } from 'framer-motion'
import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { applicationApi } from '../../services/applicationApi'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { SkeletonList } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'
import {
  ArrowLeft, Users, Star, Clock, FileText, CheckCircle, MessageCircle,
  Sparkles, Brain, Trophy, Mail, XCircle, RefreshCw
} from 'lucide-react'
import {
  SummarizeResumeModal, CompareCandidatesModal, RankApplicantsModal,
  EmailInvitationModal, RejectionEmailModal
} from '../../components/recruiter/RecruiterAIActions'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
}

const statuses = ['All', 'Applied', 'Reviewing', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired']

export default function RecruiterJobApplications() {
  const { jobId } = useParams()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('All')
  const [selectedApps, setSelectedApps] = useState([])

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: () => applicationApi.getJobApplications(jobId).then((r) => r.data),
  })

  const toggleSelect = (id) => {
    setSelectedApps((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedApps.length === filtered.length) {
      setSelectedApps([])
    } else {
      setSelectedApps(filtered.map((a) => a._id))
    }
  }

  if (isLoading) return (
    <div className="space-y-6">
      <SkeletonList count={5} />
    </div>
  )

  const applications = data?.data?.applications || []
  const filtered = activeTab === 'All' ? applications : applications.filter((a) => a.status === activeTab)

  const jobTitle = applications[0]?.jobId?.title || 'this position'
  const companyName = user?.name || 'Our Company'

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Link to="/recruiter/my-jobs" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to my jobs
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">Applications</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{applications.length} total applications</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <RankApplicantsModal jobId={jobId} buttonProps={{ size: 'sm' }} />
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-3 w-3" /> Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex overflow-x-auto gap-1 pb-2 -mx-3 sm:-mx-4 px-3 sm:px-4 lg:mx-0 lg:px-0 scrollbar-none">
        {statuses.map((status) => {
          const count = status === 'All' ? applications.length : applications.filter((a) => a.status === status).length
          return (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={cn(
                'whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all shrink-0',
                activeTab === status
                  ? 'bg-[var(--color-primary-500)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
              )}
            >
              {status}
              <span className={cn(
                'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                activeTab === status ? 'bg-white/20 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </motion.div>

      {filtered.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/30">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span className="text-xs font-medium text-[var(--text-secondary)] mr-1">AI Tools:</span>
          <SummarizeResumeModal
            applicationId={selectedApps[0] || filtered[0]?._id}
            buttonProps={{ size: 'xs', disabled: !selectedApps[0] && !filtered[0] }}
          />
          <CompareCandidatesModal
            jobId={jobId}
            candidateIds={selectedApps.length > 0 ? selectedApps : filtered.slice(0, 2).map((a) => a._id)}
            buttonProps={{ size: 'xs' }}
          />
          <div className="w-px h-5 bg-[var(--border-color)] mx-1" />
          <EmailInvitationModal
            candidateName={filtered.find((a) => a._id === selectedApps[0])?.candidateId?.name || ''}
            jobTitle={jobTitle}
            companyName={companyName}
            buttonProps={{ size: 'xs', disabled: !selectedApps[0] }}
          />
          <RejectionEmailModal
            candidateName={filtered.find((a) => a._id === selectedApps[0])?.candidateId?.name || ''}
            jobTitle={jobTitle}
            companyName={companyName}
            buttonProps={{ size: 'xs', disabled: !selectedApps[0] }}
          />
        </motion.div>
      )}

      {filtered.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState icon={Users} title="No applications found" />
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              checked={selectedApps.length === filtered.length && filtered.length > 0}
              onChange={toggleSelectAll}
              className="rounded border-[var(--border-color)] text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs text-[var(--text-secondary)]">
              {selectedApps.length > 0 ? `${selectedApps.length} selected` : 'Select all'}
            </span>
          </div>
          {filtered.map((app) => (
            <motion.div key={app._id} variants={itemVariants}>
              <Card className={cn(selectedApps.includes(app._id) && 'ring-2 ring-indigo-400/50')}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedApps.includes(app._id)}
                      onChange={() => toggleSelect(app._id)}
                      className="mt-1 rounded border-[var(--border-color)] text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-600 dark:text-indigo-400 font-semibold text-lg">
                      {app.candidateId?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-[var(--text-primary)]">{app.candidateId?.name || 'Anonymous'}</h3>
                          <p className="text-sm text-[var(--text-secondary)]">{app.candidateId?.email}</p>
                        </div>
                        <Badge variant={app.status === 'Applied' ? 'primary' : app.status === 'Shortlisted' ? 'success' : app.status === 'Rejected' ? 'danger' : 'default'} size="sm">
                          {app.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {app.candidateId?.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {app.candidateId.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="primary" size="xs">{skill}</Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                          <Clock className="h-3 w-3" />
                          {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                        {app.atsScore > 0 && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Star className="h-3 w-3 text-amber-500" />
                            <span className="font-medium">ATS {app.atsScore}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <SummarizeResumeModal
                          applicationId={app._id}
                          buttonProps={{ size: 'xs' }}
                        />
                        <Button size="xs" variant="outline">
                          <MessageCircle className="h-3 w-3" />
                          Message
                        </Button>
                        {app.status !== 'Rejected' && (
                          <Button size="xs" variant="primary">
                            <CheckCircle className="h-3 w-3" />
                            Shortlist
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
