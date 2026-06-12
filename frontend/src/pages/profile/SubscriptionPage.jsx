import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subscriptionApi } from '../../services/subscriptionApi'
import { PageSpinner } from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import { ArrowLeft, Crown, Zap, AlertTriangle, Calendar } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const TIERS = {
  Free: { color: 'text-gray-600', bg: 'bg-gray-100', name: 'Free' },
  Pro: { color: 'text-purple-600', bg: 'bg-purple-100', name: 'Pro' },
  Premium: { color: 'text-amber-600', bg: 'bg-amber-100', name: 'Premium' },
}

export default function SubscriptionPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionApi.getMySubscription().then((r) => r.data),
  })

  const cancelMutation = useMutation({
    mutationFn: () => subscriptionApi.cancelSubscription(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscription'] }),
  })

  if (isLoading) return <PageSpinner />

  const sub = data?.data?.subscription
  const tier = TIERS[sub?.planId] || TIERS.Free

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 ${tier.bg}`}>
              {sub?.planId === 'Premium' ? (
                <Crown className={`h-6 w-6 ${tier.color}`} />
              ) : (
                <Zap className={`h-6 w-6 ${tier.color}`} />
              )}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{tier.name} Plan</p>
              <p className={`text-sm ${tier.color}`}>
                {sub?.status === 'Active' ? 'Active' : sub?.status}
              </p>
            </div>
          </div>

          {sub?.planId !== 'Free' && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Active
            </span>
          )}
        </div>

        {sub?.currentPeriodEnd && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            {sub.planId === 'Free'
              ? 'No expiration'
              : `Renews on ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`}
          </div>
        )}
      </div>

      {sub?.planId === 'Free' && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-indigo-600" />
            <h2 className="font-semibold text-indigo-800">Free Plan</h2>
          </div>
          <p className="text-sm text-indigo-700">
            Upgrade to Pro or Premium to unlock AI-powered features.
          </p>
          <Button onClick={() => navigate('/plans')}>View Plans</Button>
        </div>
      )}

      {sub?.planId !== 'Free' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="font-semibold text-red-800">Cancel Subscription</h2>
          </div>
          <p className="text-sm text-red-700">
            Your plan will revert to Free at the end of the current billing period.
          </p>
          <Button
            variant="ghost"
            className="text-red-600 hover:bg-red-100"
            onClick={() => {
              if (window.confirm('Are you sure you want to cancel your subscription?')) {
                cancelMutation.mutate()
              }
            }}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Subscription'}
          </Button>
        </div>
      )}

      {cancelMutation.isSuccess && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Your subscription has been cancelled.
        </div>
      )}
    </div>
  )
}
