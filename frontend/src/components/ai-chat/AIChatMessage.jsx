import { useState, memo, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Copy, Check, RefreshCw, User, Bot, Sparkles } from 'lucide-react'

function SimpleMarkdown({ content }) {
  if (!content) return null

  const segments = content.split(/(```[\s\S]*?```|`[^`]+`)/g)

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-sm">
      {segments.map((segment, i) => {
        if (segment.startsWith('```') && segment.endsWith('```')) {
          const code = segment.slice(3, -3)
          const firstLineEnd = code.indexOf('\n')
          const lang = firstLineEnd > 0 ? code.slice(0, firstLineEnd).trim() : ''
          const codeContent = firstLineEnd > 0 ? code.slice(firstLineEnd + 1) : code

          return (
            <div key={i} className="relative group my-3">
              {lang && (
                <div className="px-3 py-1 text-[10px] font-mono text-slate-400 bg-slate-800 rounded-t-xl border-b border-slate-700/50">
                  {lang}
                </div>
              )}
              <pre className={cn(
                'overflow-x-auto rounded-xl bg-slate-900 text-slate-100 p-3.5 text-xs font-mono leading-relaxed border border-slate-800',
                lang && 'rounded-t-none'
              )}>
                <code>{codeContent}</code>
              </pre>
            </div>
          )
        }

        if (segment.startsWith('`') && segment.endsWith('`')) {
          return (
            <code key={i} className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded-md text-xs font-mono border border-indigo-200/50 dark:border-indigo-800/50">
              {segment.slice(1, -1)}
            </code>
          )
        }

        return <InlineMarkdown key={i} text={segment} />
      })}
    </div>
  )
}

function InlineMarkdown({ text }) {
  const lines = text.split('\n')
  return (
    <>
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />

        let rendered = line

        if (rendered.startsWith('### ')) {
          return <h3 key={i} className="text-sm font-bold mt-3 mb-1.5 text-[var(--text-primary)]">{rendered.slice(4)}</h3>
        }
        if (rendered.startsWith('## ')) {
          return <h2 key={i} className="text-base font-bold mt-4 mb-2 text-[var(--text-primary)]">{rendered.slice(3)}</h2>
        }
        if (rendered.startsWith('# ')) {
          return <h1 key={i} className="text-lg font-bold mt-4 mb-2 text-[var(--text-primary)]">{rendered.slice(2)}</h1>
        }

        if (rendered.startsWith('- ') || rendered.startsWith('* ')) {
          return <li key={i} className="ml-4 text-xs sm:text-sm text-[var(--text-secondary)] list-disc my-0.5">{renderInline(rendered.slice(2))}</li>
        }

        if (/^\d+\.\s/.test(rendered)) {
          return <li key={i} className="ml-4 text-xs sm:text-sm text-[var(--text-secondary)] list-decimal my-0.5">{renderInline(rendered.replace(/^\d+\.\s/, ''))}</li>
        }

        if (rendered.startsWith('> ')) {
          return (
            <blockquote key={i} className="border-l-2 border-indigo-500 pl-3 py-1 my-2 text-xs sm:text-sm text-[var(--text-secondary)] italic bg-indigo-50/30 dark:bg-indigo-950/20 rounded-r-lg">
              {renderInline(rendered.slice(2))}
            </blockquote>
          )
        }

        rendered = renderInline(rendered)

        return (
          <p key={i} className="text-xs sm:text-sm text-[var(--text-primary)] mb-1.5 leading-relaxed">
            {rendered}
          </p>
        )
      })}
    </>
  )
}

function renderInline(text) {
  const parts = []
  let lastIndex = 0
  const regex = /(\*\*[\s\S]*?\*\*|\*[\s\S]*?\*|\[([^\]]+)\]\(([^)]+)\))/g
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`t${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>)
    }

    if (match[0].startsWith('**')) {
      parts.push(<strong key={`b${match.index}`} className="font-semibold text-[var(--text-primary)]">{match[0].slice(2, -2)}</strong>)
    } else if (match[0].startsWith('*')) {
      parts.push(<em key={`i${match.index}`} className="italic">{match[0].slice(1, -1)}</em>)
    } else if (match[0].startsWith('[')) {
      parts.push(
        <a key={`a${match.index}`} href={match[3]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
          {match[2]}
        </a>
      )
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`t${lastIndex}`}>{text.slice(lastIndex)}</span>)
  }

  return parts.length > 0 ? parts : text
}

function AIChatMessageInner({ message, isStreaming, onRegenerate }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  const shouldReduceMotion = useReducedMotion()

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Copy failed:', e)
    }
  }, [message.content])

  if (isSystem) return null

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
      animate={shouldReduceMotion ? false : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'flex gap-2.5 py-1.5',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-xs text-xs font-semibold',
        isUser
          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-indigo-500/20'
          : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-sm'
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4.5 w-4.5" />}
      </div>

      {/* Message Content Bubble */}
      <div className={cn(
        'flex-1 min-w-0 max-w-[85%] sm:max-w-[80%]',
        isUser ? 'flex flex-col items-end' : ''
      )}>
        <div className={cn(
          'rounded-2xl px-4 py-3 min-w-0 max-w-full break-words shadow-xs',
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-none'
            : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-tl-none'
        )}>
          {isUser ? (
            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="relative">
              <SimpleMarkdown content={message.content} />
              {isStreaming && (
                <span className="inline-flex items-center ml-1 text-indigo-500 animate-pulse">
                  <Sparkles className="h-3.5 w-3.5 inline" />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer info & actions */}
        <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-[var(--text-tertiary)]">
          {message.createdAt && (
            <span className="opacity-70 font-mono">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {!isUser && !isStreaming && message.content && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="p-1 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                title="Copy response"
                aria-label="Copy response text"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              {onRegenerate && (
                <button
                  onClick={() => onRegenerate(message)}
                  className="p-1 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  title="Regenerate response"
                  aria-label="Regenerate response"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const AIChatMessage = memo(AIChatMessageInner)
export default AIChatMessage
