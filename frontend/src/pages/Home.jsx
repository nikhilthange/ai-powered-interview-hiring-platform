import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { Card, CardContent } from '../components/ui/Card'
import { ArrowRight, Zap, MessageCircle, TrendingUp, Star, Shield, UserCheck, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'AI Resume Analysis',
    description: 'Get instant ATS scores, strength/weakness breakdown, and smart suggestions tailored to each job description.',
    badge: 'New',
  },
  {
    icon: TrendingUp,
    title: 'Skill Gap Analysis',
    description: 'Compare your skills against target roles and get a personalized learning roadmap to bridge the gap.',
  },
  {
    icon: Star,
    title: 'Mock Interviews',
    description: 'Practice with AI-generated questions based on real job descriptions and receive detailed feedback.',
  },
  {
    icon: MessageCircle,
    title: 'Real-Time Chat',
    description: 'Communicate with recruiters instantly through our built-in messaging platform with read receipts.',
  },
  {
    icon: UserCheck,
    title: 'Smart Matching',
    description: 'Our AI matches your profile with the best opportunities, saving you hours of manual searching.',
  },
  {
    icon: Shield,
    title: 'Career Roadmap',
    description: 'Get a phased learning plan with resources and timelines to reach your career goals.',
  },
]

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '5K+', label: 'Jobs Posted' },
  { value: '95%', label: 'Satisfaction Rate' },
  { value: '50K+', label: 'Applications' },
]

const tiers = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    features: ['Browse jobs', '5 applications/month', 'Basic profile', 'Email support'],
  },
  {
    name: 'Pro',
    price: '₹1,499',
    period: '/month',
    features: ['Unlimited applications', 'AI Resume Analysis', 'Skill Gap Analysis', 'Mock Interviews (5/mo)', 'Priority support'],
    popular: true,
  },
  {
    name: 'Premium',
    price: '₹3,899',
    period: '/month',
    features: ['Everything in Pro', 'Unlimited Mock Interviews', 'Career Roadmap', 'Recruiter Chat', 'Phone support'],
  },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-28 lg:py-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.05),transparent_50%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <Badge variant="primary" size="lg" className="mb-6">
            <Sparkles className="h-3.5 w-3.5" /> AI-Powered Hiring Platform
          </Badge>
          <h1 className="text-display-sm sm:text-display-md lg:text-display-lg font-bold text-[var(--text-primary)]">
            Land Your Dream Job with{' '}
            <span className="text-gradient">AI Intelligence</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg text-[var(--text-secondary)]">
            From ATS-optimized resumes to AI mock interviews — get everything you need to
            accelerate your career or find the perfect candidate.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/register">
              <Button size="xl" className="w-full sm:w-auto">
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                Browse Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[var(--border-color)] bg-[var(--bg-primary)] py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-heading-lg font-bold text-[var(--text-primary)]">{stat.value}</p>
                <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-heading-md sm:text-heading-xl font-bold text-[var(--text-primary)]">
            Everything you need to succeed
          </h2>
          <p className="mt-3 text-body-md text-[var(--text-secondary)]">
            AI-powered tools that give you an edge in today's competitive job market.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} hover className="group">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-400)] transition-colors group-hover:scale-110 transition-transform duration-200">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--text-primary)]">{feature.title}</h3>
                    {feature.badge && <Badge variant="primary" size="xs">New</Badge>}
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-heading-md sm:text-heading-xl font-bold text-[var(--text-primary)]">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-body-md text-[var(--text-secondary)]">
              Start free, upgrade when you need more power.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {tiers.map((tier) => (
              <Card key={tier.name} className={`relative ${tier.popular ? 'ring-2 ring-[var(--color-primary-500)]' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="primary" size="md">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{tier.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-[var(--text-primary)]">{tier.price}</span>
                      {tier.period !== 'forever' && (
                        <span className="text-sm text-[var(--text-secondary)]">{tier.period}</span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary-500)]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={tier.name === 'Free' ? '/register' : '/plans'}>
                    <Button
                      variant={tier.popular ? 'primary' : 'outline'}
                      className="w-full"
                    >
                      {tier.name === 'Free' ? 'Get Started' : `Subscribe to ${tier.name}`}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="text-heading-md sm:text-heading-xl font-bold text-[var(--text-primary)]">
          Ready to transform your career?
        </h2>
        <p className="mt-3 text-body-md text-[var(--text-secondary)]">
          Join thousands of professionals who are landing their dream jobs with AI.
        </p>
        <div className="mt-8">
          <Link to="/register">
            <Button size="xl">
              Get Started Free <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
