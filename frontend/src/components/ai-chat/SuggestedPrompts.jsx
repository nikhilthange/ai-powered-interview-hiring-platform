import { memo } from 'react'
import { Sparkles, FileText, Briefcase, Code, MessageSquare, Users, Map, DollarSign, Compass } from 'lucide-react'

const PROMPTS = [
  { icon: FileText, label: 'Improve my resume', text: 'Can you review my resume and suggest improvements to make it more impactful?' },
  { icon: Briefcase, label: 'Analyze this job', text: 'Help me analyze key job requirements and qualifications for my target role.' },
  { icon: MessageSquare, label: 'Mock interview questions', text: 'Generate common technical and behavioral interview questions with sample answers.' },
  { icon: Code, label: 'Explain React hooks', text: 'Explain React hooks with practical code examples: useState, useEffect, and custom hooks.' },
  { icon: Users, label: 'HR interview tips', text: 'How to prepare for an HR interview round? What questions should I expect?' },
  { icon: Map, label: 'DSA preparation roadmap', text: 'Create a structured DSA roadmap for interview preparation including key data structures.' },
  { icon: DollarSign, label: 'Salary negotiation', text: 'Tips for negotiating salary during a job offer. What strategies should I use?' },
  { icon: Compass, label: 'Career advice', text: 'I need career advice for my next move. How do I plan long-term career growth?' },
]

export default memo(function SuggestedPrompts({ onSelect, isWidgetMode }) {
  const displayPrompts = isWidgetMode ? PROMPTS.slice(0, 4) : PROMPTS

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
        <p className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Suggested Prompts</p>
      </div>
      <div className={isWidgetMode ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5'}>
        {displayPrompts.map((prompt, i) => {
          const Icon = prompt.icon
          return (
            <button
              key={i}
              onClick={() => onSelect(prompt.text)}
              className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] hover:border-indigo-300 dark:hover:border-indigo-700/60 shadow-xs transition-all text-left group"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-indigo-100 dark:border-indigo-900/40">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {prompt.label}
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)] line-clamp-1 block mt-0.5">
                  {prompt.text}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
})
