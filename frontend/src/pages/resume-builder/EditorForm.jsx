import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowUp, ArrowDown } from 'lucide-react';
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

const SectionWrapper = ({ id, title, children, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] overflow-hidden mb-4 shadow-sm transition-shadow hover:shadow-md shrink-0">
      <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <button onClick={onMoveUp} disabled={isFirst} className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed">
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button onClick={onMoveDown} disabled={isLast} className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed">
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <h3 className="font-semibold text-[var(--text-primary)] capitalize">{title}</h3>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 transition-colors">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>
      {isOpen && <div className="p-5">{children}</div>}
    </div>
  );
};

export default function EditorForm({ resumeData, onChange, onAIAssist }) {
  const { title, template, content } = resumeData;
  const defaultOrder = ['summary', 'experience', 'education', 'projects', 'skills', 'certifications', 'achievements', 'languages', 'interests', 'references'];
  const sectionOrder = defaultOrder; // FORCING default order to bypass corrupted data

  const moveSection = (index, direction) => {
    const newOrder = [...sectionOrder];
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      onChange('content', { ...content, sectionOrder: newOrder });
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
      <PersonalInfoSection data={content.personalInfo} onChange={updatePersonalInfo} />

      {sectionOrder.map((sectionId, index) => {
        const children = renderSectionContent(sectionId);
        if (!children) return null;
        return (
          <SectionWrapper 
            key={sectionId} 
            id={sectionId} 
            title={sectionId}
            onMoveUp={() => moveSection(index, -1)}
            onMoveDown={() => moveSection(index, 1)}
            isFirst={index === 0}
            isLast={index === sectionOrder.length - 1}
          >
            {children}
          </SectionWrapper>
        );
      })}
    </div>
  );
}
