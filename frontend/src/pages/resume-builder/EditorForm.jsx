import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { GripVertical, Plus, Trash2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const SortableItem = ({ id, title, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const [isOpen, setIsOpen] = useState(true);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] overflow-hidden mb-4 shadow-sm">
      <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <button {...attributes} {...listeners} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-grab active:cursor-grabbing p-1">
            <GripVertical className="h-5 w-5" />
          </button>
          <h3 className="font-semibold text-[var(--text-primary)] capitalize">{title}</h3>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

export default function EditorForm({ resumeData, onChange, onAIAssist }) {
  const { title, template, content } = resumeData;
  const sectionOrder = content.sectionOrder || ['summary', 'experience', 'education', 'projects', 'skills'];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = sectionOrder.indexOf(active.id);
      const newIndex = sectionOrder.indexOf(over.id);
      onChange('content', { ...content, sectionOrder: arrayMove(sectionOrder, oldIndex, newIndex) });
    }
  };

  const updatePersonalInfo = (field, value) => {
    onChange('content', { ...content, personalInfo: { ...content.personalInfo, [field]: value } });
  };

  const updateArrayField = (section, id, field, value) => {
    const arr = content[section] || [];
    const updated = arr.map(item => item.id === id ? { ...item, [field]: value } : item);
    onChange('content', { ...content, [section]: updated });
  };

  const addArrayItem = (section) => {
    const arr = content[section] || [];
    onChange('content', { ...content, [section]: [...arr, { id: uuidv4() }] });
  };

  const removeArrayItem = (section, id) => {
    const arr = content[section] || [];
    onChange('content', { ...content, [section]: arr.filter(item => item.id !== id) });
  };

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-2 pb-20 custom-scrollbar">
      
      {/* Settings */}
      <div className="bg-[var(--bg-primary)] p-5 rounded-xl border border-[var(--border-color)] shadow-sm space-y-4">
        <h3 className="font-semibold text-[var(--text-primary)]">Document Settings</h3>
        <Input 
          label="Resume Title (Internal)" 
          value={title || ''} 
          onChange={(e) => onChange('title', e.target.value)} 
          placeholder="Software Engineer Resume"
        />
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Template</label>
          <select 
            value={template || 'classic'} 
            onChange={(e) => onChange('template', e.target.value)}
            className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm"
          >
            <option value="classic">Classic (ATS Friendly)</option>
            <option value="modern">Modern</option>
          </select>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-[var(--bg-primary)] p-5 rounded-xl border border-[var(--border-color)] shadow-sm space-y-4">
        <h3 className="font-semibold text-[var(--text-primary)]">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={content.personalInfo?.fullName || ''} onChange={e => updatePersonalInfo('fullName', e.target.value)} />
          <Input label="Email" value={content.personalInfo?.email || ''} onChange={e => updatePersonalInfo('email', e.target.value)} />
          <Input label="Phone" value={content.personalInfo?.phone || ''} onChange={e => updatePersonalInfo('phone', e.target.value)} />
          <Input label="Location" value={content.personalInfo?.location || ''} onChange={e => updatePersonalInfo('location', e.target.value)} />
          <Input label="LinkedIn URL" value={content.personalInfo?.linkedin || ''} onChange={e => updatePersonalInfo('linkedin', e.target.value)} />
          <Input label="GitHub URL" value={content.personalInfo?.github || ''} onChange={e => updatePersonalInfo('github', e.target.value)} />
          <Input label="Portfolio Website" value={content.personalInfo?.website || ''} onChange={e => updatePersonalInfo('website', e.target.value)} />
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
          {sectionOrder.map((sectionId) => (
            <SortableItem key={sectionId} id={sectionId} title={sectionId}>
              
              {sectionId === 'summary' && (
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-[var(--text-primary)]">Professional Summary</label>
                    <Button variant="ghost" size="sm" onClick={() => onAIAssist(content.summary, (res) => onChange('content', { ...content, summary: res }))} className="h-6 px-2 text-xs text-indigo-600">
                      <Sparkles className="h-3 w-3 mr-1" /> AI Improve
                    </Button>
                  </div>
                  <textarea
                    value={content.summary || ''}
                    onChange={(e) => onChange('content', { ...content, summary: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm min-h-[120px]"
                    placeholder="Brief summary of your professional background..."
                  />
                </div>
              )}

              {sectionId === 'experience' && (
                <div className="space-y-4">
                  {(content.experience || []).map((exp, index) => (
                    <div key={exp.id} className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] relative group">
                      <button onClick={() => removeArrayItem('experience', exp.id)} className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <Input label="Company" value={exp.company || ''} onChange={e => updateArrayField('experience', exp.id, 'company', e.target.value)} />
                        <Input label="Position" value={exp.position || ''} onChange={e => updateArrayField('experience', exp.id, 'position', e.target.value)} />
                        <Input label="Start Date" placeholder="e.g. Jan 2020" value={exp.startDate || ''} onChange={e => updateArrayField('experience', exp.id, 'startDate', e.target.value)} />
                        <div className="flex flex-col">
                           <Input label="End Date" placeholder="e.g. Present" value={exp.endDate || ''} disabled={exp.current} onChange={e => updateArrayField('experience', exp.id, 'endDate', e.target.value)} />
                           <label className="flex items-center gap-2 mt-2 text-sm text-[var(--text-secondary)]">
                             <input type="checkbox" checked={exp.current || false} onChange={e => updateArrayField('experience', exp.id, 'current', e.target.checked)} className="rounded border-[var(--border-color)] text-indigo-600" />
                             I currently work here
                           </label>
                        </div>
                      </div>
                      <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium text-[var(--text-primary)]">Description (Bullet points)</label>
                        <Button variant="ghost" size="sm" onClick={() => onAIAssist(exp.description, (res) => updateArrayField('experience', exp.id, 'description', res))} className="h-6 px-2 text-xs text-indigo-600">
                          <Sparkles className="h-3 w-3 mr-1" /> AI Rewrite
                        </Button>
                      </div>
                      <textarea
                        value={exp.description || ''}
                        onChange={e => updateArrayField('experience', exp.id, 'description', e.target.value)}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm min-h-[100px]"
                      />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addArrayItem('experience')} className="w-full border-dashed">
                    <Plus className="h-4 w-4 mr-2" /> Add Experience
                  </Button>
                </div>
              )}

              {sectionId === 'education' && (
                <div className="space-y-4">
                  {(content.education || []).map((edu) => (
                    <div key={edu.id} className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] relative group">
                      <button onClick={() => removeArrayItem('education', edu.id)} className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <Input label="Institution" value={edu.institution || ''} onChange={e => updateArrayField('education', edu.id, 'institution', e.target.value)} />
                        <div className="flex gap-2">
                          <div className="flex-1"><Input label="Degree" value={edu.degree || ''} onChange={e => updateArrayField('education', edu.id, 'degree', e.target.value)} /></div>
                          <div className="flex-1"><Input label="Field" value={edu.field || ''} onChange={e => updateArrayField('education', edu.id, 'field', e.target.value)} /></div>
                        </div>
                        <Input label="Start Date" value={edu.startDate || ''} onChange={e => updateArrayField('education', edu.id, 'startDate', e.target.value)} />
                        <Input label="End Date" value={edu.endDate || ''} onChange={e => updateArrayField('education', edu.id, 'endDate', e.target.value)} />
                      </div>
                      <Input label="Description / Honors (Optional)" value={edu.description || ''} onChange={e => updateArrayField('education', edu.id, 'description', e.target.value)} />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addArrayItem('education')} className="w-full border-dashed">
                    <Plus className="h-4 w-4 mr-2" /> Add Education
                  </Button>
                </div>
              )}

              {sectionId === 'projects' && (
                <div className="space-y-4">
                  {(content.projects || []).map((proj) => (
                    <div key={proj.id} className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] relative group">
                      <button onClick={() => removeArrayItem('projects', proj.id)} className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <Input label="Project Title" value={proj.title || ''} onChange={e => updateArrayField('projects', proj.id, 'title', e.target.value)} />
                        <Input label="Technologies (comma separated)" value={proj.technologies || ''} onChange={e => updateArrayField('projects', proj.id, 'technologies', e.target.value)} />
                      </div>
                      <div className="mb-4">
                        <Input label="Project URL" value={proj.url || ''} onChange={e => updateArrayField('projects', proj.id, 'url', e.target.value)} />
                      </div>
                      <div className="flex justify-between mb-1">
                        <label className="text-sm font-medium text-[var(--text-primary)]">Description</label>
                        <Button variant="ghost" size="sm" onClick={() => onAIAssist(proj.description, (res) => updateArrayField('projects', proj.id, 'description', res))} className="h-6 px-2 text-xs text-indigo-600">
                          <Sparkles className="h-3 w-3 mr-1" /> AI Improve
                        </Button>
                      </div>
                      <textarea
                        value={proj.description || ''}
                        onChange={e => updateArrayField('projects', proj.id, 'description', e.target.value)}
                        className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm min-h-[80px]"
                      />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addArrayItem('projects')} className="w-full border-dashed">
                    <Plus className="h-4 w-4 mr-2" /> Add Project
                  </Button>
                </div>
              )}

              {sectionId === 'skills' && (
                <div className="space-y-4">
                  {(content.skills || []).map((skill) => (
                    <div key={skill.id} className="flex gap-4 items-start relative group">
                      <div className="w-1/3">
                        <Input placeholder="e.g. Languages" value={skill.category || ''} onChange={e => updateArrayField('skills', skill.id, 'category', e.target.value)} />
                      </div>
                      <div className="flex-1">
                        <Input placeholder="JavaScript, Python, C++" value={skill.items || ''} onChange={e => updateArrayField('skills', skill.id, 'items', e.target.value)} />
                      </div>
                      <button onClick={() => removeArrayItem('skills', skill.id)} className="p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 mt-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addArrayItem('skills')} className="w-full border-dashed">
                    <Plus className="h-4 w-4 mr-2" /> Add Skill Group
                  </Button>
                </div>
              )}

            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
