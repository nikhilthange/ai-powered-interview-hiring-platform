import Input from '../ui/Input';
import Button from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';

export default function EducationSection({ data = [], onUpdate, onAdd, onRemove }) {
  return (
    <div className="space-y-4">
      {data.map((edu) => (
        <div key={edu.id} className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] relative group">
          <button 
            onClick={() => onRemove('education', edu.id)} 
            className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input label="Institution" value={edu.institution || ''} onChange={e => onUpdate('education', edu.id, 'institution', e.target.value)} />
            <div className="flex gap-2">
              <div className="flex-1"><Input label="Degree" value={edu.degree || ''} onChange={e => onUpdate('education', edu.id, 'degree', e.target.value)} /></div>
              <div className="flex-1"><Input label="Field" value={edu.field || ''} onChange={e => onUpdate('education', edu.id, 'field', e.target.value)} /></div>
            </div>
            <Input label="Start Date" value={edu.startDate || ''} onChange={e => onUpdate('education', edu.id, 'startDate', e.target.value)} />
            <Input label="End Date" value={edu.endDate || ''} onChange={e => onUpdate('education', edu.id, 'endDate', e.target.value)} />
          </div>
          <Input label="Description / Honors (Optional)" value={edu.description || ''} onChange={e => onUpdate('education', edu.id, 'description', e.target.value)} />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onAdd('education')} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" /> Add Education
      </Button>
    </div>
  );
}
