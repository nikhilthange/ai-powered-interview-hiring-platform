import React from 'react';

export default function ClassicTemplate({ data }) {
  const { personalInfo, summary, experience, education, skills, certifications, achievements, languages, interests, references, sectionOrder } = data;

  const renderSection = (sectionName) => {
    switch (sectionName) {
      case 'summary':
        if (!summary) return null;
        return (
          <div key="summary" className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black mb-2 pb-1">Professional Summary</h2>
            <p className="text-[13px] leading-relaxed text-black whitespace-pre-wrap">{summary}</p>
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
                    <div className="text-[12px] mt-1 text-gray-700 whitespace-pre-wrap">{edu.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        if (!data.projects?.length) return null;
        return (
          <div key="projects" className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black mb-3 pb-1">Projects</h2>
            <div className="space-y-3">
              {data.projects.map(proj => (
                <div key={proj.id} className="text-black">
                  <div className="mb-1">
                    <span className="font-bold text-[14px]">{proj.title}</span>
                    {proj.technologies && <span className="text-[13px] italic mx-2">| {proj.technologies}</span>}
                    {proj.url && <a href={proj.url} className="text-[12px] text-blue-600 ml-2 hover:underline" target="_blank" rel="noreferrer">Link</a>}
                  </div>
                  <div className="text-[13px] leading-relaxed ml-4 whitespace-pre-wrap">
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

      case 'certifications':
        if (!certifications?.length) return null;
        return (
          <div key="certifications" className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black mb-3 pb-1">Certifications</h2>
            <div className="space-y-2">
              {certifications.map(cert => (
                <div key={cert.id} className="flex justify-between items-start text-[13px] text-black">
                  <div>
                    <span className="font-bold">{cert.title}</span>
                    {cert.issuer && <span> - {cert.issuer}</span>}
                    {cert.url && <a href={cert.url} className="ml-2 text-blue-600 hover:underline" target="_blank" rel="noreferrer">[View]</a>}
                  </div>
                  <span className="text-[12px] whitespace-nowrap">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        if (!achievements?.length) return null;
        return (
          <div key="achievements" className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black mb-3 pb-1">Achievements</h2>
            <div className="space-y-2">
              {achievements.map(ach => (
                <div key={ach.id} className="text-black">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-[13px]">{ach.title}</span>
                    <span className="text-[12px] whitespace-nowrap">{ach.date}</span>
                  </div>
                  {ach.description && <div className="text-[13px] mt-0.5">{ach.description}</div>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'languages':
        if (!languages?.length) return null;
        return (
          <div key="languages" className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black mb-3 pb-1">Languages</h2>
            <div className="grid grid-cols-2 gap-2">
              {languages.map(lang => (
                <div key={lang.id} className="text-[13px] text-black">
                  <span className="font-bold mr-2">{lang.language}:</span>
                  <span>{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'interests':
        if (!interests?.length) return null;
        return (
          <div key="interests" className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black mb-3 pb-1">Interests</h2>
            <div className="text-[13px] text-black">
              {interests.map(int => int.items).join(', ')}
            </div>
          </div>
        );

      case 'references':
        if (!references?.length) return null;
        return (
          <div key="references" className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-black mb-3 pb-1">References</h2>
            <div className="grid grid-cols-2 gap-4">
              {references.map(ref => (
                <div key={ref.id} className="text-black text-[13px]">
                  <div className="font-bold">{ref.name}</div>
                  <div>{ref.position}{ref.company && `, ${ref.company}`}</div>
                  <div>{ref.contactInfo}</div>
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
          {personalInfo?.email && <a href={`mailto:${personalInfo.email}`} className="hover:underline">{personalInfo.email}</a>}
          {personalInfo?.phone && <a href={`tel:${personalInfo.phone}`} className="hover:underline">{personalInfo.phone}</a>}
          {personalInfo?.location && <span>{personalInfo.location}</span>}
        </div>
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[13px] mt-1 text-black">
          {personalInfo?.linkedin && <a href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a>}
          {personalInfo?.github && <a href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}</a>}
          {personalInfo?.website && <a href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}</a>}
        </div>
      </div>

      {/* Sections based on order */}
      {(sectionOrder || ['summary', 'experience', 'education', 'projects', 'skills', 'certifications', 'achievements', 'languages', 'interests', 'references']).map(renderSection)}
    </div>
  );
}
