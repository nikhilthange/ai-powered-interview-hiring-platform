import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export const exportAsDocx = async (resumeData) => {
  const { title, content } = resumeData;
  const { personalInfo, summary, experience, education, skills, projects, sectionOrder } = content;

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          new Paragraph({
            text: personalInfo?.fullName || 'Full Name',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun(`${personalInfo?.email || ''} | ${personalInfo?.phone || ''} | ${personalInfo?.location || ''}`),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${personalInfo?.linkedin || ''} | ${personalInfo?.github || ''} | ${personalInfo?.website || ''}`,
                color: '0000FF',
              }),
            ],
          }),
          new Paragraph({ text: '' }), // Spacer
          
          // Generate sections based on sectionOrder
          ...sectionOrder.flatMap((sectionName) => {
            if (sectionName === 'summary' && summary) {
              return [
                new Paragraph({ text: 'Professional Summary', heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: summary }),
                new Paragraph({ text: '' }),
              ];
            }
            if (sectionName === 'experience' && experience?.length > 0) {
              return [
                new Paragraph({ text: 'Experience', heading: HeadingLevel.HEADING_2 }),
                ...experience.flatMap(exp => [
                  new Paragraph({
                    children: [
                      new TextRun({ text: exp.position, bold: true }),
                      new TextRun(` at ${exp.company}`),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: `${exp.startDate || ''} - ${exp.current ? 'Present' : (exp.endDate || '')}`, italics: true }),
                    ],
                  }),
                  new Paragraph({ text: exp.description || '' }),
                  new Paragraph({ text: '' }),
                ]),
              ];
            }
            if (sectionName === 'education' && education?.length > 0) {
              return [
                new Paragraph({ text: 'Education', heading: HeadingLevel.HEADING_2 }),
                ...education.flatMap(edu => [
                  new Paragraph({
                    children: [
                      new TextRun({ text: `${edu.degree} in ${edu.field}`, bold: true }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun(`at ${edu.institution} `),
                      new TextRun({ text: `(${edu.startDate || ''} - ${edu.current ? 'Present' : (edu.endDate || '')})`, italics: true }),
                    ],
                  }),
                  new Paragraph({ text: edu.description || '' }),
                  new Paragraph({ text: '' }),
                ]),
              ];
            }
            if (sectionName === 'projects' && projects?.length > 0) {
              return [
                new Paragraph({ text: 'Projects', heading: HeadingLevel.HEADING_2 }),
                ...projects.flatMap(proj => [
                  new Paragraph({
                    children: [
                      new TextRun({ text: proj.title, bold: true }),
                      new TextRun(` | ${proj.technologies || ''}`),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: proj.url || '', color: '0000FF' }),
                    ],
                  }),
                  new Paragraph({ text: proj.description || '' }),
                  new Paragraph({ text: '' }),
                ]),
              ];
            }
            if (sectionName === 'skills' && skills?.length > 0) {
              return [
                new Paragraph({ text: 'Skills', heading: HeadingLevel.HEADING_2 }),
                ...skills.flatMap(skill => [
                  new Paragraph({
                    children: [
                      new TextRun({ text: `${skill.category}: `, bold: true }),
                      new TextRun(skill.items || ''),
                    ],
                  }),
                ]),
                new Paragraph({ text: '' }),
              ];
            }
            return [];
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title || 'Resume'}.docx`);
};
