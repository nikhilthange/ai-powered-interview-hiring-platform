import { motion } from 'framer-motion'
import { useState } from 'react'
import { Card, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { cn } from '../../lib/utils'
import { CheckCircle, Zap, Star, Crown, ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with basic features',
    features: [
      'Basic resume analysis',
      '5 job applications/month',
      '1 mock interview/month',
      'Basic skill gap analysis',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
    gradient: 'from-slate-500 to-slate-600',
    icon: Zap,
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'For serious job seekers',
    features: [
      'Advanced resume analysis',
      'Unlimited job applications',
      'Unlimited mock interviews',
      'Detailed skill gap analysis',
      'Career roadmap generation',
      'Priority email support',
      'ATS score tracking',
    ],
    cta: 'Start Free Trial',
    popular: true,
    gradient: 'from-indigo-500 to-purple-600',
    icon: Sparkles,
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: 'per month',
    description: 'For career professionals',
    features: [
      'Everything in Pro',
      'AI-powered interview coaching',
      'Personalized career roadmap',
      '1-on-1 career counseling',
      'Resume review by experts',
      'Priority chat support',
      'Certificate of completion',
    ],
    cta: 'Contact Sales',
    popular: false,
    gradient: 'from-amber-500 to-orange-600',
    icon: Crown,
  },
]

export default function PlansPage() {
  const [billing, setBilling] = useState('monthly')

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 ring-1 ring-indigo-200/50 dark:ring-indigo-800/30"
        >
          <Sparkles className="h-7 w-7 text-indigo-600" />
        </motion.div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Pricing Plans</h1>
        <p className="text-[var(--text-secondary)] mt-2 max-w-lg mx-auto">
          Choose the perfect plan to accelerate your career journey
        </p>
        <div className="inline-flex items-center gap-1 mt-6 p-1 rounded-xl bg-[var(--bg-tertiary)]">
          <button
            onClick={() => setBilling('monthly')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all',
              billing === 'monthly' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all',
              billing === 'annual' ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'
            )}
          >
            Annual <Badge variant="success" size="xs" pulse>Save 20%</Badge>
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon
          return (
            <Card key={plan.name} className={cn(
              'relative flex flex-col',
              plan.popular && 'ring-2 ring-indigo-500 shadow-lg sm:scale-[1.02] z-10'
            )}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="primary" size="md" pulse>
                    <Star className="h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardContent className="p-6 space-y-6 flex flex-col flex-1">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br', plan.gradient, 'text-white shadow-sm')}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{plan.name}</h3>
                      <p className="text-xs text-[var(--text-tertiary)]">{plan.description}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-4xl font-bold text-[var(--text-primary)]">
                    {billing === 'annual' && plan.price !== '$0' ? `$${Math.round(parseInt(plan.price.slice(1)) * 12 * 0.8)}` : plan.price}
                  </span>
                  <span className="text-sm text-[var(--text-tertiary)] ml-1">/{plan.period}</span>
                </div>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to="/subscription" className="block w-full">
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'gradient' : 'outline'}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
