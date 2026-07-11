import React from 'react';

export default function MinimalTemplate({ data }) {
  const { personalInfo, summary, experience, education, skills, projects, certifications, achievements, languages, interests, references, sectionOrder } = data;

  const SectionTitle = ({ title }) => (
    <h2 className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-4">{title}</h2>
  );

  const renderSection = (sectionName) => {
    switch (sectionName) {
      case 'summary':
        return (
          <div key="summary" className="mb-8">
            <SectionTitle title="Summary" />
            <p className="text-[13px] leading-relaxed text-gray-800 whitespace-pre-wrap">{summary || 'No summary provided.'}</p>
          </div>
        );
      
      case 'experience':
        return (
          <div key="experience" className="mb-8">
            <SectionTitle title="Experience" />
            {!experience?.length && <p className="text-[13px] text-gray-400 italic">No experience added yet.</p>}
            <div className="space-y-6">
              {experience?.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-[14px] text-gray-900">{exp.company}</span>
                    <span className="text-[11px] text-gray-500 uppercase tracking-wide">
                      {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[13px] italic text-gray-600 mb-2">{exp.position}</div>
                  <div className="text-[13px] leading-relaxed text-gray-800 whitespace-pre-wrap ml-2 list-outside">
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
            <div key="education" className="mb-6 opacity-50">
              <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-3">Education</h2>
              <p className="text-gray-400 italic">Your education will appear here once you add it in the editor.</p>
            </div>
          );
        }
        return (
          <div key="education" className="mb-8">
            <SectionTitle title="Education" />
            <div className="space-y-4">
              {education.map(edu => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-[14px] text-gray-900">{edu.institution}</span>
                    <span className="text-[11px] text-gray-500 uppercase tracking-wide">
                      {edu.startDate} — {edu.current ? 'Present' : edu.endDate}
                    </span>
                  </div>
                  <div className="text-[13px] text-gray-800">
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </div>
                  {edu.description && (
                    <div className="text-[12px] mt-1 text-gray-600 whitespace-pre-wrap">{edu.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        if (!projects?.length) return null;
        return (
          <div key="projects" className="mb-8">
            <SectionTitle title="Projects" />
            <div className="space-y-5">
              {projects.map(proj => (
                <div key={proj.id}>
                  <div className="flex items-baseline mb-1">
                    <span className="font-bold text-[14px] text-gray-900">{proj.title}</span>
                    {proj.technologies && <span className="text-[12px] text-gray-500 ml-2">({proj.technologies})</span>}
                    {proj.url && <a href={proj.url} className="text-[11px] ml-auto text-blue-600 hover:underline" target="_blank" rel="noreferrer">View Project</a>}
                  </div>
                  <div className="text-[13px] leading-relaxed text-gray-800 whitespace-pre-wrap ml-2">
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
          <div key="skills" className="mb-8">
            <SectionTitle title="Skills" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {skills.map(skill => (
                <div key={skill.id} className="text-[13px]">
                  <span className="font-medium text-gray-900 mr-2">{skill.category}:</span>
                  <span className="text-gray-700">{skill.items}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (!certifications?.length) return null;
        return (
          <div key="certifications" className="mb-8">
            <SectionTitle title="Certifications" />
            <div className="space-y-2">
              {certifications.map(cert => (
                <div key={cert.id} className="flex justify-between text-[13px]">
                  <div>
                    <span className="font-medium text-gray-900">{cert.title}</span>
                    {cert.issuer && <span className="text-gray-600">, {cert.issuer}</span>}
                    {cert.url && <a href={cert.url} className="ml-2 text-[11px] text-blue-600 hover:underline" target="_blank" rel="noreferrer">Link</a>}
                  </div>
                  <span className="text-[12px] text-gray-500">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        if (!achievements?.length) return null;
        return (
          <div key="achievements" className="mb-8">
            <SectionTitle title="Achievements" />
            <div className="space-y-3">
              {achievements.map(ach => (
                <div key={ach.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-medium text-[13px] text-gray-900">{ach.title}</span>
                    <span className="text-[11px] text-gray-500">{ach.date}</span>
                  </div>
                  {ach.description && <div className="text-[13px] text-gray-700 whitespace-pre-wrap">{ach.description}</div>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'languages':
        if (!languages?.length) return null;
        return (
          <div key="languages" className="mb-8">
            <SectionTitle title="Languages" />
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {languages.map(lang => (
                <div key={lang.id} className="text-[13px]">
                  <span className="font-medium text-gray-900">{lang.language}</span>
                  <span className="text-gray-500 ml-1">({lang.proficiency})</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'interests':
        if (!interests?.length) return null;
        return (
          <div key="interests" className="mb-8">
            <SectionTitle title="Interests" />
            <div className="text-[13px] text-gray-800">
              {interests.map(int => int.items).join(', ')}
            </div>
          </div>
        );

      case 'references':
        if (!references?.length) return null;
        return (
          <div key="references" className="mb-8">
            <SectionTitle title="References" />
            <div className="grid grid-cols-2 gap-4">
              {references.map(ref => (
                <div key={ref.id} className="text-[13px]">
                  <div className="font-medium text-gray-900">{ref.name}</div>
                  <div className="text-gray-600">{ref.position}{ref.company && `, ${ref.company}`}</div>
                  <div className="text-gray-500">{ref.contactInfo}</div>
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
    <div className="w-full h-full bg-white p-12 font-sans text-gray-900" style={{ minHeight: '1056px', width: '816px' }}>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-light tracking-tight mb-4 text-gray-900">{personalInfo?.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-gray-500 tracking-wide uppercase">
          {personalInfo?.email && <a href={`mailto:${personalInfo.email}`} className="hover:text-gray-900 transition-colors">{personalInfo.email}</a>}
          {personalInfo?.phone && <a href={`tel:${personalInfo.phone}`} className="hover:text-gray-900 transition-colors">{personalInfo.phone}</a>}
          {personalInfo?.location && <span>{personalInfo.location}</span>}
          {personalInfo?.linkedin && <a href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">LinkedIn</a>}
          {personalInfo?.github && <a href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">GitHub</a>}
          {personalInfo?.website && <a href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">Portfolio</a>}
        </div>
      </div>

      <div>
        {/* Sections based on order */}
        {(() => {
          const defaultOrder = ['summary', 'experience', 'education', 'projects', 'skills', 'certifications', 'achievements', 'languages', 'interests', 'references'];
          const savedOrder = Array.isArray(sectionOrder) ? sectionOrder : [];
          const missingSections = defaultOrder.filter(sec => !savedOrder.includes(sec));
          const finalOrder = savedOrder.length > 0 ? [...savedOrder, ...missingSections] : defaultOrder;
          return finalOrder.map(renderSection);
        })()}
      </div>
    </div>
  );
}
