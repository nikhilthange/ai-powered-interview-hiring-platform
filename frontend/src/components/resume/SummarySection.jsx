import React from 'react';
import Button from '../ui/Button';
import { Sparkles } from 'lucide-react';

export default function SummarySection({ data = '', onChange, onAIAssist }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm font-medium text-[var(--text-primary)]">Professional Summary</label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onAIAssist(data, onChange)} 
          className="h-6 px-2 text-xs text-indigo-600"
        >
          <Sparkles className="h-3 w-3 mr-1" /> AI Improve
        </Button>
      </div>
      <textarea
        value={data}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm min-h-[120px]"
        placeholder="Brief summary of your professional background..."
      />
    </div>
  );
}
