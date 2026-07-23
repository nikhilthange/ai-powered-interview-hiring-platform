import { useState, memo, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { Copy, Check, RefreshCw, User, Bot } from 'lucide-react'

function SimpleMarkdown({ content }) {
  if (!content) return null

  const segments = content.split(/(```[\s\S]*?```|`[^`]+`)/g)

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
      {segments.map((segment, i) => {
        if (segment.startsWith('```') && segment.endsWith('```')) {
          const code = segment.slice(3, -3)
          const firstLineEnd = code.indexOf('\n')
          const lang = firstLineEnd > 0 ? code.slice(0, firstLineEnd).trim() : ''
          const codeContent = firstLineEnd > 0 ? code.slice(firstLineEnd + 1) : code

          return (
            <div key={i} className="relative group my-3">
              {lang && (
                <div className="absolute top-0 left-0 right-0 px-4 py-1.5 text-[10px] text-[var(--text-tertiary)] bg-black/20 rounded-t-xl font-mono">
                  {lang}
                </div>
              )}
              <pre className={cn(
                'overflow-x-auto rounded-xl bg-[#1e1e2e] dark:bg-[#1a1a2e] p-4 text-sm leading-relaxed',
                lang && 'pt-8'
              )}>
                <code className="text-[#cdd6f4] font-mono text-[13px]">{codeContent}</code>
              </pre>
            </div>
          )
        }

        if (segment.startsWith('`') && segment.endsWith('`')) {
          return (
            <code key={i} className="bg-[var(--bg-tertiary)] text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] px-1.5 py-0.5 rounded-md text-sm font-mono">
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
          return <h3 key={i} className="text-base font-semibold mt-4 mb-2 text-[var(--text-primary)]">{rendered.slice(4)}</h3>
        }
        if (rendered.startsWith('## ')) {
          return <h2 key={i} className="text-lg font-semibold mt-5 mb-2 text-[var(--text-primary)]">{rendered.slice(3)}</h2>
        }
        if (rendered.startsWith('# ')) {
          return <h1 key={i} className="text-xl font-bold mt-5 mb-3 text-[var(--text-primary)]">{rendered.slice(2)}</h1>
        }

        if (rendered.startsWith('- ') || rendered.startsWith('* ')) {
          return <li key={i} className="ml-4 text-sm text-[var(--text-secondary)] list-disc">{renderInline(rendered.slice(2))}</li>
        }

        if (/^\d+\.\s/.test(rendered)) {
          return <li key={i} className="ml-4 text-sm text-[var(--text-secondary)] list-decimal">{renderInline(rendered.replace(/^\d+\.\s/, ''))}</li>
        }

        if (rendered.startsWith('> ')) {
          return (
            <blockquote key={i} className="border-l-2 border-indigo-400 pl-3 py-1 my-2 text-sm text-[var(--text-secondary)] italic">
              {renderInline(rendered.slice(2))}
            </blockquote>
          )
        }

        rendered = renderInline(rendered)

        return (
          <p key={i} className="text-sm text-[var(--text-secondary)] mb-1.5 leading-relaxed">
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
        <a key={`a${match.index}`} href={match[3]} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-600 underline">
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
        'flex gap-3 py-1',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
        isUser
          ? 'bg-indigo-500 text-white'
          : 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700/50'
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={cn(
        'flex-1 min-w-0 max-w-[85%]',
        isUser ? 'flex flex-col items-end' : ''
      )}>
        <div className={cn(
          'rounded-2xl px-4 py-3 min-w-0 max-w-full break-words',
          isUser
            ? 'bg-indigo-500 text-white'
            : 'bg-[var(--bg-tertiary)]'
        )}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="relative">
              <SimpleMarkdown content={message.content} />
              {isStreaming && (
                <span className="inline-flex ml-0.5">
                  <span className="animate-pulse">|</span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-[var(--text-tertiary)]">
          {message.createdAt && (
            <span className="opacity-70 font-mono">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {!isUser && !isStreaming && message.content && (
            <>
              <button
                onClick={handleCopy}
                className="p-1 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                title="Copy response"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              {onRegenerate && (
                <button
                  onClick={() => onRegenerate(message)}
                  className="p-1 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  title="Regenerate response"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const AIChatMessage = memo(AIChatMessageInner)
export default AIChatMessage
