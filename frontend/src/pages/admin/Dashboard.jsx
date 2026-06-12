import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { SkeletonPage, Skeleton } from '../../components/ui/Skeleton'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { Card, CardContent } from '../../components/ui/Card'
import { Users, Briefcase, FileText, DollarSign, AlertCircle, ArrowRight, CheckCircle, XCircle, Clock, TrendingUp, Activity, Shield, UserCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

const PLAN_PRICES = { Pro: 1500, Premium: 3900 }

function StatCard({ icon: Icon, label, value, sublabel, color }) {
  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className={cn('rounded-xl p-3', color || 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-400)]')}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">{label}</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
            {sublabel && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{sublabel}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
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

  if (analytics.isLoading) return <SkeletonPage />
  if (analytics.isError) {
    return (
      <div className="space-y-6 page-section">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-[var(--color-error)] mb-4" />
            <p className="text-lg font-medium text-[var(--text-primary)]">Failed to load analytics</p>
            <button onClick={() => analytics.refetch()} className="mt-4 text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors">
              Try Again
            </button>
          </CardContent>
        </Card>
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-primary-600)] via-[var(--color-primary-500)] to-[var(--color-primary-700)] p-6 sm:p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white" />
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80 mb-1">Admin Dashboard</p>
            <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
            <p className="text-sm text-white/70 mt-1">System analytics and management</p>
          </div>
          <Link to="/admin/users">
            <Button className="bg-white text-[var(--color-primary-700)] hover:bg-white/90 shadow-none">
              <Users className="h-4 w-4" />
              Manage Users
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={totalUsers} sublabel="Across all roles" color="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" />
        <StatCard icon={Briefcase} label="Total Jobs" value={totalJobs} sublabel={`${jobData['Active'] || 0} active`} color="bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400" />
        <StatCard icon={FileText} label="Applications" value={totalApps} sublabel="All time" color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" />
        <StatCard icon={DollarSign} label="Monthly Revenue" value={`₹${monthlyRevenue.toLocaleString()}`} sublabel="From subscriptions" color="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {['candidate', 'recruiter', 'admin'].map((role) => (
          <Card key={role}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[var(--text-secondary)] capitalize">{role}s</p>
                <UserCheck className="h-4 w-4 text-[var(--text-tertiary)]" />
              </div>
              <p className="text-xl font-bold text-[var(--text-primary)] mt-1">{userData[role] || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-2 dark:from-blue-950 dark:to-blue-900">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Applications by Stage</h2>
                <p className="text-xs text-[var(--text-tertiary)]">Pipeline distribution</p>
              </div>
            </div>
            <div className="space-y-3">
              {['Applied', 'Reviewing', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired'].map((stage) => {
                const stageData = appData.find((a) => a.stage === stage)
                const count = stageData?.count || 0
                const avg = stageData?.averageAtsScore
                const maxCount = Math.max(...appData.map((a) => a.count), 1)
                const pct = (count / maxCount) * 100
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-[var(--text-secondary)] shrink-0">{stage}</span>
                    <div className="flex-1">
                      <div className="h-2.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary-400)] to-[var(--color-primary-600)] transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-12 text-right text-sm font-medium text-[var(--text-primary)] shrink-0">{count}</span>
                    {avg && <span className="w-20 text-right text-xs text-[var(--text-tertiary)] shrink-0">ATS: {avg}</span>}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-2 dark:from-emerald-950 dark:to-emerald-900">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Active Subscriptions</h2>
                <p className="text-xs text-[var(--text-tertiary)]">Revenue breakdown by plan</p>
              </div>
            </div>
            <div className="space-y-3">
              {['Free', 'Pro', 'Premium'].map((plan) => {
                const planData = revenueData.find((r) => r.plan === plan)
                const count = planData?.activeSubscribers || 0
                const totalSubs = revenueData.reduce((s, r) => s + r.activeSubscribers, 0)
                const pct = totalSubs > 0 ? (count / totalSubs) * 100 : 0
                return (
                  <div key={plan} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-[var(--text-secondary)] shrink-0">{plan}</span>
                    <div className="flex-1">
                      <div className="h-3 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary-400)] to-[var(--color-primary-600)] transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-12 text-right text-sm font-medium text-[var(--text-primary)] shrink-0">{count}</span>
                    {plan !== 'Free' && (
                      <span className="w-24 text-right text-xs text-[var(--text-tertiary)] shrink-0">
                        ₹{(count * (PLAN_PRICES[plan] || 0)).toLocaleString()}/mo
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-2 dark:from-amber-950 dark:to-amber-900">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Recruiter Verification Queue</h2>
              <p className="text-xs text-[var(--text-tertiary)]">Pending verification requests</p>
            </div>
            {unverifiedRecruiters.isLoading && (
              <Clock className="ml-auto h-4 w-4 animate-spin text-[var(--text-tertiary)]" />
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
            <p className="text-sm text-[var(--color-error)]">Failed to load verification requests.</p>
          ) : unverifiedRecruiters.data?.data?.recruiters?.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-[var(--color-success)] mb-3" />
              <p className="text-sm text-[var(--text-secondary)]">All recruiters are verified.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(unverifiedRecruiters.data?.data?.recruiters || []).map((r) => (
                <div key={r._id} className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 transition-all card-hover-effect">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 text-xs font-bold">
                        {(r.name || 'R').charAt(0)}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{r.name || r.email}</p>
                        <p className="text-xs text-[var(--text-tertiary)] truncate">{r.companyName} &middot; {r.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2 ml-3">
                    <button
                      onClick={() => verifyMutation.mutate(r._id)}
                      disabled={verifyMutation.isPending}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 disabled:opacity-50 transition-colors"
                      aria-label={`Verify ${r.name || r.email}`}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Verify
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(r._id)}
                      disabled={rejectMutation.isPending}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 disabled:opacity-50 transition-colors"
                      aria-label={`Reject ${r.name || r.email}`}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-2 dark:from-purple-950 dark:to-purple-900">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">Quick Links</h2>
              <p className="text-xs text-[var(--text-tertiary)]">Administrative tools</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link to="/admin/users" className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 card-hover-effect group">
              <span className="text-sm font-medium text-[var(--text-primary)]">User Management</span>
              <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--color-primary-500)] transition-colors" />
            </Link>
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 opacity-50">
              <span className="text-sm font-medium text-[var(--text-tertiary)]">Reports (Coming Soon)</span>
            </div>
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 opacity-50">
              <span className="text-sm font-medium text-[var(--text-tertiary)]">Settings (Coming Soon)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
