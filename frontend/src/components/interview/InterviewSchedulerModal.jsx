import { useState } from 'react'
import { scheduleApi } from '../../services/scheduleApi'
import { generateIcsFile } from '../../utils/icsExport'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { useToast } from '../ui/Toast'
import { Calendar, Clock, Video, Link2, Download, Check, Sparkles, Send } from 'lucide-react'

const PLATFORMS = [
  { id: 'Google Meet', label: 'Google Meet', icon: Video, color: 'text-emerald-500' },
  { id: 'Zoom', label: 'Zoom Video', icon: Video, color: 'text-blue-500' },
  { id: 'Microsoft Teams', label: 'MS Teams', icon: Video, color: 'text-indigo-500' },
]

export default function InterviewSchedulerModal({ open, onClose, candidateName = 'Candidate' }) {
  const { toast } = useToast()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [platform, setPlatform] = useState('Google Meet')
  const [meetingUrl, setMeetingUrl] = useState('')
  const [isScheduled, setIsScheduled] = useState(false)

  const handleSchedule = async (e) => {
    e.preventDefault()
    if (!date || !time) {
      toast.error('Please specify both date and time.')
      return
    }

    try {
      const res = await scheduleApi.scheduleInterview({ candidateName, date, time, platform })
      const data = res.data?.data || res.data
      setMeetingUrl(data.meetingUrl || `https://meet.google.com/abc-defg-hij`)
      setIsScheduled(true)
      toast.success(`Interview scheduled with ${candidateName}! Saved to MongoDB & notifications sent.`)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to schedule interview.')
    }
  }

  const handleDownloadIcs = () => {
    generateIcsFile({
      title: 'AI Technical Interview',
      date,
      time,
      candidateName,
      platform,
      meetingUrl
    })
    toast.success('Downloaded calendar invite (.ics)')
  }

  return (
    <Modal open={open} onClose={onClose} title="Schedule AI Interview" size="md">
      {!isScheduled ? (
        <form onSubmit={handleSchedule} className="space-y-5">
          <div>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Schedule an automated interview round with <strong className="text-[var(--text-primary)]">{candidateName}</strong>. Candidate will receive email & calendar invites.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Time</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Video Platform</label>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    platform === p.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                      : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)]'
                  }`}
                >
                  <p.icon className={`h-4 w-4 ${p.color}`} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              <Send className="h-4 w-4" /> Send Invite
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6 text-center py-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-500">
            <Check className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Interview Scheduled!</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Invite dispatched to {candidateName} for {date} at {time}.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-primary)] break-all">
            {meetingUrl}
          </div>

          <div className="flex justify-center gap-3">
            <Button variant="outline" size="sm" onClick={handleDownloadIcs}>
              <Download className="h-3.5 w-3.5" /> Download .ICS Calendar
            </Button>
            <Button variant="primary" size="sm" onClick={() => { setIsScheduled(false); onClose(); }}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
