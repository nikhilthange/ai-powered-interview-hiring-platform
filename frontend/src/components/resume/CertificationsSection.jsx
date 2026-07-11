import React from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';

export default function CertificationsSection({ data = [], onUpdate, onAdd, onRemove }) {
  return (
    <div className="space-y-4">
      {data.map((cert) => (
        <div key={cert.id} className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] relative group">
          <button 
            onClick={() => onRemove('certifications', cert.id)} 
            className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Certification Title" value={cert.title || ''} onChange={e => onUpdate('certifications', cert.id, 'title', e.target.value)} />
            <Input label="Issuer/Organization" value={cert.issuer || ''} onChange={e => onUpdate('certifications', cert.id, 'issuer', e.target.value)} />
            <Input label="Date Earned" value={cert.date || ''} onChange={e => onUpdate('certifications', cert.id, 'date', e.target.value)} />
            <Input label="Credential URL (Optional)" value={cert.url || ''} onChange={e => onUpdate('certifications', cert.id, 'url', e.target.value)} />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onAdd('certifications')} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" /> Add Certification
      </Button>
    </div>
  );
}
