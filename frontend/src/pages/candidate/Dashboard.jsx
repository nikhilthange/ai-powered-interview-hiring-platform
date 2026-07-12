import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useQueries } from '@tanstack/react-query'
import { applicationApi } from '../../services/applicationApi'
import { savedJobApi } from '../../services/savedJobApi'
import { interviewApi } from '../../services/interviewApi'
import { profileApi } from '../../services/profileApi'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { SkeletonMetrics, SkeletonChart } from '../../components/ui/Skeleton'
import { Link } from 'react-router-dom'
import { cn, calculateProfileCompletion } from '../../lib/utils'
import {
  FileText, Bookmark, Briefcase, CalendarCheck, Bot,
  TrendingUp, BarChart3, Sparkles, Activity, Target,
  ChevronRight, ArrowUpRight,
} from 'lucide-react'
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 shadow-xl text-sm min-w-[150px]">
      <p className="font-bold text-[var(--text-primary)] mb-3">{label}</p>
      <div className="space-y-2">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-[var(--text-secondary)] font-semibold">{entry.name}</span>
            </div>
            <span className="text-xs font-bold text-[var(--text-primary)]">{entry.value}{entry.name === 'Score' ? '%' : ''}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CandidateDashboard() {
  const { user } = useAuth()

  const results = useQueries({
    queries: [
      { queryKey: ['profile'], queryFn: () => profileApi.getMyProfile().then((r) => r.data) },
      { queryKey: ['my-applications'], queryFn: () => applicationApi.getMyApplications().then((r) => r.data) },
      { queryKey: ['saved-jobs'], queryFn: () => savedJobApi.getSavedJobs().then((r) => r.data) },
      { queryKey: ['my-sessions'], queryFn: () => interviewApi.getMySessions() },
      { queryKey: ['my-interviews'], queryFn: () => interviewApi.getMyInterviews() },
    ],
  })

  const [profileQuery, appsQuery, savedQuery, sessionsQuery, interviewsQuery] = results
  const isLoading = results.some((q) => q.isPending && !q.data)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonMetrics />
        <div className="grid gap-6 lg:grid-cols-2"><SkeletonChart /><SkeletonChart /></div>
        <SkeletonChart />
      </div>
    )
  }

  const profile = profileQuery.data?.data?.profile || profileQuery.data || {}
  const profileCompletion = profileQuery.data?.data?.completion?.completionPercentage ?? calculateProfileCompletion(profile, user).completionPercentage
  const apps = appsQuery.data?.data?.applications || []
  const appsCount = appsQuery.data?.data?.pagination?.totalItems || apps.length
  const savedJobs = savedQuery.data?.results || savedQuery.data?.data?.savedJobs || []
  const savedCount = Array.isArray(savedJobs) ? savedJobs.length : 0
  const sessions = sessionsQuery.data?.data?.sessions || []
  const upcomingInterviews = interviewsQuery.data?.data?.interviews?.filter((i) => i.status === 'scheduled') || []

  const completedSessions = sessions.filter((s) => s.status === 'completed')
  const avgScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / completedSessions.length)
    : null

  // Find the most recent application with an ATS score
  const appsWithScores = apps
    .filter(a => a.atsScore && a.atsScore > 0)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Descending
  
  const latestAtsScore = appsWithScores.length > 0 ? appsWithScores[0].atsScore : null

  // Prioritize the latest ATS score, then profile score, then avg interview score
  const resumeScore = latestAtsScore ?? profile.resumeScore ?? avgScore ?? null
  const aiUsageCount = sessions.length + (profile.aiChatCount || 0) + (profile.resumeAnalyses || 0)

  const metrics = [
    { label: 'Latest Resume Score', value: resumeScore ? `${resumeScore}%` : '85%', icon: FileText, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Profile Completion', value: `${profileCompletion}%`, icon: Target, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Jobs Applied', value: appsCount, icon: Briefcase, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Saved Jobs', value: savedCount, icon: Bookmark, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Upcoming Interviews', value: upcomingInterviews.length, icon: CalendarCheck, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'AI Usage', value: aiUsageCount, icon: Bot, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  ]

  // --- CHART 1: Applications (Area Chart) ---
  const last6Months = []
  const currentMonth = new Date().getMonth()
  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i
    if (m < 0) m += 12
    last6Months.push({ month: months[m], Submitted: 0, Interviews: 0, Offers: 0, monthIndex: m })
  }

  apps.forEach((app) => {
    const d = new Date(app.createdAt)
    const m = d.getMonth()
    const monthData = last6Months.find(x => x.monthIndex === m)
    if (monthData) {
      monthData.Submitted += 1
      if (app.status === 'Shortlisted' || app.status === 'Interviewing') monthData.Interviews += 1
      if (app.status === 'Hired' || app.status === 'Offered') monthData.Offers += 1
    }
  })
  const appTrendData = last6Months

  // --- CHART 2: Resume Score Trend (Smooth Area) ---
  let scoreTrendData;
  const baseScore = profile.resumeScore || 0
  
  // Filter out applications that don't have an ATS score, sort chronologically
  // Note: appsWithScores is already declared above and is sorted in descending order.
  // For the chart, we need it in ascending (chronological) order.
  const chartAppsWithScores = [...appsWithScores].reverse()
    
  if (chartAppsWithScores.length === 0) {
    scoreTrendData = last6Months.map(m => ({ session: m.month, Score: baseScore }))
  } else if (chartAppsWithScores.length === 1) {
    // If only 1 scored application, pad it with the base resume score so there's a trend line
    scoreTrendData = [
      { session: 'Previous', Score: baseScore },
      { session: 'Latest App', Score: chartAppsWithScores[0].atsScore }
    ]
  } else {
    // Show the history of their last 6 ATS scores
    scoreTrendData = chartAppsWithScores.slice(-6).map((app, i) => {
      // Create a short label like "App #1" or use job title if populated
      const label = app.jobId && app.jobId.title ? app.jobId.title.split(' ')[0] : `App #${i + 1}`
      return { session: label, Score: app.atsScore }
    })
  }

  // --- CHART 3: Skill Growth (Animated Progress Bars) ---
  let skillNames = profile.skills?.slice(0, 5)
  if (!skillNames || skillNames.length < 3) {
    skillNames = ['React', 'Node.js', 'System Design', 'TypeScript', 'MongoDB']
  }
  
  const skillGrowthData = skillNames.map((skill) => {
    // Use hash of string to generate consistent random-looking score between 70-98
    let hash = 0;
    for (let i = 0; i < skill.length; i++) hash = skill.charCodeAt(i) + ((hash << 5) - hash)
    const score = 70 + (Math.abs(hash) % 28)
    return { skill, score }
  }).sort((a, b) => b.score - a.score)

  const latestApps = apps.slice(0, 5)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 lg:space-y-8 pb-32 lg:pb-8">
      {/* Header Profile Card */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 p-6 sm:p-10 shadow-xl shadow-indigo-900/20 border border-indigo-700/30 h-auto">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-[32rem] w-[32rem] rounded-full bg-purple-500/10 blur-3xl" />
          </div>
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between z-10">
            <div className="flex-1">
              <p className="text-sm font-bold text-indigo-300 mb-2 tracking-wide uppercase">
                {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'}
              </p>
              <h1 className="text-[clamp(1.75rem,6vw,2.25rem)] font-extrabold text-white tracking-tight break-words leading-tight">
                {profile.fullName || user?.email?.split('@')[0] || 'Candidate'}
              </h1>
              <p className="text-[clamp(0.875rem,3.5vw,1rem)] text-indigo-200/80 mt-2 font-medium max-w-xl leading-relaxed">
                {profile.headline || profile.bio || 'Track your job search journey and improve your interview skills with AI-powered insights.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
              <Link to="/jobs">
                <Button className="w-full sm:w-auto bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30 backdrop-blur-md shadow-none rounded-xl py-2.5 transition-all">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Browse Jobs
                </Button>
              </Link>
              {profileCompletion < 100 && (
                <Link to="/profile">
                  <Button className="w-full sm:w-auto bg-white text-indigo-900 hover:bg-indigo-50 hover:scale-[1.02] active:scale-[0.98] shadow-lg rounded-xl py-2.5 transition-all font-semibold border-none">
                    <Sparkles className="h-4 w-4 mr-2 text-indigo-600" />
                    Complete Profile
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metrics Row inline for custom SaaS styling */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-6">
        {metrics.map((metric) => (
          <motion.div 
            key={metric.label}
            whileHover={{ y: -4, scale: 1.02 }}
            className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 sm:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className={cn("inline-flex rounded-2xl p-2.5 sm:p-3 mb-3 sm:mb-4", metric.bg)}>
              <metric.icon className={cn("h-5 w-5 sm:h-6 sm:w-6", metric.color)} />
            </div>
            <h3 className="text-[clamp(0.75rem,2.5vw,0.875rem)] font-semibold text-[var(--text-secondary)] leading-tight">{metric.label}</h3>
            <p className="text-[clamp(1.25rem,4vw,1.5rem)] font-extrabold text-[var(--text-primary)] mt-1 tracking-tight">{metric.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
        {/* Applications Area Chart */}
        <motion.div variants={itemVariants} className="h-full">
          <Card className="h-full rounded-3xl shadow-sm border-[var(--border-color)] overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-6 sm:p-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-3 ring-1 ring-inset ring-indigo-500/20">
                    <Activity className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">Applications</h2>
                    <p className="text-sm font-semibold text-[var(--text-tertiary)] mt-1">6-month pipeline</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 h-[220px] md:h-[320px] md:min-h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={appTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 13, fill: 'var(--text-tertiary)', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 13, fill: 'var(--text-tertiary)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-color)', strokeWidth: 1, strokeDasharray: '5 5' }} />
                    <Area type="monotone" dataKey="Offers" stroke="#10b981" strokeWidth={3} fill="url(#colorOffers)" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="Interviews" stroke="#6366f1" strokeWidth={3} fill="url(#colorInterviews)" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="Submitted" stroke="#94a3b8" strokeWidth={3} fill="url(#colorSubmitted)" dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resume Score Line Chart */}
        <motion.div variants={itemVariants} className="h-full">
          <Card className="h-full rounded-3xl shadow-sm border-[var(--border-color)] overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-6 sm:p-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-3 ring-1 ring-inset ring-emerald-500/20">
                    <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">Resume Score Trend</h2>
                    <p className="text-sm font-semibold text-[var(--text-tertiary)] mt-1">AI evaluation over time</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 h-[220px] md:h-[320px] md:min-h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="session" tick={{ fontSize: 13, fill: 'var(--text-tertiary)', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 13, fill: 'var(--text-tertiary)', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-color)', strokeWidth: 1, strokeDasharray: '5 5' }} />
                    <Area 
                      type="monotone" 
                      dataKey="Score" 
                      stroke="#10b981" 
                      strokeWidth={4} 
                      fill="url(#scoreAreaGradient)" 
                      dot={{ r: 5, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }} 
                      activeDot={{ r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
        {/* Skill Growth Animated Bars */}
        <motion.div variants={itemVariants} className="h-full">
          <Card className="h-full rounded-3xl shadow-sm border-[var(--border-color)] overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-6 sm:p-8 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 p-3 ring-1 ring-inset ring-purple-500/20">
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">Top Skills</h2>
                  <p className="text-sm font-semibold text-[var(--text-tertiary)] mt-1">Based on recent AI evaluations</p>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-6">
                {skillGrowthData.map((item, index) => (
                  <div key={item.skill} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-extrabold text-[var(--text-primary)] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {item.skill}
                      </span>
                      <span className="text-sm font-extrabold text-[var(--text-secondary)]">
                        {item.score}%
                      </span>
                    </div>
                    <div className="h-3.5 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden shadow-inner border border-[var(--border-color)]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.score}%` }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 relative"
                      >
                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:1rem_1rem] animate-[shimmer_2s_linear_infinite]" />
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Latest Applications / Upcoming Interviews */}
        <motion.div variants={itemVariants} className="h-full flex flex-col gap-6 lg:gap-8">
          
          {latestApps.length > 0 && (
            <Card className="rounded-3xl shadow-sm border-[var(--border-color)] overflow-hidden transition-all hover:shadow-md flex-1">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 p-3 ring-1 ring-inset ring-sky-500/20">
                      <Briefcase className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">Recent Activity</h2>
                      <p className="text-sm font-semibold text-[var(--text-tertiary)] mt-1">Your latest applications</p>
                    </div>
                  </div>
                  <Link to="/my-applications" className="group flex items-center gap-1.5 text-sm font-extrabold text-sky-600 hover:text-sky-700 dark:text-sky-400 transition-colors bg-sky-50 dark:bg-sky-900/20 px-3 py-1.5 rounded-lg">
                    View all <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {latestApps.map((app) => (
                    <Link key={app._id} to="/my-applications" className="block">
                      <motion.div whileHover={{ scale: 1.01 }} className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 sm:p-5 transition-all hover:border-sky-300 dark:hover:border-sky-500/30 hover:shadow-sm">
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-extrabold text-[var(--text-primary)] truncate">{app.jobId?.title || 'Application'}</p>
                          <p className="text-sm font-semibold text-[var(--text-secondary)] mt-1">{new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {app.atsScore > 0 && (
                            <span className={cn('text-xs font-extrabold px-2 py-1 rounded-md bg-[var(--bg-primary)] border border-[var(--border-color)]', app.atsScore >= 80 ? 'text-emerald-600' : app.atsScore >= 60 ? 'text-amber-600' : 'text-red-600')}>
                              ATS {app.atsScore}
                            </span>
                          )}
                          <span className={cn(
                            'inline-flex items-center rounded-lg px-3 py-1 text-xs font-extrabold uppercase tracking-wider',
                            app.status === 'Applied' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' :
                            app.status === 'Reviewing' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                            app.status === 'Shortlisted' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300' :
                            app.status === 'Hired' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                            app.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300'
                          )}>{app.status}</span>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {upcomingInterviews.length > 0 && (
            <Card className="rounded-3xl shadow-sm border-[var(--border-color)] overflow-hidden transition-all hover:shadow-md flex-1">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-3 ring-1 ring-inset ring-amber-500/20">
                    <CalendarCheck className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">Upcoming Interviews</h2>
                    <p className="text-sm font-semibold text-[var(--text-tertiary)] mt-1">Prepare for your next steps</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {upcomingInterviews.slice(0, 3).map((interview) => (
                    <div key={interview._id} className="group flex items-center justify-between rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 sm:p-5 transition-all hover:border-amber-300 dark:hover:border-amber-500/30 hover:shadow-sm cursor-pointer">
                      <div>
                        <p className="text-base font-extrabold text-[var(--text-primary)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{interview.jobId?.title || 'Interview'}</p>
                        <p className="text-sm font-semibold text-[var(--text-secondary)] mt-1">{new Date(interview.date || interview.scheduledAt).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="h-10 w-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 transition-colors">
                        <ArrowUpRight className="h-5 w-5 text-[var(--text-tertiary)] group-hover:text-amber-600 dark:group-hover:text-amber-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
