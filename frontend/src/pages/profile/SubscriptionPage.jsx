import { motion } from 'framer-motion'
import { Card, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { CreditCard, Shield, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function SubscriptionPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Link to="/plans" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-2">
          <ChevronRight className="h-4 w-4 rotate-180" /> Back to plans
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] break-words">Subscription</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your subscription and billing details</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">Current Plan</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">You are currently on the Free plan</p>
              </div>
              <Badge variant="primary" size="md">Free</Badge>
            </div>
            <Link to="/plans">
              <Button variant="outline">
                Upgrade Plan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6 space-y-6">
            <h2 className="font-semibold text-[var(--text-primary)]">Payment Method</h2>
            <div className="rounded-xl border-2 border-dashed border-[var(--border-color)] p-6 text-center">
              <CreditCard className="mx-auto h-8 w-8 text-[var(--text-tertiary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No payment method added yet</p>
              <Button variant="outline" size="sm" className="mt-3">Add Payment Method</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-[var(--text-primary)]">Billing History</h2>
            <div className="rounded-xl bg-[var(--bg-secondary)] p-8 text-center">
              <Shield className="mx-auto h-8 w-8 text-[var(--text-tertiary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">No billing history yet</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
