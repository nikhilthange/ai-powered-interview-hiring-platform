import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Code, FileText, ListChecks, Briefcase, Download, Copy, Save, Share2, 
  BrainCircuit, Target, CheckCircle2, Clock, Check, MoreVertical
} from 'lucide-react';
import { cn } from '../../lib/utils';
import AIStepLoader from '../../components/ui/AIStepLoader';

const topActionCards = [
  { id: 'questions', title: 'Generate Questions', desc: 'Behavioral & Technical', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  { id: 'coding', title: 'Coding Challenge', desc: 'Live coding & DSA', icon: Code, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  { id: 'plan', title: 'Interview Plan', desc: 'Structure & timelines', icon: ListChecks, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-500/10' },
  { id: 'rubric', title: 'Evaluation Rubric', desc: 'Scoring criteria', icon: Target, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
];

const generatedDataMock = {
  technical: [
    { q: "Can you explain the differences between React's useMemo and useCallback?", diff: "Medium", ans: "useMemo caches a computed value. useCallback caches a function definition.", follow: "When would using useMemo actually hurt performance?", weight: "20%" },
    { q: "How does the virtual DOM work in React?", diff: "Hard", ans: "It creates an in-memory representation of the UI and syncs it with the real DOM using a reconciliation algorithm (diffing).", follow: "Explain how React fiber improves this.", weight: "30%" }
  ],
  behavioral: [
    { q: "Tell me about a time you had a conflict with a team member.", diff: "Medium", ans: "Looking for: empathy, clear communication, compromise.", follow: "What would you do differently now?", weight: "25%" }
  ],
  coding: [
    { q: "Implement a deep clone function in JavaScript.", diff: "Hard", ans: "Should handle nested objects, arrays, Dates, and avoid circular reference crashes.", follow: "How would you handle cyclic dependencies?", weight: "50%" }
  ],
  system: [
    { q: "Design a URL shortener service like Bitly.", diff: "Expert", ans: "Requires hashing, collision resolution, database sharding, and caching.", follow: "How would you scale this globally with low latency?", weight: "100%" }
  ],
  hr: [
    { q: "What are your salary expectations?", diff: "Easy", ans: "Candidate should provide a reasonable range aligned with market.", follow: "Is this negotiable based on equity?", weight: "10%" }
  ]
};

const recentKitsMock = [
  { id: 1, candidate: 'Sarah Jenkins', role: 'Senior Frontend Engineer', date: '2023-10-24', status: 'Ready' },
  { id: 2, candidate: 'Michael Chen', role: 'Backend Developer', date: '2023-10-22', status: 'In Progress' },
  { id: 3, candidate: 'Alex Rodriguez', role: 'Product Manager', date: '2023-10-20', status: 'Ready' },
];

export default function AIInterviewAssistant() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [activeTab, setActiveTab] = useState('technical');
  const [formData, setFormData] = useState({ title: '', experience: 'Mid-Level', skills: '', type: 'Technical' });
  const [copied, setCopied] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!formData.title) return;
    setIsGenerating(true);
    setHasGenerated(false);
    
    // Simulate AI generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
    }, 2500);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 min-h-screen pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
              <BrainCircuit className="h-5 w-5" />
            </div>
            AI Interview Assistant
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 font-medium">
            Generate professional, structured interview kits and evaluation rubrics instantly.
          </p>
        </div>
      </div>

      {/* Top Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topActionCards.map((card) => (
          <button 
            key={card.id}
            className="group relative flex flex-col p-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-current opacity-[0.03] group-hover:opacity-[0.08] rounded-bl-full transition-opacity ${card.color}`} />
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${card.bg}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <h3 className="font-bold text-[var(--text-primary)] mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {card.title}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              {card.desc}
            </p>
          </button>
        ))}
      </div>

      {/* Main Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column - Form */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[24px] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
              <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-500" />
                Job Context
              </h2>
            </div>
            <form onSubmit={handleGenerate} className="p-5 space-y-5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Job Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Senior Frontend Engineer" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Experience</label>
                  <select 
                    value={formData.experience}
                    onChange={e => setFormData({...formData, experience: e.target.value})}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option>Entry-Level</option>
                    <option>Mid-Level</option>
                    <option>Senior</option>
                    <option>Lead/Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option>Technical</option>
                    <option>Behavioral</option>
                    <option>System Design</option>
                    <option>HR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Core Skills</label>
                <textarea 
                  placeholder="React, Node.js, System Design..." 
                  rows={2}
                  value={formData.skills}
                  onChange={e => setFormData({...formData, skills: e.target.value})}
                  className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={isGenerating || !formData.title}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
              >
                {isGenerating ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Interview Kit
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-8 min-w-0">
          
          {isGenerating ? (
            <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[24px] shadow-sm">
              <AIStepLoader title="HireMate AI is crafting your interview kit" />
            </div>
          ) : hasGenerated ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* Tabs */}
              <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[24px] shadow-sm overflow-hidden">
                <div className="flex overflow-x-auto scrollbar-none border-b border-[var(--border-color)]">
                  {['technical', 'behavioral', 'coding', 'system', 'hr'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "relative flex-1 whitespace-nowrap py-4 px-4 sm:px-6 text-sm font-bold capitalize transition-colors",
                        activeTab === tab ? "text-indigo-600 dark:text-indigo-400" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                      )}
                    >
                      {tab}
                      {activeTab === tab && (
                        <motion.div layoutId="activeGenTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 space-y-6">
                  {generatedDataMock[activeTab]?.map((item, idx) => (
                    <div key={idx} className="group relative pl-6 pb-6 border-l-2 border-indigo-100 dark:border-indigo-900/50 last:border-0 last:pb-0">
                      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white dark:bg-[#0f172a] border-4 border-indigo-500" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-3">
                        <h4 className="text-base font-bold text-[var(--text-primary)] leading-tight">{item.q}</h4>
                        <span className={cn(
                          "inline-flex shrink-0 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider self-start",
                          item.diff === 'Hard' || item.diff === 'Expert' ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                          item.diff === 'Medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                          'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        )}>
                          {item.diff}
                        </span>
                      </div>

                      <div className="bg-[var(--bg-secondary)] rounded-xl p-4 space-y-3">
                        <div>
                          <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Expected Answer / Criteria</p>
                          <p className="text-sm text-[var(--text-secondary)] font-medium">{item.ans}</p>
                        </div>
                        <div className="pt-3 border-t border-[var(--border-color)]">
                          <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Follow-up Probe</p>
                          <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium italic">"{item.follow}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evaluation & Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Rubric */}
                <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm">
                  <h3 className="font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2">
                    <Target className="h-5 w-5 text-pink-500" />
                    Evaluation Rubric
                  </h3>
                  <div className="space-y-4">
                    {[
                      { l: 'Technical Knowledge', s: '8.5/10' },
                      { l: 'Problem Solving', s: '9.0/10' },
                      { l: 'Communication', s: '7.5/10' },
                      { l: 'Culture Fit', s: '8.0/10' }
                    ].map(metric => (
                      <div key={metric.l}>
                        <div className="flex justify-between text-sm font-semibold mb-1">
                          <span className="text-[var(--text-secondary)]">{metric.l}</span>
                          <span className="text-[var(--text-primary)]">{metric.s}</span>
                        </div>
                        <div className="h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${(parseFloat(metric.s)/10)*100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Summary */}
                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white rounded-[24px] p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-indigo-300" />
                    AI Insights
                  </h3>
                  <div className="space-y-3 relative z-10 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-indigo-100"><strong className="text-white">Strengths:</strong> Strong systems thinking and modern React patterns.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-indigo-100"><strong className="text-white">Areas to probe:</strong> Check depth of understanding on backend caching strategies.</p>
                    </div>
                    <div className="pt-4 mt-2 border-t border-white/10">
                      <p className="font-semibold text-white">Recommendation Template:</p>
                      <p className="text-indigo-200 mt-1 italic font-medium text-xs leading-relaxed">
                        "Strong hire for the Frontend aspect. Recommend a follow-up 30m session on System Design to validate full-stack capabilities."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors">
                  <Save className="h-4 w-4" /> Save Kit
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm font-bold rounded-xl shadow-sm transition-colors">
                  <Download className="h-4 w-4" /> Export PDF
                </button>
                <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm font-bold rounded-xl shadow-sm transition-colors">
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />} 
                  {copied ? 'Copied' : 'Copy Text'}
                </button>
                <div className="flex-1" />
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm font-bold rounded-xl shadow-sm transition-colors w-full sm:w-auto justify-center">
                  <Share2 className="h-4 w-4" /> Share with Panel
                </button>
              </div>

            </motion.div>
          ) : (
            <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] border-dashed rounded-[24px] p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="h-20 w-20 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6 shadow-inner">
                <Sparkles className="h-10 w-10 text-indigo-300 dark:text-indigo-700" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Ready to assist</h3>
              <p className="text-[var(--text-secondary)] font-medium max-w-sm">
                Fill in the job context on the left and I'll generate a comprehensive, tailored interview kit for your candidate.
              </p>
            </div>
          )}

          {/* Recent Kits */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[var(--text-tertiary)]" />
              Recent Interview Kits
            </h3>
            <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[24px] shadow-sm overflow-hidden">
              <div className="divide-y divide-[var(--border-color)]">
                {recentKitsMock.map((kit) => (
                  <div key={kit.id} className="p-4 flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-colors group">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 pr-4">
                      <div className="shrink-0 h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[var(--text-tertiary)] font-bold">
                        {kit.candidate.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[var(--text-primary)] truncate">{kit.candidate}</p>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[11px] sm:text-xs font-medium text-[var(--text-secondary)] mt-0.5">
                          <span className="truncate max-w-[120px] sm:max-w-none">{kit.role}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="shrink-0">{kit.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn(
                        "hidden sm:inline-flex px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider",
                        kit.status === 'Ready' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      )}>
                        {kit.status}
                      </span>
                      <button className="p-2 text-[var(--text-tertiary)] hover:text-indigo-600 transition-colors">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
