import React from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';

export default function AchievementsSection({ data = [], onUpdate, onAdd, onRemove }) {
  return (
    <div className="space-y-4">
      {data.map((ach) => (
        <div key={ach.id} className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] relative group">
          <button 
            onClick={() => onRemove('achievements', ach.id)} 
            className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Achievement Title" value={ach.title || ''} onChange={e => onUpdate('achievements', ach.id, 'title', e.target.value)} />
            <Input label="Date" value={ach.date || ''} onChange={e => onUpdate('achievements', ach.id, 'date', e.target.value)} />
          </div>
          <Input label="Description" value={ach.description || ''} onChange={e => onUpdate('achievements', ach.id, 'description', e.target.value)} />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onAdd('achievements')} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" /> Add Achievement
      </Button>
    </div>
  );
}
