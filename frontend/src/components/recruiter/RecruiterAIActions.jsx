import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { recruiterAiApi } from '../../services/recruiterAiApi'
import { useToast } from '../ui/Toast'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { Sparkles, Loader2, Copy, Check } from 'lucide-react'

const actionIcons = {
  'Generate Job Description': '📝',
  'Interview Questions': '❓',
  'Summarize Resume': '📄',
  'Compare Candidates': '⚖️',
  'Rank Applicants': '🏆',
  'Suggest Salary': '💰',
  'Email Invitation': '✉️',
  'Rejection Email': '📧',
  'Technical Assignment': '📋',
}

export function AIActionButton({ label, onClick, loading, size = 'xs', variant = 'outline' }) {
  return (
    <Button size={size} variant={variant} onClick={onClick} loading={loading} title={label}>
      <Sparkles className="h-3 w-3 text-indigo-500" />
      {label}
    </Button>
  )
}

export function ModalContent({ data, loading, error, onCopy }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm text-[var(--text-secondary)]">AI is working on this...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="py-8 text-center text-sm text-[var(--text-tertiary)]">
        No data available yet.
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      <div className="flex gap-2 justify-end sticky top-0 bg-[var(--bg-primary)] pb-2">
        <Button size="xs" variant="ghost" onClick={onCopy}>
          <Copy className="h-3 w-3" />
          Copy
        </Button>
      </div>
      <pre className="whitespace-pre-wrap text-sm text-[var(--text-primary)] font-sans leading-relaxed">
        {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

export function useAIAction(apiFn, onSuccess) {
  const { toast } = useToast()

  return useMutation({
    mutationFn: apiFn,
    onSuccess: (result) => {
      toast.success('AI analysis complete!')
      onSuccess?.(result)
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err.message || 'AI request failed.')
    },
  })
}

export function GenerateJDAction({ onGenerated, buttonProps = {} }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [result, setResult] = useState(null)

  const mutation = useMutation({
    mutationFn: recruiterAiApi.generateJobDescription,
    onSuccess: (data) => {
      setResult(data?.data)
      setModalOpen(true)
      onGenerated?.(data?.data)
    },
  })

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2))
      toast.success('Copied to clipboard!')
    }
  }

  const { toast } = useToast()

  const handleClick = () => {
    if (!buttonProps.title || !buttonProps.title.trim()) {
      toast.error('Please enter a job title first.')
      return
    }
    mutation.mutate({
      title: buttonProps.title,
      location: buttonProps.location || 'Remote',
      jobType: buttonProps.jobType || 'Full-time',
      experienceLevel: buttonProps.experienceLevel || 'Mid',
      requirements: buttonProps.requirements || [],
    })
  }

  return (
    <>
      <AIActionButton label="AI Generate" onClick={handleClick} loading={mutation.isPending} {...buttonProps} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Generated Job Description" size="lg">
        <ModalContent data={result} loading={false} onCopy={handleCopy} />
      </Modal>
    </>
  )
}

export function InterviewQuestionsModal({ jobId, buttonProps = {} }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(null)
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: () => recruiterAiApi.generateInterviewQuestions(jobId),
    onSuccess: (res) => { setData(res?.data); setOpen(true); toast.success('Questions generated!') },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to generate questions.'),
  })

  return (
    <>
      <AIActionButton label="Interview Questions" onClick={() => mutation.mutate()} loading={mutation.isPending} {...buttonProps} />
      <Modal open={open} onClose={() => setOpen(false)} title="Interview Questions" size="lg">
        <ModalContent
          data={data}
          onCopy={() => { navigator.clipboard.writeText(JSON.stringify(data, null, 2)); toast.success('Copied!') }}
        />
      </Modal>
    </>
  )
}

export function SummarizeResumeModal({ applicationId, buttonProps = {} }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(null)
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: () => recruiterAiApi.summarizeResume(applicationId),
    onSuccess: (res) => { setData(res?.data); setOpen(true); toast.success('Resume summarized!') },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to summarize.'),
  })

  return (
    <>
      <AIActionButton label="AI Summarize" onClick={() => mutation.mutate()} loading={mutation.isPending} {...buttonProps} />
      <Modal open={open} onClose={() => setOpen(false)} title="Resume Summary" size="lg">
        <ModalContent
          data={data}
          onCopy={() => { navigator.clipboard.writeText(JSON.stringify(data, null, 2)); toast.success('Copied!') }}
        />
      </Modal>
    </>
  )
}

