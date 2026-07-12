import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { resumeBuilderApi } from '../../services/resumeBuilderApi';
import Button from '../../components/ui/Button';
import { Sparkles, Check, X, SpellCheck, Briefcase } from 'lucide-react';

export default function AIAssistantModal({ text, onApply, onClose }) {
  const [result, setResult] = useState(null);

  const assistMutation = useMutation({
    mutationFn: (action) => resumeBuilderApi.aiAssist(text, action),
    onSuccess: (data) => {
      setResult(data.data.result);
    }
  });

  const handleApply = () => {
    if (result) {
      onApply(result);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-primary)] w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-[var(--border-color)]">
        <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <h3 className="font-bold text-[var(--text-primary)]">AI Assistant</h3>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Original Text</label>
            <div className="p-3 bg-[var(--bg-secondary)] rounded-xl text-sm text-[var(--text-primary)] border border-[var(--border-color)] whitespace-pre-wrap">
              {text || <span className="text-[var(--text-tertiary)] italic">No text selected...</span>}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => assistMutation.mutate('grammar')}
              disabled={!text || assistMutation.isPending}
              className="flex-1"
            >
              <SpellCheck className="h-4 w-4 mr-2" /> Fix Grammar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => assistMutation.mutate('rewrite')}
              disabled={!text || assistMutation.isPending}
              className="flex-1"
            >
              <Sparkles className="h-4 w-4 mr-2" /> Professional Rewrite
            </Button>
            <Button 
              variant="outline" 
              onClick={() => assistMutation.mutate('ats')}
              disabled={!text || assistMutation.isPending}
              className="flex-1"
            >
              <Briefcase className="h-4 w-4 mr-2" /> Optimize for ATS
            </Button>
          </div>

          {assistMutation.isPending && (
            <div className="py-8 flex flex-col items-center justify-center">
              <Sparkles className="h-8 w-8 text-indigo-500 animate-pulse mb-3" />
              <p className="text-sm text-[var(--text-secondary)] animate-pulse">AI is thinking...</p>
            </div>
          )}

          {result && !assistMutation.isPending && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <label className="block text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">Suggested Improvement</label>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-sm text-indigo-900 dark:text-indigo-100 border border-indigo-200 dark:border-indigo-500/30 whitespace-pre-wrap relative group">
                {result}
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setResult(null)}>Discard</Button>
                <Button onClick={handleApply}>
                  <Check className="h-4 w-4 mr-2" /> Apply Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
