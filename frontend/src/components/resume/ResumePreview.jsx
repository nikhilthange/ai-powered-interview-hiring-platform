import React, { useRef } from 'react';
import ClassicTemplate from './Templates/ClassicTemplate';
import ModernTemplate from './Templates/ModernTemplate';
import MinimalTemplate from './Templates/MinimalTemplate';
import ProfessionalTemplate from './Templates/ProfessionalTemplate';
import { useReactToPrint } from 'react-to-print';
import Button from '../ui/Button';
import { exportAsDocx } from '../../utils/exportDocx';
import { Download, FileText } from 'lucide-react';

export default function LivePreview({ resumeData }) {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: () => componentRef.current,
    documentTitle: resumeData?.title || 'Resume'
  });

  const handleDocxExport = () => {
    exportAsDocx(resumeData);
  };

  const renderTemplate = () => {
    const template = resumeData?.template || 'classic';
    if (template === 'modern') {
      return <ModernTemplate data={resumeData.content} />;
    } else if (template === 'minimal') {
      return <MinimalTemplate data={resumeData.content} />;
    } else if (template === 'professional') {
      return <ProfessionalTemplate data={resumeData.content} />;
    }
    return <ClassicTemplate data={resumeData.content} />;
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-xl overflow-hidden border border-[var(--border-color)]">
      <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        <h2 className="font-semibold text-[var(--text-primary)]">Live Preview</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleDocxExport}>
            <FileText className="h-4 w-4 mr-1.5" /> Export DOCX
          </Button>
          <Button size="sm" onClick={() => handlePrint()}>
            <Download className="h-4 w-4 mr-1.5" /> Download PDF
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center bg-gray-50/50">
        <div 
          className="bg-white shadow-xl origin-top" 
          ref={componentRef}
          style={{ width: '816px', minHeight: '1056px', transformOrigin: 'top center' }}
        >
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
}
