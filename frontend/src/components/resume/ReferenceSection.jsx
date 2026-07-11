import React from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';

export default function ReferencesSection({ data = [], onUpdate, onAdd, onRemove }) {
  return (
    <div className="space-y-4">
      {data.map((ref) => (
        <div key={ref.id} className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] relative group">
          <button 
            onClick={() => onRemove('references', ref.id)} 
            className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Name" value={ref.name || ''} onChange={e => onUpdate('references', ref.id, 'name', e.target.value)} />
            <Input label="Position" value={ref.position || ''} onChange={e => onUpdate('references', ref.id, 'position', e.target.value)} />
            <Input label="Company" value={ref.company || ''} onChange={e => onUpdate('references', ref.id, 'company', e.target.value)} />
            <Input label="Contact Info (Email/Phone)" value={ref.contactInfo || ''} onChange={e => onUpdate('references', ref.id, 'contactInfo', e.target.value)} />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onAdd('references')} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" /> Add Reference
      </Button>
    </div>
  );
}
