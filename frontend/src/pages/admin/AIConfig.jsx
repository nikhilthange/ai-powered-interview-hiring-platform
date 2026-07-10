import { motion } from 'framer-motion'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../services/adminApi'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import { SkeletonMetrics } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import { Brain, RefreshCw, Activity, Clock, AlertTriangle, CheckCircle, Server, BarChart3 } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 2, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function AIConfig() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [selectedProvider, setSelectedProvider] = useState('')

  const { data: aiConfig, isLoading } = useQuery({
    queryKey: ['ai-config'],
    queryFn: async () => {
      const res = await adminApi.getAiConfig()
      if (!selectedProvider) setSelectedProvider(res.data.provider)
      return res.data
    },
  })

  const updateMutation = useMutation({
    mutationFn: (provider) => adminApi.updateAiConfig(provider),
    onSuccess: (res) => {
      toast({ type: 'success', title: 'AI Provider Updated', message: `Switched to ${res.data.provider}` })
      queryClient.invalidateQueries({ queryKey: ['ai-config'] })
    },
    onError: () => {
      toast({ type: 'error', title: 'Update Failed', message: 'Could not update AI provider.' })
    },
  })

  const resetMutation = useMutation({
    mutationFn: () => adminApi.resetAiMetrics(),
    onSuccess: () => {
      toast({ type: 'success', title: 'Metrics Reset', message: 'AI metrics have been cleared.' })
      queryClient.invalidateQueries({ queryKey: ['ai-config'] })
    },
    onError: () => {
      toast({ type: 'error', title: 'Reset Failed', message: 'Could not reset metrics.' })
    },
  })

  if (isLoading) return <SkeletonMetrics />

  const providerConfig = {
    mock: {
      label: 'Mock AI',
      description: 'Predefined responses, no external API calls. Fast and reliable for development.',
      color: 'amber',
      icon: Brain,
    },
    nvidia: {
      label: 'NVIDIA NIM',
      description: 'Real AI responses via NVIDIA NIM API. Requires valid API key.',
      color: 'emerald',
      icon: Server,
    },
  }

  const current = providerConfig[aiConfig.provider] || providerConfig.mock
  const CurrentIcon = current.icon

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-6 sm:p-8">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-6 w-6 text-white/80" />
              <h1 className="text-xl sm:text-2xl font-bold text-white">AI Configuration</h1>
            </div>
            <p className="text-sm text-white/60">Manage AI provider, view metrics and system status</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants} className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold text-[var(--text-primary)] mb-4">Provider Selection</h2>
              <div className="space-y-4">
                  <Select
                    label="AI Provider"
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    options={[
                      { value: 'mock', label: 'Mock AI' },
                      { value: 'nvidia', label: 'NVIDIA NIM' },
                    ]}
                  />
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CurrentIcon className="h-5 w-5 text-[var(--color-primary-500)]" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">{current.label}</span>
                    <Badge variant={current.color} size="xs">{aiConfig.provider === 'mock' ? 'Active' : aiConfig.hasNvidiaKey ? 'Ready' : 'No API Key'}</Badge>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)]">{current.description}</p>
                  {aiConfig.provider === 'nvidia' && !aiConfig.hasNvidiaKey && (
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> NVIDIA_API_KEY not set in environment.
                    </p>
                  )}

                </div>
                <Button
                  onClick={() => updateMutation.mutate(selectedProvider)}
                  loading={updateMutation.isPending}
                  disabled={selectedProvider === aiConfig.provider}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4" /> Apply Provider
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[var(--text-primary)]">Fallback Behavior</h2>
                <Badge variant="primary" size="xs">Auto</Badge>
              </div>
              <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>NVIDIA API calls automatically retry up to 3 times with exponential backoff.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>On failure: gracefully falls back to realistic mock responses.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Circuit breaker opens after 3 consecutive failures (60s cooldown).</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>All fallbacks are logged with the reason for transparency.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[var(--text-primary)]">AI Status</h2>
                <Badge variant={aiConfig.provider === 'mock' ? 'warning' : 'success'} size="xs">
                  {aiConfig.provider === 'mock' ? 'Mock Mode' : 'NVIDIA Connected'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="h-4 w-4 text-indigo-500" />
                    <span className="text-xs text-[var(--text-tertiary)]">Total Requests</span>
                  </div>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{aiConfig.totalRequests?.toLocaleString() || 0}</p>
                </div>
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-[var(--text-tertiary)]">Total Errors</span>
                  </div>
                  <p className="text-xl font-bold text-[var(--text-primary)]">{aiConfig.totalErrors || 0}</p>
                </div>
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-[var(--text-tertiary)]">Avg Response Time</span>
                  </div>
                  <p className="text-xl font-bold text-[var(--text-primary)]">
                    {aiConfig.averageResponseTime ? `${aiConfig.averageResponseTime}ms` : '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span className="text-xs text-[var(--text-tertiary)]">Last API Call</span>
                  </div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {aiConfig.lastApiCall ? new Date(aiConfig.lastApiCall).toLocaleString() : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[var(--text-primary)]">Last Error</h2>
                {aiConfig.lastError && (
                  <Button variant="ghost" size="sm" onClick={() => resetMutation.mutate()} loading={resetMutation.isPending}>
                    Clear
                  </Button>
                )}
              </div>
              {aiConfig.lastError ? (
                <div className="rounded-xl border border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/30 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-red-700 dark:text-red-400">Error</p>
                      <p className="text-xs text-red-600 dark:text-red-300 mt-1 break-words">{aiConfig.lastError}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  No recent errors
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[var(--text-primary)]">Metrics</h2>
                <Button variant="ghost" size="sm" onClick={() => resetMutation.mutate()} loading={resetMutation.isPending}>
                  <RefreshCw className="h-3 w-3" /> Reset
                </Button>
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">
                Error rate: {aiConfig.totalRequests > 0 ? `${Math.round((aiConfig.totalErrors / aiConfig.totalRequests) * 100)}%` : '—'}
              </p>
              <div className="mt-3 h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${aiConfig.totalRequests > 0 ? Math.min((aiConfig.totalErrors / aiConfig.totalRequests) * 100, 100) : 0}%`,
                    background: aiConfig.totalErrors > 0
                      ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                      : 'linear-gradient(90deg, #10b981, #3b82f6)',
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
