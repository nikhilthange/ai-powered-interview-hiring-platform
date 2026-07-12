
export default function ProfessionalTemplate({ data }) {
  const { personalInfo, summary, experience, education, skills, projects, certifications, achievements, languages, interests, references, sectionOrder } = data;

  const SectionTitle = ({ title }) => (
    <div className="flex items-center mb-4">
      <h2 className="text-[14px] font-bold uppercase tracking-wider text-slate-800 shrink-0 pr-4">{title}</h2>
      <div className="h-px bg-slate-300 w-full"></div>
    </div>
  );

  const renderSection = (sectionName) => {
    switch (sectionName) {
      case 'summary':
        if (!summary) {
          return (
            <div key="summary" className="mb-6 opacity-40">
              <SectionTitle title="Professional Summary" />
              <p className="text-[13px] leading-relaxed text-slate-500 italic">Your summary will appear here once you add it in the editor.</p>
            </div>
          );
        }
        return (
          <div key="summary" className="mb-6">
            <SectionTitle title="Professional Summary" />
            <p className="text-[13px] leading-relaxed text-slate-700 whitespace-pre-wrap">{summary}</p>
          </div>
        );
      
      case 'experience':
        if (!experience?.length) {
          return (
            <div key="experience" className="mb-6 opacity-40">
              <SectionTitle title="Professional Experience" />
              <p className="text-[13px] leading-relaxed text-slate-500 italic">Your experience will appear here once you add it in the editor.</p>
            </div>
          );
        }
        return (
          <div key="experience" className="mb-6">
            <SectionTitle title="Professional Experience" />
            <div className="space-y-5">
              {experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-[14px] text-slate-900">{exp.position}</span>
                    <span className="font-medium text-[12px] text-slate-500 whitespace-nowrap">
                      {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[13px] text-indigo-600 font-bold mb-1.5">{exp.company}</div>
                  <div className="text-[13px] leading-relaxed text-slate-700 whitespace-pre-wrap ml-3 list-outside">
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
              <SectionTitle title="Education" />
              <p className="text-[13px] leading-relaxed text-slate-500 italic">Your education will appear here once you add it in the editor.</p>
            </div>
          );
        }
        return (
          <div key="education" className="mb-6">
            <SectionTitle title="Education" />
            <div className="space-y-4">
              {education.map(edu => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-[14px] text-slate-900">{edu.institution}</span>
                    <span className="font-medium text-[12px] text-slate-500 whitespace-nowrap">
                      {edu.startDate} — {edu.current ? 'Present' : edu.endDate}
                    </span>
                  </div>
                  <div className="text-[13px] text-slate-800">
                    <span className="font-bold text-indigo-600">{edu.degree}</span> {edu.field && <span className="font-medium">in {edu.field}</span>}
                  </div>
                  {edu.description && (
                    <div className="text-[12px] mt-1.5 text-slate-600 leading-relaxed whitespace-pre-wrap ml-3">{edu.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        if (!projects?.length) {
          return (
            <div key="projects" className="mb-6 opacity-40">
              <SectionTitle title="Key Projects" />
              <p className="text-[13px] leading-relaxed text-slate-500 italic">Your projects will appear here once you add them in the editor.</p>
            </div>
          );
        }
        return (
          <div key="projects" className="mb-6">
            <SectionTitle title="Key Projects" />
            <div className="space-y-4">
              {projects.map(proj => (
                <div key={proj.id}>
                  <div className="flex items-baseline mb-1">
                    <span className="font-bold text-[14px] text-slate-900">{proj.title}</span>
                    {proj.technologies && <span className="text-[12px] text-indigo-600 font-bold ml-2 border-l border-slate-300 pl-2">{proj.technologies}</span>}
                    {proj.url && <a href={proj.url} className="text-[11px] ml-auto text-slate-500 hover:text-slate-900 underline" target="_blank" rel="noreferrer">View Details</a>}
                  </div>
                  <div className="text-[13px] leading-relaxed text-slate-700 whitespace-pre-wrap ml-3">
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
              <SectionTitle title="Core Competencies" />
              <p className="text-[13px] leading-relaxed text-slate-500 italic">Your skills will appear here once you add them in the editor.</p>
            </div>
          );
        }
        return (
          <div key="skills" className="mb-6">
            <SectionTitle title="Core Competencies" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {skills.map(skill => (
                <div key={skill.id} className="text-[13px]">
                  <span className="font-bold text-slate-900 mr-2">{skill.category}:</span>
                  <span className="text-slate-700">{skill.items}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (!certifications?.length) {
          return (
            <div key="certifications" className="mb-6 opacity-40">
              <SectionTitle title="Certifications" />
              <p className="text-[13px] leading-relaxed text-slate-500 italic">Your certifications will appear here once you add them in the editor.</p>
            </div>
          );
        }
        return (
          <div key="certifications" className="mb-6">
            <SectionTitle title="Certifications" />
            <div className="space-y-2.5">
              {certifications.map(cert => (
                <div key={cert.id} className="flex justify-between items-baseline text-[13px]">
                  <div>
                    <span className="font-bold text-slate-900">{cert.title}</span>
                    {cert.issuer && <span className="text-slate-700"> — {cert.issuer}</span>}
                    {cert.url && <a href={cert.url} className="ml-2 text-[11px] text-slate-500 hover:text-slate-900 underline" target="_blank" rel="noreferrer">[View]</a>}
                  </div>
                  <span className="text-[12px] text-slate-500 font-medium">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        if (!achievements?.length) {
          return (
            <div key="achievements" className="mb-6 opacity-40">
              <SectionTitle title="Achievements" />
              <p className="text-[13px] leading-relaxed text-slate-500 italic">Your achievements will appear here once you add them in the editor.</p>
            </div>
          );
        }
        return (
          <div key="achievements" className="mb-6">
            <SectionTitle title="Achievements" />
            <div className="space-y-3.5">
              {achievements.map(ach => (
                <div key={ach.id}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-bold text-[13px] text-slate-900">{ach.title}</span>
                    <span className="text-[12px] text-slate-500 font-medium">{ach.date}</span>
                  </div>
                  {ach.description && <div className="text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed ml-3">{ach.description}</div>}
                </div>
              ))}
            </div>
          </div>
        );

      case 'languages':
        if (!languages?.length) {
          return (
            <div key="languages" className="mb-6 opacity-40">
              <SectionTitle title="Languages" />
              <p className="text-[13px] leading-relaxed text-slate-500 italic">Your languages will appear here once you add them in the editor.</p>
            </div>
          );
        }
        return (
          <div key="languages" className="mb-6">
            <SectionTitle title="Languages" />
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {languages.map(lang => (
                <div key={lang.id} className="text-[13px]">
                  <span className="font-bold text-slate-900">{lang.language}</span>
                  <span className="text-slate-600 ml-2 border-l border-slate-300 pl-2 font-medium">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'interests':
        if (!interests?.length) {
          return (
            <div key="interests" className="mb-6 opacity-40">
              <SectionTitle title="Interests" />
              <p className="text-[13px] leading-relaxed text-slate-500 italic">Your interests will appear here once you add them in the editor.</p>
            </div>
          );
        }
        return (
          <div key="interests" className="mb-6">
            <SectionTitle title="Interests" />
            <div className="text-[13px] text-slate-700 leading-relaxed font-medium">
              {interests.map(int => int.items).join('  •  ')}
            </div>
          </div>
        );

      case 'references':
        if (!references?.length) {
          return (
            <div key="references" className="mb-6 opacity-40">
              <SectionTitle title="References" />
              <p className="text-[13px] leading-relaxed text-slate-500 italic">Your references will appear here once you add them in the editor.</p>
            </div>
          );
        }
        return (
          <div key="references" className="mb-6">
            <SectionTitle title="References" />
            <div className="grid grid-cols-2 gap-6">
              {references.map(ref => (
                <div key={ref.id} className="text-[13px]">
                  <div className="font-bold text-slate-900">{ref.name}</div>
                  <div className="text-indigo-600 font-bold">{ref.position}{ref.company && `, ${ref.company}`}</div>
                  <div className="text-slate-600 mt-0.5">{ref.contactInfo}</div>
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
    <div className="w-full h-full bg-white p-10 font-sans text-slate-900" style={{ minHeight: '1056px', width: '816px' }}>
      {/* Header */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-slate-900 uppercase">{personalInfo?.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[13px] text-slate-600 font-medium">
          {personalInfo?.email && <a href={`mailto:${personalInfo.email}`} className="hover:text-indigo-600 transition-colors">{personalInfo.email}</a>}
          {personalInfo?.phone && <span className="text-slate-300">|</span>}
          {personalInfo?.phone && <a href={`tel:${personalInfo.phone}`} className="hover:text-indigo-600 transition-colors">{personalInfo.phone}</a>}
          {personalInfo?.location && <span className="text-slate-300">|</span>}
          {personalInfo?.location && <span>{personalInfo.location}</span>}
        </div>
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[13px] mt-2 text-indigo-700 font-medium">
          {personalInfo?.linkedin && <a href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} target="_blank" rel="noreferrer" className="hover:underline">{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a>}
          {personalInfo?.github && <span className="text-slate-300">|</span>}
          {personalInfo?.github && <a href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} target="_blank" rel="noreferrer" className="hover:underline">{personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}</a>}
          {personalInfo?.website && <span className="text-slate-300">|</span>}
          {personalInfo?.website && <a href={personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`} target="_blank" rel="noreferrer" className="hover:underline">{personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}</a>}
        </div>
      </div>

      <div className="px-2">
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
