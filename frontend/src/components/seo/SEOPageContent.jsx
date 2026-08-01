import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Sparkles, CheckCircle2, HelpCircle, ArrowRight, BookOpen, Layers } from 'lucide-react'

/**
 * Reusable AEO (Answer Engine Optimization) & GEO (Generative Engine Optimization) Content Section
 * Provides AI-friendly summaries, structured Q&A, step-by-step workflows, takeaways, FAQs, and contextual internal links.
 */
export default function SEOPageContent({
  summary,
  definition,
  questions = [],
  steps = [],
  takeaways = [],
  faqs = [],
  comparison = null,
  relatedLinks = [
    { title: 'AI Resume Analyzer', path: '/resume-analyzer', desc: 'Score your resume against ATS filters with AI feedback.' },
    { title: 'AI Mock Interview Practice', path: '/mock-interview', desc: 'Simulate real technical & behavioral interview questions.' },
    { title: 'AI Skill Gap Detection', path: '/skill-gap-analysis', desc: 'Identify missing tech skills and get custom learning paths.' },
    { title: 'Personalized Career Roadmaps', path: '/career-roadmap', desc: 'Follow structured skill milestones for engineering roles.' },
    { title: 'Explore Tech Job Listings', path: '/jobs', desc: 'Find tech opportunities with AI applicant match scoring.' },
  ],
}) {
  const [openFaq, setOpenFaq] = useState(null)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <section className="mt-16 pt-12 border-t border-[var(--color-border,#e5e7eb)] dark:border-gray-800 text-[var(--text-primary)] transition-colors">
      <div className="max-w-5xl mx-auto px-4 space-y-12">
        {/* Executive Summary & AI Definition Box */}
        {(summary || definition) && (
          <div className="surface-card p-6 sm:p-8 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent relative overflow-hidden">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-3">
              <Sparkles className="w-4 h-4 animate-pulse" aria-hidden="true" />
              <span>AI Executive Overview & Key Summary</span>
            </div>
            {summary && (
              <p className="text-base sm:text-lg font-medium text-[var(--text-primary)] leading-relaxed mb-4">
                {summary}
              </p>
            )}
            {definition && (
              <div className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed bg-white/50 dark:bg-gray-900/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <strong className="text-[var(--text-primary)]">Definition: </strong>
                {definition}
              </div>
            )}
          </div>
        )}

        {/* Question & Answer Blocks (AEO) */}
        {questions.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              <HelpCircle className="w-6 h-6 text-indigo-500" aria-hidden="true" />
              <h2>Key Questions & Comprehensive Answers</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="surface-card p-6 rounded-2xl border border-[var(--color-border,#e5e7eb)] dark:border-gray-800 hover:border-indigo-500/30 transition-all"
                >
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">Q:</span>
                    {q.question}
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                    {q.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step-by-Step Workflow (HowTo) */}
        {steps.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              <Layers className="w-6 h-6 text-purple-500" aria-hidden="true" />
              <h2>Step-by-Step Execution Workflow</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="surface-card p-5 rounded-2xl border border-[var(--color-border,#e5e7eb)] dark:border-gray-800 relative flex flex-col justify-between"
                >
                  <div>
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center text-sm mb-3">
                      {idx + 1}
                    </div>
                    <h3 className="font-semibold text-base text-[var(--text-primary)] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Table (If provided) */}
        {comparison && comparison.rows && comparison.rows.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              {comparison.title || 'Feature & Capability Comparison'}
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-[var(--color-border,#e5e7eb)] dark:border-gray-800">
              <table className="w-full text-left text-sm text-[var(--text-primary)]">
                <thead className="bg-indigo-500/10 text-xs uppercase font-semibold text-indigo-700 dark:text-indigo-300">
                  <tr>
                    {comparison.headers.map((h, i) => (
                      <th key={i} className="px-6 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border,#e5e7eb)] dark:divide-gray-800">
                  {comparison.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-indigo-500/5 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-6 py-4">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Key Takeaways Checklist */}
        {takeaways.length > 0 && (
          <div className="surface-card p-6 sm:p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />
              Essential Insights & Key Takeaways
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {takeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* FAQ Accordion Section */}
        {faqs.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              Frequently Asked Questions (FAQs)
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="surface-card rounded-2xl border border-[var(--color-border,#e5e7eb)] dark:border-gray-800 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4 text-left font-semibold text-base sm:text-lg text-[var(--text-primary)] flex items-center justify-between gap-4 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    aria-expanded={openFaq === idx}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        openFaq === idx ? 'rotate-180 text-indigo-500' : ''
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-5 pt-1 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed border-t border-[var(--color-border,#e5e7eb)] dark:border-gray-800/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Career Tools & Contextual Internal Linking */}
        {relatedLinks.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              <BookOpen className="w-5 h-5 text-indigo-500" aria-hidden="true" />
              <h2>Explore Related HireMate Career Tools</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedLinks.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.path}
                  className="group surface-card p-5 rounded-2xl border border-[var(--color-border,#e5e7eb)] dark:border-gray-800 hover:border-indigo-500/40 hover:shadow-md transition-all flex flex-col justify-between"
                  title={link.title}
                >
                  <div>
                    <h3 className="font-semibold text-base text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                      <span>{link.title}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" aria-hidden="true" />
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {link.desc}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    Launch Tool &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
