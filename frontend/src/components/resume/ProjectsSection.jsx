import React from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Plus, Trash2, Sparkles } from 'lucide-react';

export default function ProjectsSection({ data = [], onUpdate, onAdd, onRemove, onAIAssist }) {
  return (
    <div className="space-y-4">
      {data.map((proj) => (
        <div key={proj.id} className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] relative group">
          <button 
            onClick={() => onRemove('projects', proj.id)} 
            className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Project Title" value={proj.title || ''} onChange={e => onUpdate('projects', proj.id, 'title', e.target.value)} />
            <Input label="Technologies (comma separated)" value={proj.technologies || ''} onChange={e => onUpdate('projects', proj.id, 'technologies', e.target.value)} />
          </div>
          <div className="mb-4">
            <Input label="Project URL" value={proj.url || ''} onChange={e => onUpdate('projects', proj.id, 'url', e.target.value)} />
          </div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-[var(--text-primary)]">Description</label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onAIAssist(proj.description, (res) => onUpdate('projects', proj.id, 'description', res))} 
              className="h-6 px-2 text-xs text-indigo-600"
            >
              <Sparkles className="h-3 w-3 mr-1" /> AI Improve
            </Button>
          </div>
          <textarea
            value={proj.description || ''}
            onChange={e => onUpdate('projects', proj.id, 'description', e.target.value)}
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm min-h-[80px]"
          />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onAdd('projects')} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" /> Add Project
      </Button>
    </div>
  );
}
