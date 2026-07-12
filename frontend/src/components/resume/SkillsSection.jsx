import Input from '../ui/Input';
import Button from '../ui/Button';
import { Plus, Trash2 } from 'lucide-react';

export default function SkillsSection({ data = [], onUpdate, onAdd, onRemove }) {
  return (
    <div className="space-y-4">
      {data.map((skill) => (
        <div key={skill.id} className="flex gap-4 items-start relative group">
          <div className="w-1/3">
            <Input 
              placeholder="e.g. Languages" 
              value={skill.category || ''} 
              onChange={e => onUpdate('skills', skill.id, 'category', e.target.value)} 
            />
          </div>
          <div className="flex-1">
            <Input 
              placeholder="JavaScript, Python, C++" 
              value={skill.items || ''} 
              onChange={e => onUpdate('skills', skill.id, 'items', e.target.value)} 
            />
          </div>
          <button 
            onClick={() => onRemove('skills', skill.id)} 
            className="p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 mt-1"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onAdd('skills')} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" /> Add Skill Group
      </Button>
    </div>
  );
}
