import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Input from '../../components/ui/Input';
import { GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import PersonalInfoSection from '../../components/resume/PersonalInfoSection';
import SummarySection from '../../components/resume/SummarySection';
import ExperienceSection from '../../components/resume/ExperienceSection';
import EducationSection from '../../components/resume/EducationSection';
import ProjectsSection from '../../components/resume/ProjectsSection';
import SkillsSection from '../../components/resume/SkillsSection';
import CertificationsSection from '../../components/resume/CertificationsSection';
import AchievementsSection from '../../components/resume/AchievementsSection';
import LanguagesSection from '../../components/resume/LanguagesSection';
import InterestsSection from '../../components/resume/InterestsSection';
import ReferenceSection from '../../components/resume/ReferenceSection';
import ResumeTemplateSelector from '../../components/resume/ResumeTemplateSelector';

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
  const sectionOrder = content.sectionOrder || ['summary', 'experience', 'education', 'projects', 'skills', 'certifications', 'achievements', 'languages', 'interests', 'references'];

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

  const renderSectionContent = (sectionId) => {
    switch (sectionId) {
      case 'summary':
        return <SummarySection data={content.summary} onChange={(val) => onChange('content', { ...content, summary: val })} onAIAssist={onAIAssist} />;
      case 'experience':
        return <ExperienceSection data={content.experience} onUpdate={updateArrayField} onAdd={addArrayItem} onRemove={removeArrayItem} onAIAssist={onAIAssist} />;
      case 'education':
        return <EducationSection data={content.education} onUpdate={updateArrayField} onAdd={addArrayItem} onRemove={removeArrayItem} />;
      case 'projects':
        return <ProjectsSection data={content.projects} onUpdate={updateArrayField} onAdd={addArrayItem} onRemove={removeArrayItem} onAIAssist={onAIAssist} />;
      case 'skills':
        return <SkillsSection data={content.skills} onUpdate={updateArrayField} onAdd={addArrayItem} onRemove={removeArrayItem} />;
      case 'certifications':
        return <CertificationsSection data={content.certifications} onUpdate={updateArrayField} onAdd={addArrayItem} onRemove={removeArrayItem} />;
      case 'achievements':
        return <AchievementsSection data={content.achievements} onUpdate={updateArrayField} onAdd={addArrayItem} onRemove={removeArrayItem} />;
      case 'languages':
        return <LanguagesSection data={content.languages} onUpdate={updateArrayField} onAdd={addArrayItem} onRemove={removeArrayItem} />;
      case 'interests':
        return <InterestsSection data={content.interests} onUpdate={updateArrayField} onAdd={addArrayItem} onRemove={removeArrayItem} />;
      case 'references':
        return <ReferenceSection data={content.references} onUpdate={updateArrayField} onAdd={addArrayItem} onRemove={removeArrayItem} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-2 pb-20 custom-scrollbar">
      
      <ResumeTemplateSelector title={title} template={template} onChange={onChange} />

      {/* Personal Info */}
      <PersonalInfoSection data={content.personalInfo} onChange={updatePersonalInfo} />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
          {sectionOrder.map((sectionId) => (
            <SortableItem key={sectionId} id={sectionId} title={sectionId}>
              {renderSectionContent(sectionId)}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
