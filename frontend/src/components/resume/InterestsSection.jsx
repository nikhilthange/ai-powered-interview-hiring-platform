import Input from '../ui/Input';
import Button from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';

export default function InterestsSection({ data = [], onUpdate, onAdd, onRemove }) {
  return (
    <div className="space-y-4">
      {data.map((interest) => (
        <div key={interest.id} className="flex gap-4 items-start relative group">
          <div className="flex-1">
            <Input 
              placeholder="e.g. Open Source, Machine Learning, Photography" 
              value={interest.items || ''} 
              onChange={e => onUpdate('interests', interest.id, 'items', e.target.value)} 
            />
          </div>
          <button 
            onClick={() => onRemove('interests', interest.id)} 
            className="p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 mt-1"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onAdd('interests')} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" /> Add Interest
      </Button>
    </div>
  );
}