export function CompareCandidatesModal({ jobId, candidateIds, buttonProps = {} }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(null)
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: () => recruiterAiApi.compareCandidates(jobId, candidateIds),
    onSuccess: (res) => { setData(res?.data?.comparison); setOpen(true); toast.success('Comparison ready!') },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to compare.'),
  })

  return (
    <>
      <AIActionButton label="Compare" onClick={() => {
        if (!candidateIds?.length) { toast.error('Select candidates first.'); return }
        mutation.mutate()
      }} loading={mutation.isPending} {...buttonProps} />
      <Modal open={open} onClose={() => setOpen(false)} title="Candidate Comparison" size="lg">
        <ModalContent
          data={data}
          onCopy={() => { navigator.clipboard.writeText(JSON.stringify(data, null, 2)); toast.success('Copied!') }}
        />
      </Modal>
    </>
  )
}

export function RankApplicantsModal({ jobId, buttonProps = {} }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(null)
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: () => recruiterAiApi.rankApplicants(jobId),
    onSuccess: (res) => { setData(res?.data?.rankings); setOpen(true); toast.success('Rankings generated!') },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to rank.'),
  })

  return (
    <>
      <AIActionButton label="AI Rank" onClick={() => mutation.mutate()} loading={mutation.isPending} {...buttonProps} />
      <Modal open={open} onClose={() => setOpen(false)} title="Applicant Rankings" size="lg">
        <ModalContent
          data={data}
          onCopy={() => { navigator.clipboard.writeText(JSON.stringify(data, null, 2)); toast.success('Copied!') }}
        />
      </Modal>
    </>
  )
}

export function SuggestSalaryModal({ jobId, buttonProps = {} }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(null)
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: () => recruiterAiApi.suggestSalaryRange(jobId),
    onSuccess: (res) => { setData(res?.data); setOpen(true); toast.success('Salary suggestion ready!') },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to get salary suggestion.'),
  })

  return (
    <>
      <AIActionButton label="AI Salary" onClick={() => mutation.mutate()} loading={mutation.isPending} {...buttonProps} />
      <Modal open={open} onClose={() => setOpen(false)} title="Salary Range Suggestion" size="md">
        <ModalContent
          data={data}
          onCopy={() => { navigator.clipboard.writeText(JSON.stringify(data, null, 2)); toast.success('Copied!') }}
        />
      </Modal>
    </>
  )
}

export function EmailInvitationModal({ candidateName, jobTitle, companyName, buttonProps = {} }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(null)
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: () => recruiterAiApi.generateEmailInvitation({ candidateName, jobTitle, companyName }),
    onSuccess: (res) => { setData(res?.data); setOpen(true); toast.success('Email generated!') },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to generate email.'),
  })

  return (
    <>
      <AIActionButton label="Invite Email" onClick={() => {
        if (!candidateName || !jobTitle || !companyName) { toast.error('Missing candidate/job/company info.'); return }
        mutation.mutate()
      }} loading={mutation.isPending} {...buttonProps} />
      <Modal open={open} onClose={() => setOpen(false)} title="Interview Invitation Email" size="lg">
        <ModalContent
          data={data}
          onCopy={() => { navigator.clipboard.writeText(JSON.stringify(data, null, 2)); toast.success('Copied!') }}
        />
      </Modal>
    </>
  )
}

export function RejectionEmailModal({ candidateName, jobTitle, companyName, buttonProps = {} }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(null)
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: () => recruiterAiApi.generateRejectionEmail({ candidateName, jobTitle, companyName }),
    onSuccess: (res) => { setData(res?.data); setOpen(true); toast.success('Rejection email generated!') },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to generate email.'),
  })

  return (
    <>
      <AIActionButton label="Reject Email" onClick={() => {
        if (!candidateName || !jobTitle || !companyName) { toast.error('Missing candidate/job/company info.'); return }
        mutation.mutate()
      }} loading={mutation.isPending} {...buttonProps} />
      <Modal open={open} onClose={() => setOpen(false)} title="Rejection Email" size="lg">
        <ModalContent
          data={data}
          onCopy={() => { navigator.clipboard.writeText(JSON.stringify(data, null, 2)); toast.success('Copied!') }}
        />
      </Modal>
    </>
  )
}

export function TechnicalAssignmentModal({ jobId, buttonProps = {} }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(null)
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: () => recruiterAiApi.generateTechnicalAssignment(jobId),
    onSuccess: (res) => { setData(res?.data); setOpen(true); toast.success('Assignment generated!') },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to generate assignment.'),
  })

  return (
    <>
      <AIActionButton label="Tech Assignment" onClick={() => mutation.mutate()} loading={mutation.isPending} {...buttonProps} />
      <Modal open={open} onClose={() => setOpen(false)} title="Technical Assignment" size="lg">
        <ModalContent
          data={data}
          onCopy={() => { navigator.clipboard.writeText(JSON.stringify(data, null, 2)); toast.success('Copied!') }}
        />
      </Modal>
    </>
  )
}
