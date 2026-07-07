import { memo } from 'react'
import { Sparkles, FileText, Briefcase, MessageSquare, Code, Compass, DollarSign, Users } from 'lucide-react'

const CANDIDATE_PROMPTS = [
  { icon: FileText, label: 'Review my resume', text: 'Can you review my resume and suggest improvements?' },
  { icon: Briefcase, label: 'Analyze a job description', text: 'Help me analyze a job description and identify key requirements.' },
  { icon: MessageSquare, label: 'Generate interview questions', text: 'Generate common interview questions for my target role.' },
  { icon: Code, label: 'Explain DSA', text: 'Explain a data structure or algorithm concept for interviews.' },
  { icon: Compass, label: 'Career advice', text: 'I need career advice for my next move.' },
  { icon: DollarSign, label: 'Salary negotiation', text: 'Tips for negotiating salary during a job offer.' },
  { icon: Users, label: 'HR interview preparation', text: 'How to prepare for an HR interview round?' },
]

const RECRUITER_PROMPTS = [
  { icon: FileText, label: 'Generate job description', text: 'Help me write a compelling job description for a role.' },
  { icon: MessageSquare, label: 'Create interview questions', text: 'Create technical interview questions for a candidate.' },
  { icon: Users, label: 'Summarize candidate', text: 'How should I summarize a candidate profile?' },
  { icon: Briefcase, label: 'Compare applicants', text: 'Help me compare multiple applicants for a role.' },
]

const ADMIN_PROMPTS = [
  { icon: Users, label: 'User growth analysis', text: 'Analyze user growth trends on the platform.' },
  { icon: Briefcase, label: 'Job statistics', text: 'What are the key job statistics I should track?' },
  { icon: Sparkles, label: 'AI usage summary', text: 'Summarize AI feature usage across the platform.' },
]

export default memo(function SuggestedPrompts({ onSelect, role = 'candidate' }) {
  const prompts = role === 'admin' ? ADMIN_PROMPTS : role === 'recruiter' ? RECRUITER_PROMPTS : CANDIDATE_PROMPTS

  if (prompts.length === 0) return null

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-indigo-500" />
        <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Suggested prompts</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {prompts.map((prompt, i) => {
          const Icon = prompt.icon
          return (
            <button
              key={i}
              onClick={() => onSelect(prompt.text)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left group"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors leading-tight">
                {prompt.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
})
