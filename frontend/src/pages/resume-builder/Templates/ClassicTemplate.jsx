import React from 'react';

export default function ClassicTemplate({ data }) {
  const { personalInfo, summary, experience, education, skills, projects, sectionOrder } = data;

  const renderSection = (sectionName) => {
    switch (sectionName) {
      case 'summary':
        if (!summary) return null;
        return (
          <div key="summary" className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black mb-2 pb-1">Professional Summary</h2>
            <p className="text-[13px] leading-relaxed text-black">{summary}</p>
          </div>
        );
      
      case 'experience':
        if (!experience?.length) return null;
        return (
          <div key="experience" className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black mb-3 pb-1">Experience</h2>
            <div className="space-y-4">
              {experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1 text-black">
                    <div>
                      <span className="font-bold text-[14px]">{exp.position}</span>
                      <span className="mx-1">|</span>
                      <span className="font-semibold text-[13px]">{exp.company}</span>
                    </div>
                    <span className="text-[12px] whitespace-nowrap">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[13px] leading-relaxed text-black whitespace-pre-wrap ml-4 list-outside">
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
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black mb-3 pb-1">Education</h2>
            <div className="space-y-3">
              {education.map(edu => (
                <div key={edu.id} className="text-black">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="font-bold text-[14px]">{edu.institution}</span>
                    <span className="text-[12px]">{edu.startDate} - {edu.current ? 'Present' : edu.endDate}</span>
                  </div>
                  <div className="text-[13px]">
                    {edu.degree} in {edu.field}
                  </div>
                  {edu.description && (
                    <div className="text-[12px] mt-1 text-gray-700">{edu.description}</div>
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
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black mb-3 pb-1">Projects</h2>
            <div className="space-y-3">
              {projects.map(proj => (
                <div key={proj.id} className="text-black">
                  <div className="mb-1">
                    <span className="font-bold text-[14px]">{proj.title}</span>
                    {proj.technologies && <span className="text-[13px] italic mx-2">| {proj.technologies}</span>}
                    {proj.url && <a href={proj.url} className="text-[12px] text-blue-600 ml-2" target="_blank" rel="noreferrer">Link</a>}
                  </div>
                  <div className="text-[13px] leading-relaxed ml-4">
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
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black mb-3 pb-1">Skills</h2>
            <div className="space-y-1">
              {skills.map(skill => (
                <div key={skill.id} className="text-[13px] text-black">
                  <span className="font-bold mr-2">{skill.category}:</span>
                  <span>{skill.items}</span>
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
    <div className="w-full h-full bg-white p-8 sm:p-12 font-serif text-black" style={{ minHeight: '1056px', width: '816px' }}>
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-3xl font-bold uppercase tracking-wide mb-2 text-black">{personalInfo?.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[13px] text-black">
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && <span>{personalInfo.phone}</span>}
          {personalInfo?.location && <span>{personalInfo.location}</span>}
        </div>
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[13px] mt-1 text-black">
          {personalInfo?.linkedin && <span>{personalInfo.linkedin}</span>}
          {personalInfo?.github && <span>{personalInfo.github}</span>}
          {personalInfo?.website && <span>{personalInfo.website}</span>}
        </div>
      </div>

      {/* Sections based on order */}
      {(sectionOrder || ['summary', 'experience', 'education', 'projects', 'skills']).map(renderSection)}
    </div>
  );
}
