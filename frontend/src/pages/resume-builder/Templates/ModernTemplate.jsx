import React from 'react';

export default function ModernTemplate({ data }) {
  const { personalInfo, summary, experience, education, skills, projects, sectionOrder } = data;

  const renderSection = (sectionName) => {
    switch (sectionName) {
      case 'summary':
        if (!summary) return null;
        return (
          <div key="summary" className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-3">Profile</h2>
            <p className="text-[13px] leading-relaxed text-gray-700">{summary}</p>
          </div>
        );
      
      case 'experience':
        if (!experience?.length) return null;
        return (
          <div key="experience" className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4">Experience</h2>
            <div className="space-y-5">
              {experience.map(exp => (
                <div key={exp.id} className="relative pl-4 border-l-2 border-indigo-100">
                  <div className="absolute w-2 h-2 bg-indigo-500 rounded-full -left-[5px] top-1.5"></div>
                  <div className="mb-1">
                    <span className="font-bold text-[14px] text-gray-900">{exp.position}</span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span className="font-medium text-[13px] text-indigo-600">{exp.company}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-2">
                    {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                  </div>
                  <div className="text-[13px] leading-relaxed text-gray-700 whitespace-pre-wrap ml-2">
                    {exp.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        if (!education?.length) return null;
        return (
          <div key="education" className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4">Education</h2>
            <div className="space-y-4">
              {education.map(edu => (
                <div key={edu.id} className="relative pl-4 border-l-2 border-indigo-100">
                   <div className="absolute w-2 h-2 bg-indigo-500 rounded-full -left-[5px] top-1.5"></div>
                  <div className="mb-0.5">
                    <span className="font-bold text-[14px] text-gray-900">{edu.institution}</span>
                  </div>
                  <div className="text-[13px] text-gray-700 font-medium">
                    {edu.degree} in {edu.field}
                  </div>
                  <div className="text-[11px] text-gray-500 uppercase tracking-wide mt-1">
                    {edu.startDate} — {edu.current ? 'Present' : edu.endDate}
                  </div>
                  {edu.description && (
                    <div className="text-[12px] mt-1 text-gray-600">{edu.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        if (!projects?.length) return null;
        return (
          <div key="projects" className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4">Projects</h2>
            <div className="grid grid-cols-2 gap-4">
              {projects.map(proj => (
                <div key={proj.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-2 flex items-start justify-between">
                    <span className="font-bold text-[13px] text-gray-900">{proj.title}</span>
                    {proj.url && <a href={proj.url} className="text-[11px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded" target="_blank" rel="noreferrer">Link</a>}
                  </div>
                  {proj.technologies && <div className="text-[11px] text-indigo-600 font-medium mb-2">{proj.technologies}</div>}
                  <div className="text-[12px] leading-relaxed text-gray-600">
                    {proj.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        if (!skills?.length) return null;
        return (
          <div key="skills" className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <div key={skill.id} className="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-[12px]">
                  <span className="font-bold text-gray-800 mr-1">{skill.category}:</span>
                  <span className="text-gray-600">{skill.items}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-white font-sans text-gray-800" style={{ minHeight: '1056px', width: '816px' }}>
      {/* Header */}
      <div className="bg-gray-900 text-white p-10 mb-8">
        <h1 className="text-4xl font-black tracking-tight mb-3">{personalInfo?.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-gray-300 font-medium">
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && <span>{personalInfo.phone}</span>}
          {personalInfo?.location && <span>{personalInfo.location}</span>}
          {personalInfo?.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo?.website && <span>{personalInfo.website}</span>}
        </div>
      </div>

      <div className="px-10 pb-10">
        {/* Sections based on order */}
        {(sectionOrder || ['summary', 'experience', 'education', 'projects', 'skills']).map(renderSection)}
      </div>
    </div>
  );
}
