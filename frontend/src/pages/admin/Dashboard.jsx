import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { PageSpinner } from '../../components/ui/Spinner'
import { Skeleton } from '../../components/ui/Skeleton'
import { Users, Briefcase, FileText, DollarSign, AlertCircle, ArrowRight, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

const PLAN_PRICES = { Pro: 1500, Premium: 3900 }

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-5 sm:p-6 flex items-center gap-4">
      <div className="rounded-lg bg-[var(--color-primary-50)] p-3 text-[var(--color-primary-600)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-400)]">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-[var(--text-secondary)]">{label}</p>
        <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const analytics = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics(),
  })

  const unverifiedRecruiters = useQuery({
    queryKey: ['unverified-recruiters'],
    queryFn: () => adminApi.getUnverifiedRecruiters(),
  })

  const queryClient = useQueryClient()

  const verifyMutation = useMutation({
    mutationFn: (id) => adminApi.verifyRecruiter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unverified-recruiters'] })
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id) => adminApi.rejectRecruiter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unverified-recruiters'] })
    },
  })

  if (analytics.isLoading) return <PageSpinner />
  if (analytics.isError) {
    return (
      <div className="space-y-6 page-section">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950">
          <AlertCircle className="mx-auto h-8 w-8 text-red-400" />
          <p className="mt-2 text-red-700 dark:text-red-300">Failed to load analytics.</p>
          <button onClick={() => analytics.refetch()} className="mt-4 text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const stats = analytics.data?.data || {}
  const userData = stats.users?.reduce((acc, u) => { acc[u.role] = u.count; return acc }, {}) || {}
  const jobData = stats.jobs?.reduce((acc, j) => { acc[j.status] = j.count; return acc }, {}) || {}
  const appData = stats.applications || []
  const revenueData = stats.revenue || []

  const totalUsers = Object.values(userData).reduce((a, b) => a + b, 0)
  const totalJobs = Object.values(jobData).reduce((a, b) => a + b, 0)
  const totalApps = appData.reduce((a, b) => a + b.count, 0)
  const monthlyRevenue = revenueData
    .filter((r) => r.plan !== 'Free')
    .reduce((sum, r) => sum + (r.activeSubscribers * (PLAN_PRICES[r.plan] || 0)), 0)

  return (
    <div className="space-y-6 page-section">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)]">Platform overview and analytics</p>
        </div>
        <Link to="/admin/users">
          <Button variant="outline" icon={Users} size="sm">Manage Users</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={totalUsers} />
        <StatCard icon={Briefcase} label="Total Jobs" value={totalJobs} />
        <StatCard icon={FileText} label="Applications" value={totalApps} />
        <StatCard icon={DollarSign} label="Monthly Revenue" value={`₹${monthlyRevenue.toLocaleString()}`} />
      </div>

      {/* Users by role */}
      <div className="grid gap-4 sm:grid-cols-3">
        {['candidate', 'recruiter', 'admin'].map((role) => (
          <div key={role} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
            <p className="text-sm text-[var(--text-secondary)] capitalize">{role}s</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{userData[role] || 0}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Applications by stage */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6">
          <h2 className="mb-4 font-semibold text-[var(--text-primary)]">Applications by Stage</h2>
          <div className="space-y-3">
            {['Applied', 'Reviewing', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired'].map((stage) => {
              const stageData = appData.find((a) => a.stage === stage)
              const count = stageData?.count || 0
              const avg = stageData?.averageAtsScore
              const maxCount = Math.max(...appData.map((a) => a.count), 1)
              const pct = (count / maxCount) * 100
              return (
                <div key={stage} className="flex items-center gap-4">
                  <span className="w-24 text-sm text-[var(--text-secondary)]">{stage}</span>
                  <div className="flex-1">
                    <div className="h-3 rounded-full bg-[var(--bg-tertiary)]">
                      <div className="h-3 rounded-full bg-[var(--color-primary-500)] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="w-16 text-right text-sm font-medium text-[var(--text-primary)]">{count}</span>
                  {avg && <span className="w-20 text-right text-xs text-[var(--text-tertiary)]">ATS avg: {avg}</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6">
          <h2 className="mb-4 font-semibold text-[var(--text-primary)]">Active Subscriptions</h2>
          <div className="space-y-3">
            {['Free', 'Pro', 'Premium'].map((plan) => {
              const planData = revenueData.find((r) => r.plan === plan)
              const count = planData?.activeSubscribers || 0
              const totalSubs = revenueData.reduce((s, r) => s + r.activeSubscribers, 0)
              const pct = totalSubs > 0 ? (count / totalSubs) * 100 : 0
              return (
                <div key={plan} className="flex items-center gap-4">
                  <span className="w-20 text-sm text-[var(--text-secondary)]">{plan}</span>
                  <div className="flex-1">
                    <div className="h-4 rounded-full bg-[var(--bg-tertiary)]">
                      <div className="h-4 rounded-full bg-[var(--color-primary-500)] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="w-16 text-right text-sm font-medium text-[var(--text-primary)]">{count}</span>
                  {plan !== 'Free' && (
                    <span className="w-24 text-right text-xs text-[var(--text-tertiary)]">
                      ₹{(count * (PLAN_PRICES[plan] || 0)).toLocaleString()}/mo
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recruiter Verification Queue */}
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Recruiter Verification Queue</h2>
          {unverifiedRecruiters.isLoading && (
            <Clock className="h-4 w-4 animate-spin text-[var(--text-tertiary)]" />
          )}
        </div>
        {unverifiedRecruiters.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-7 w-16 rounded-lg" />
                <Skeleton className="h-7 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        ) : unverifiedRecruiters.isError ? (
          <p className="text-sm text-red-500">Failed to load.</p>
        ) : unverifiedRecruiters.data?.data?.recruiters?.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)]">All recruiters are verified.</p>
        ) : (
          <div className="space-y-3">
            {(unverifiedRecruiters.data?.data?.recruiters || []).map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{r.name || r.email}</p>
                  <p className="text-xs text-[var(--text-tertiary)] truncate">{r.companyName} &middot; {r.email}</p>
                </div>
                <div className="flex shrink-0 gap-2 ml-3">
                  <button
                    onClick={() => verifyMutation.mutate(r._id)}
                    disabled={verifyMutation.isPending}
                    className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 disabled:opacity-50"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Verify
                  </button>
                  <button
                    onClick={() => rejectMutation.mutate(r._id)}
                    disabled={rejectMutation.isPending}
                    className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent users summary — link to full management */}
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Quick Links</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link to="/admin/users" className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 hover:border-[var(--color-primary-200)] transition-all">
            <span className="text-sm font-medium text-[var(--text-primary)]">User Management</span>
            <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)]" />
          </Link>
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 opacity-50">
            <span className="text-sm font-medium text-[var(--text-tertiary)]">Reports (Coming Soon)</span>
          </div>
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 opacity-50">
            <span className="text-sm font-medium text-[var(--text-tertiary)]">Settings (Coming Soon)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
