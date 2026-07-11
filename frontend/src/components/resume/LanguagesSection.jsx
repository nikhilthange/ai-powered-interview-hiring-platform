import React from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';

export default function LanguagesSection({ data = [], onUpdate, onAdd, onRemove }) {
  return (
    <div className="space-y-4">
      {data.map((lang) => (
        <div key={lang.id} className="flex gap-4 items-start relative group">
          <div className="w-1/2">
            <Input 
              placeholder="e.g. Spanish" 
              value={lang.language || ''} 
              onChange={e => onUpdate('languages', lang.id, 'language', e.target.value)} 
            />
          </div>
          <div className="w-1/2">
            <Input 
              placeholder="e.g. Fluent, Native" 
              value={lang.proficiency || ''} 
              onChange={e => onUpdate('languages', lang.id, 'proficiency', e.target.value)} 
            />
          </div>
          <button 
            onClick={() => onRemove('languages', lang.id)} 
            className="p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 mt-1"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onAdd('languages')} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" /> Add Language
      </Button>
    </div>
  );
}
