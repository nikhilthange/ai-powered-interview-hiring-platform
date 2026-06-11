import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { subscriptionApi } from '../../services/subscriptionApi'
import Button from '../../components/ui/Button'
import { PageSpinner } from '../../components/ui/Spinner'
import { ArrowLeft, Check, Zap, Crown } from 'lucide-react'
import { Link } from 'react-router-dom'

const PLANS = [
  {
    id: 'Free',
    name: 'Free',
    price: 0,
    currency: 'INR',
    features: [
      'Basic job search',
      'Apply to 5 jobs/month',
      'Basic profile',
      'Email support',
    ],
    icon: Check,
  },
  {
    id: 'Pro',
    name: 'Pro',
    price: 1500,
    currency: 'INR',
    features: [
      'Unlimited job applications',
      'AI Resume Analysis',
      'Skill Gap Analysis',
      'Mock Interview (5/mo)',
      'Priority email support',
    ],
    icon: Zap,
    popular: true,
  },
  {
    id: 'Premium',
    name: 'Premium',
    price: 3900,
    currency: 'INR',
    features: [
      'Everything in Pro',
      'Unlimited Mock Interviews',
      'Career Roadmap',
      'Real-time Chat with recruiters',
      'Priority phone & email support',
    ],
    icon: Crown,
  },
]

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function PlansPage() {
  const [loadingPlan, setLoadingPlan] = useState(null)

  const orderMutation = useMutation({
    mutationFn: (planId) => subscriptionApi.createOrder(planId).then((r) => r.data),
  })

  const verifyMutation = useMutation({
    mutationFn: (data) => subscriptionApi.verifyPayment(data).then((r) => r.data),
  })

  const handleSubscribe = async (planId) => {
    setLoadingPlan(planId)

    try {
      const ready = await loadRazorpayScript()
      if (!ready) {
        alert('Failed to load payment gateway. Please try again.')
        setLoadingPlan(null)
        return
      }

      const orderRes = await orderMutation.mutateAsync(planId)
      const { orderId, amount, currency, keyId } = orderRes.data

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'AI-Powered Interview',
        description: `${planId} Plan Subscription`,
        order_id: orderId,
        handler: async (response) => {
          await verifyMutation.mutateAsync({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            planId,
          })
        },
        modal: {
          ondismiss: () => setLoadingPlan(null),
        },
        theme: { color: '#4f46e5' },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => setLoadingPlan(null))
      rzp.open()
    } catch (err) {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="mt-2 text-gray-500">Upgrade to unlock AI-powered features and boost your career.</p>
      </div>

      {verifyMutation.isSuccess && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center text-sm text-green-700">
          {verifyMutation.data?.message || 'Payment successful! Your plan has been upgraded.'}
        </div>
      )}

      {verifyMutation.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
          {verifyMutation.error?.response?.data?.message || 'Payment verification failed.'}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          const isLoading = loadingPlan === plan.id && orderMutation.isPending

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
                plan.popular ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}

              <div className="mb-4 flex items-center gap-2">
                <Icon className={`h-6 w-6 ${plan.popular ? 'text-indigo-600' : 'text-gray-600'}`} />
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString()}`}
                </span>
                {plan.price > 0 && <span className="text-sm text-gray-500">/month</span>}
              </div>

              <ul className="mb-6 space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan.id !== 'Free' && (
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : `Subscribe to ${plan.name}`}
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
