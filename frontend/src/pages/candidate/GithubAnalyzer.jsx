import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { githubApi } from '../../services/githubApi'
import AIStepLoader from '../../components/ui/AIStepLoader'
import CountUp from '../../components/ui/CountUp'
import Badge from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import { cn } from '../../lib/utils'
import {
  Code, Code2, Star, GitFork, Award, CheckCircle2, AlertCircle,
  Sparkles, ExternalLink, RefreshCw, ArrowLeft, Terminal, ShieldCheck
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { staggerContainer, staggerItem } from '../../lib/motion'

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981']

export default function GithubAnalyzer() {
  const { toast } = useToast()
  const shouldReduceMotion = useReducedMotion()

  const [username, setUsername] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!username.trim()) return

    const cleanUser = username.replace('https://github.com/', '').replace('/', '').trim()
    setIsAnalyzing(true)
    setResult(null)

    try {
      const res = await githubApi.analyzeGithubUser(cleanUser)
      setResult(res.data?.data || res.data)
      toast.success(`GitHub profile @${cleanUser} analyzed successfully!`)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to analyze GitHub profile.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : staggerContainer(0.08)}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-8 pb-16"
    >
      {/* Header */}
      <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
          <Code2 className="h-7 w-7 text-indigo-500" /> GitHub Profile Analyzer
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Evaluate project quality, language distribution, and open-source impact with AI.
        </p>
      </motion.div>

      {/* Input Form */}
      {!isAnalyzing && !result && (
        <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
          <Card className="border-[var(--border-color)]">
            <CardContent className="p-6 space-y-4">
              <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Enter GitHub username or URL (e.g. octocat)..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="gradient" disabled={!username.trim()}>
                  <Sparkles className="h-4 w-4" /> Analyze Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stepped AI Loader */}
      {isAnalyzing && (
        <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
          <Card className="border-indigo-200 dark:border-indigo-900/40">
            <AIStepLoader title="HireMate AI is auditing your GitHub repositories & code quality" />
          </Card>
        </motion.div>
      )}

      {/* Analysis Results View */}
      {result && !isAnalyzing && (
        <motion.div variants={shouldReduceMotion ? undefined : staggerContainer(0.08)} initial="hidden" animate="visible" className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setResult(null)}>
              <RefreshCw className="h-3.5 w-3.5" /> Analyze Another
            </Button>
            <a href={`https://github.com/${result.username}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              github.com/{result.username} <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Banner */}
          <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-indigo-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center justify-center h-24 w-24 rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 shrink-0">
                  <span className="text-3xl font-extrabold"><CountUp value={result.codingScore} /></span>
                  <span className="text-[10px] uppercase font-bold text-indigo-200">Coding Score</span>
                </div>
                <div>
                  <Badge variant="primary" size="sm" className="mb-2">Top 5% Developer</Badge>
                  <h2 className="text-2xl font-extrabold text-white">@{result.username}</h2>
                  <p className="text-xs text-indigo-200/80 mt-1">High repository complexity and active contribution frequency.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center w-full sm:w-auto">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-lg font-bold block">{result.totalRepos}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Repos</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-lg font-bold block">{result.totalStars}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Stars</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-lg font-bold block">{result.contributionsThisYear}</span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Commits</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Languages & Top Projects */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
              <Card className="h-full border-[var(--border-color)]">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-indigo-500" /> Language Distribution
                  </h3>
                  <div className="h-[200px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={result.languages} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                          {result.languages.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
              <Card className="h-full border-[var(--border-color)]">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" /> Featured Repositories
                  </h3>
                  <div className="space-y-2">
                    {result.topProjects.map((p, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{p.name}</span>
                          <span className="text-[11px] font-semibold text-[var(--text-tertiary)] flex items-center gap-0.5">
                            <Star className="h-3 w-3 text-amber-500" /> {p.stars}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Audit Suggestions */}
          <motion.div variants={shouldReduceMotion ? undefined : staggerItem}>
            <Card className="border-[var(--border-color)]">
              <CardContent className="p-6 space-y-3">
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" /> AI Code Quality Insights
                </h3>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
