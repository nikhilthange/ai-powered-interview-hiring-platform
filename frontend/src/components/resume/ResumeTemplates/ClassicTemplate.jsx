import React from 'react';

export default function ClassicTemplate({ data }) {
  const { personalInfo, summary, experience, education, skills, certifications, achievements, languages, interests, references, sectionOrder } = data;

  const renderSection = (sectionName) => {
    switch (sectionName) {
      case 'summary':
        if (!summary) {
          return (
            <div key="summary" className="mb-6 opacity-40">
              <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">Professional Summary</h2>
              <p className="text-[13px] text-slate-500 italic">Your summary will appear here once you add it in the editor.</p>
            </div>
          );
        }
        return (
          <div key="summary" className="mb-6">
            <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">Professional Summary</h2>
            <p className="text-[13px] leading-relaxed text-slate-800 whitespace-pre-line">{summary}</p>
          </div>
        );
      
      case 'experience':
        if (!experience?.length) {
          return (
            <div key="experience" className="mb-6 opacity-40">
              <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">Experience</h2>
              <p className="text-[13px] text-slate-500 italic">Your experience will appear here once you add it in the editor.</p>
            </div>
          );
        }
        return (
          <div key="experience" className="mb-6">
            <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">Experience</h2>
            <div className="space-y-4">
              {experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div>
                      <span className="font-bold text-[14px] text-slate-900">{exp.position}</span>
                      {exp.company && <span className="mx-1.5 text-slate-400">|</span>}
                      <span className="font-semibold text-[13px] text-slate-800">{exp.company}</span>
                    </div>
                    <span className="text-[12px] font-medium text-slate-600 whitespace-nowrap">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[13px] leading-relaxed text-slate-700 whitespace-pre-wrap list-outside">
                    {exp.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        if (!education?.length) {
          return (
            <div key="education" className="mb-6 opacity-40">
              <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">Education</h2>
              <p className="text-[13px] text-slate-500 italic">Your education will appear here once you add it in the editor.</p>
            </div>
          );
        }
        return (
          <div key="education" className="mb-6">
            <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">Education</h2>
            <div className="space-y-3">
              {education.map(edu => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-[14px] text-slate-900">{edu.institution}</span>
                    <span className="text-[12px] font-medium text-slate-600">{edu.startDate} - {edu.current ? 'Present' : edu.endDate}</span>
                  </div>
                  <div className="text-[13px] text-slate-800 font-medium">
                    {edu.degree} in {edu.field}
                  </div>
                  {edu.description && (
                    <div className="text-[12px] mt-1 text-slate-600 leading-relaxed whitespace-pre-wrap">{edu.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        if (!data.projects?.length) {
          return (
            <div key="projects" className="mb-6 opacity-40">
              <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">Projects</h2>
              <p className="text-[13px] text-slate-500 italic">Your projects will appear here once you add them in the editor.</p>
            </div>
          );
        }
        return (
          <div key="projects" className="mb-6">
            <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">Projects</h2>
            <div className="space-y-4">
              {data.projects.map(proj => (
                <div key={proj.id}>
                  <div className="flex items-baseline mb-1">
                    <span className="font-bold text-[14px] text-slate-900">{proj.title}</span>
                    {proj.technologies && (
                      <>
                        <span className="mx-1.5 text-slate-400">|</span>
                        <span className="text-[13px] italic text-slate-700">{proj.technologies}</span>
                      </>
                    )}
                    {proj.url && <a href={proj.url} className="text-[12px] text-slate-500 ml-2 hover:text-slate-900 underline" target="_blank" rel="noreferrer">Link</a>}
                  </div>
                  <div className="text-[13px] leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {proj.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        if (!skills?.length) {
          return (
            <div key="skills" className="mb-6 opacity-40">
              <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">Skills</h2>
              <p className="text-[13px] text-slate-500 italic">Your skills will appear here once you add them in the editor.</p>
            </div>
          );
        }
        return (
          <div key="skills" className="mb-6">
            <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">Skills</h2>
            <div className="space-y-1.5">
              {skills.map(skill => (
                <div key={skill.id} className="text-[13px] text-slate-800">
                  <span className="font-bold text-slate-900 mr-2">{skill.category}:</span>
                  <span>{skill.items}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (!certifications?.length) {
          return (
            <div key="certifications" className="mb-6 opacity-40">
              <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">Certifications</h2>
              <p className="text-[13px] text-slate-500 italic">Your certifications will appear here once you add them in the editor.</p>
            </div>
          );
        }
        return (
          <div key="certifications" className="mb-6">
            <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">Certifications</h2>
            <div className="space-y-2">
              {certifications.map(cert => (
                <div key={cert.id} className="flex justify-between items-baseline text-[13px]">
                  <div>
                    <span className="font-bold text-slate-900">{cert.title}</span>
                    {cert.issuer && <span className="text-slate-700"> - {cert.issuer}</span>}
                    {cert.url && <a href={cert.url} className="ml-2 text-slate-500 hover:text-slate-900 underline" target="_blank" rel="noreferrer">[View]</a>}
                  </div>
                  <span className="text-[12px] font-medium text-slate-600 whitespace-nowrap">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        if (!achievements?.length) {
          return (
            <div key="achievements" className="mb-6 opacity-40">
              <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">Achievements</h2>
              <p className="text-[13px] text-slate-500 italic">Your achievements will appear here once you add them in the editor.</p>
            </div>
          );
        }
        return (
          <div key="achievements" className="mb-6">
            <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">Achievements</h2>
            <div className="space-y-3">
              {achievements.map(ach => (
                <div key={ach.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-[13px] text-slate-900">{ach.title}</span>
                    <span className="text-[12px] font-medium text-slate-600 whitespace-nowrap">{ach.date}</span>
                  </div>
                  {ach.description && <div className="text-[13px] leading-relaxed text-slate-700">{ach.description}</div>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'languages':
        if (!languages?.length) {
          return (
            <div key="languages" className="mb-6 opacity-40">
              <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">Languages</h2>
              <p className="text-[13px] text-slate-500 italic">Your languages will appear here once you add them in the editor.</p>
            </div>
          );
        }
        return (
          <div key="languages" className="mb-6">
            <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">Languages</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {languages.map(lang => (
                <div key={lang.id} className="text-[13px] text-slate-800">
                  <span className="font-bold text-slate-900 mr-2">{lang.language}:</span>
                  <span>{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'interests':
        if (!interests?.length) {
          return (
            <div key="interests" className="mb-6 opacity-40">
              <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">Interests</h2>
              <p className="text-[13px] text-slate-500 italic">Your interests will appear here once you add them in the editor.</p>
            </div>
          );
        }
        return (
          <div key="interests" className="mb-6">
            <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">Interests</h2>
            <div className="text-[13px] text-slate-700 leading-relaxed">
              {interests.map(int => int.items).join(', ')}
            </div>
          </div>
        );

      case 'references':
        if (!references?.length) {
          return (
            <div key="references" className="mb-6 opacity-40">
              <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">References</h2>
              <p className="text-[13px] text-slate-500 italic">Your references will appear here once you add them in the editor.</p>
            </div>
          );
        }
        return (
          <div key="references" className="mb-6">
            <h2 className="text-[15px] font-bold uppercase tracking-widest text-slate-900 border-b-2 border-slate-800 pb-1 mb-3">References</h2>
            <div className="grid grid-cols-2 gap-4">
              {references.map(ref => (
                <div key={ref.id} className="text-[13px] text-slate-800">
                  <div className="font-bold text-slate-900">{ref.name}</div>
                  <div className="text-slate-700">{ref.position}{ref.company && `, ${ref.company}`}</div>
                  <div className="text-slate-600">{ref.contactInfo}</div>
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
    <div className="w-full h-full bg-white p-8 sm:p-12 font-serif text-slate-800" style={{ minHeight: '1056px', width: '816px' }}>
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-slate-800 pb-5">
        <h1 className="text-4xl font-bold uppercase tracking-widest mb-3 text-slate-900">{personalInfo?.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-[13px] text-slate-600 font-medium">
          {personalInfo?.email && <a href={`mailto:${personalInfo.email}`} className="hover:text-slate-900 transition-colors">{personalInfo.email}</a>}
          {personalInfo?.phone && <a href={`tel:${personalInfo.phone}`} className="hover:text-slate-900 transition-colors">{personalInfo.phone}</a>}
          {personalInfo?.location && <span>{personalInfo.location}</span>}
        </div>
        <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-[13px] mt-2 text-slate-600 font-medium">
          {personalInfo?.linkedin && <a href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a>}
          {personalInfo?.github && <a href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">{personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}</a>}
          {personalInfo?.website && <a href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">{personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}</a>}
        </div>
      </div>

      {/* Sections based on order */}
      {(() => {
        const defaultOrder = ['summary', 'experience', 'education', 'projects', 'skills', 'certifications', 'achievements', 'languages', 'interests', 'references'];
        const savedOrder = Array.isArray(sectionOrder) ? sectionOrder : [];
        const missingSections = defaultOrder.filter(sec => !savedOrder.includes(sec));
        const finalOrder = savedOrder.length > 0 ? [...savedOrder, ...missingSections] : defaultOrder;
        return finalOrder.map(renderSection);
      })()}
    </div>
  );
}
