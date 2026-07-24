import { useState } from 'react'
import { recruiterAiApi } from '../../services/recruiterAiApi'
import { useAuth } from '../../hooks/useAuth'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Textarea from '../ui/Textarea'
import { useToast } from '../ui/Toast'
import { Sparkles, Copy, Check, Send, Mail, RefreshCw } from 'lucide-react'

const EMAIL_TEMPLATES = [
  { id: 'invite', label: 'Interview Invitation', subject: 'Interview Invitation — HireMate' },
  { id: 'selection', label: 'Selection Email', subject: 'Congratulations! You are selected for the next round' },
  { id: 'rejection', label: 'Rejection Email', subject: 'Update regarding your job application' },
  { id: 'offer', label: 'Offer Letter Email', subject: 'Official Job Offer — Software Engineer' },
  { id: 'reminder', label: 'Interview Reminder', subject: 'Reminder: Upcoming Interview Session' },
]

export default function AIEmailGeneratorModal({ open, onClose, candidateName = 'Candidate', candidateEmail = 'candidate@example.com', jobTitle = 'Software Engineer', companyName }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [template, setTemplate] = useState('invite')
  const [copied, setCopied] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [emailSubject, setEmailSubject] = useState(EMAIL_TEMPLATES[0].subject)
  const [emailBody, setEmailBody] = useState(`Hi ${candidateName},

We reviewed your application for the ${jobTitle} position and were extremely impressed with your experience. We would love to invite you to an upcoming interview round.

Please let us know your availability for this week.

Best regards,
Hiring Team`)

  const effectiveCompanyName = companyName || user?.companyName || user?.company || 'HireMate Tech'

  const handleTemplateChange = async (tmplId) => {
    setTemplate(tmplId)
    const tmpl = EMAIL_TEMPLATES.find(t => t.id === tmplId)
    if (!tmpl) return
    setEmailSubject(tmpl.subject)

    try {
      let res
      if (tmplId === 'rejection') {
        res = await recruiterAiApi.generateRejectionEmail({ candidateName, jobTitle, companyName: effectiveCompanyName })
      } else {
        res = await recruiterAiApi.generateEmailInvitation({ candidateName, jobTitle, companyName: effectiveCompanyName, type: tmplId })
      }
      setEmailBody(res.data?.email || res.email || res.data?.invitation || res.data?.content || res.data || `Hi ${candidateName},\n\nWe would love to invite you to an interview for ${jobTitle}.\n\nBest regards,\nHiring Team`)
      toast.success('AI Email generated with NVIDIA AI!')
    } catch (err) {
      toast.error('Failed to generate AI email.')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`)
    setCopied(true)
    toast.success('Email copy copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSend = async () => {
    setIsSending(true)
    try {
      await recruiterAiApi.sendEmail({
        candidateEmail,
        subject: emailSubject,
        body: emailBody
      })
      toast.success(`Email sent successfully to ${candidateName}!`)
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send email.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Recruiter AI Email Generator" size="lg">
      <div className="space-y-5">
        {/* Template Selector */}
        <div>
          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Select Email Type</label>
          <div className="flex flex-wrap gap-2">
            {EMAIL_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTemplateChange(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  template === t.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-indigo-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Subject</label>
          <input
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Email Content</label>
          <Textarea
            rows={7}
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            className="font-sans text-sm leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy Email'}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="gradient" size="sm" onClick={handleSend} disabled={isSending}>
              {isSending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {isSending ? 'Sending...' : 'Send Email Now'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
