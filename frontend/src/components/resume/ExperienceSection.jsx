import Input from '../ui/Input';
import Button from '../ui/Button';
import { Plus, Trash2, Sparkles } from 'lucide-react';

export default function ExperienceSection({ data = [], onUpdate, onAdd, onRemove, onAIAssist }) {
  return (
    <div className="space-y-4">
      {data.map((exp) => (
        <div key={exp.id} className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] relative group">
          <button 
            onClick={() => onRemove('experience', exp.id)} 
            className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Company" value={exp.company || ''} onChange={e => onUpdate('experience', exp.id, 'company', e.target.value)} />
            <Input label="Position" value={exp.position || ''} onChange={e => onUpdate('experience', exp.id, 'position', e.target.value)} />
            <Input label="Start Date" placeholder="e.g. Jan 2020" value={exp.startDate || ''} onChange={e => onUpdate('experience', exp.id, 'startDate', e.target.value)} />
            <div className="flex flex-col">
              <Input label="End Date" placeholder="e.g. Present" value={exp.endDate || ''} disabled={exp.current} onChange={e => onUpdate('experience', exp.id, 'endDate', e.target.value)} />
              <label className="flex items-center gap-2 mt-2 text-sm text-[var(--text-secondary)]">
                <input 
                  type="checkbox" 
                  checked={exp.current || false} 
                  onChange={e => onUpdate('experience', exp.id, 'current', e.target.checked)} 
                  className="rounded border-[var(--border-color)] text-indigo-600" 
                />
                I currently work here
              </label>
            </div>
          </div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-[var(--text-primary)]">Description (Bullet points)</label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onAIAssist(exp.description, (res) => onUpdate('experience', exp.id, 'description', res))} 
              className="h-6 px-2 text-xs text-indigo-600"
            >
              <Sparkles className="h-3 w-3 mr-1" /> AI Rewrite
            </Button>
          </div>
          <textarea
            value={exp.description || ''}
            onChange={e => onUpdate('experience', exp.id, 'description', e.target.value)}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm min-h-[100px]"
          />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onAdd('experience')} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" /> Add Experience
      </Button>
    </div>
  );
}
