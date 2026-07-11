import { memo } from 'react'
import { Sparkles, FileText, Briefcase, Code, MessageSquare, Users, Map, DollarSign, Compass } from 'lucide-react'

const PROMPTS = [
  { icon: FileText, label: 'Improve my resume', text: 'Can you review my resume and suggest improvements to make it more impactful?' },
  { icon: Briefcase, label: 'Analyze this job', text: 'Help me analyze this job description and identify the key requirements and qualifications.' },
  { icon: Code, label: 'Explain React hooks', text: 'Explain React hooks with examples. How do useState, useEffect, and useContext work?' },
  { icon: MessageSquare, label: 'Generate interview questions', text: 'Generate common interview questions for my target role with sample answers.' },
  { icon: Users, label: 'HR interview preparation', text: 'How to prepare for an HR interview round? What questions should I expect?' },
  { icon: Map, label: 'DSA roadmap', text: 'Create a DSA roadmap for interview preparation including topics and practice strategies.' },
  { icon: DollarSign, label: 'Salary negotiation', text: 'Tips for negotiating salary during a job offer. What should I say and avoid?' },
  { icon: Compass, label: 'Career advice', text: 'I need career advice for my next move. How do I plan my career growth?' },
]

export default memo(function SuggestedPrompts({ onSelect, isWidgetMode }) {
  // Use fewer prompts if in widget mode to save vertical space
  const displayPrompts = isWidgetMode ? PROMPTS.slice(0, 4) : PROMPTS

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-indigo-500" />
        <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Suggested prompts</p>
      </div>
      <div className={`grid gap-2 ${isWidgetMode ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {displayPrompts.map((prompt, i) => {
          const Icon = prompt.icon
          return (
            <button
              key={i}
              onClick={() => onSelect(prompt.text)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                <Icon className="h-4 w-4" />
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
