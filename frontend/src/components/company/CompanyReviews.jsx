import { useState } from 'react'
import { Card, CardContent } from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import { useToast } from '../ui/Toast'
import { Star, MessageSquare, Plus, CheckCircle2, User, ShieldCheck } from 'lucide-react'

export default function CompanyReviews({ companyName = 'Company' }) {
  const { toast } = useToast()
  const [openModal, setOpenModal] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')

  const [reviews, setReviews] = useState([
    {
      id: 1,
      title: 'Outstanding Work Culture & Fast Growth',
      rating: 4.8,
      author: 'Senior Frontend Engineer (Current Employee)',
      date: '2 weeks ago',
      metrics: { culture: 5, salary: 4.5, growth: 5, management: 4.8, workLife: 4.5 },
      comment: 'Great team, strong engineering autonomy, and modern tech stack. Leadership genuinely values employee growth.'
    },
    {
      id: 2,
      title: 'Fair Interview Process with Great Feedback',
      rating: 4.5,
      author: 'Anonymous Candidate',
      date: '1 month ago',
      metrics: { culture: 4.5, salary: 4.5, growth: 4.5, management: 4.5, workLife: 4.5 },
      comment: 'The AI mock interview and recruiter follow-ups were extremely fast and transparent.'
    }
  ])

  const handleAddReview = (e) => {
    e.preventDefault()
    if (!title || !comment) return

    const newRev = {
      id: Date.now(),
      title,
      rating,
      author: isAnonymous ? 'Anonymous Reviewer' : 'Verified Employee',
      date: 'Just now',
      metrics: { culture: rating, salary: rating, growth: rating, management: rating, workLife: rating },
      comment
    }

    setReviews([newRev, ...reviews])
    setTitle('')
    setComment('')
    setOpenModal(false)
    toast.success('Review submitted successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="border-[var(--border-color)]">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center justify-center h-20 w-20 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400">
                <span className="text-2xl font-extrabold">4.7</span>
                <div className="flex text-amber-500 text-[10px]">★★★★★</div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{companyName} Reviews</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">Based on verified employee & candidate feedback.</p>
              </div>
            </div>

            <Button variant="gradient" size="sm" onClick={() => setOpenModal(true)}>
              <Plus className="h-4 w-4" /> Leave a Review
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-[var(--border-color)] text-center">
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">Culture</span>
              <span className="text-xs font-semibold text-amber-500">4.8 ★</span>
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">Salary</span>
              <span className="text-xs font-semibold text-amber-500">4.6 ★</span>
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">Growth</span>
              <span className="text-xs font-semibold text-amber-500">4.9 ★</span>
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">Management</span>
              <span className="text-xs font-semibold text-amber-500">4.7 ★</span>
            </div>
            <div>
              <span className="text-xs font-bold text-[var(--text-primary)] block">Work-Life</span>
              <span className="text-xs font-semibold text-amber-500">4.5 ★</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <Card key={rev.id} className="border-[var(--border-color)]">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">{rev.title}</h4>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{rev.author} • {rev.date}</p>
                </div>
                <Badge variant="warning" size="sm">
                  ★ {rev.rating}
                </Badge>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{rev.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Review Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)} title={`Review ${companyName}`} size="md">
        <form onSubmit={handleAddReview} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Headline</label>
            <Input placeholder="e.g. Great engineering culture..." value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Overall Rating (1-5)</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3 text-xs text-[var(--text-primary)]"
            >
              <option value={5}>5 Stars - Outstanding</option>
              <option value={4}>4 Stars - Very Good</option>
              <option value={3}>3 Stars - Average</option>
              <option value={2}>2 Stars - Needs Improvement</option>
              <option value={1}>1 Star - Poor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Review Comments</label>
            <Textarea rows={4} placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} required />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="anon" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="rounded" />
            <label htmlFor="anon" className="text-xs text-[var(--text-secondary)] font-medium">Post anonymously</label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" variant="gradient">Submit Review</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
