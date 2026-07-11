import React, { useRef, useEffect, useState } from 'react';
import ClassicTemplate from './ResumeTemplates/ClassicTemplate';
import ModernTemplate from './ResumeTemplates/ModernTemplate';
import MinimalTemplate from './ResumeTemplates/MinimalTemplate';
import ProfessionalTemplate from './ResumeTemplates/ProfessionalTemplate';
import { useReactToPrint } from 'react-to-print';
import Button from '../ui/Button';
import { exportAsDocx } from '../../utils/exportDocx';
import { Download, FileText } from 'lucide-react';

export default function LivePreview({ resumeData }) {
  const componentRef = useRef();
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        // Calculate the available width (container width minus padding)
        const containerWidth = containerRef.current.offsetWidth - 32;
        const targetWidth = 816; // Standard US Letter width in pixels
        if (containerWidth < targetWidth) {
          setScale(containerWidth / targetWidth);
        } else {
          setScale(1);
        }
      }
    };

    // Use ResizeObserver for more robust resizing tracking of the specific container
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    // Initial scale
    updateScale();

    return () => {
      observer.disconnect();
    };
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
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
      
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-4 flex justify-center bg-gray-50/50 custom-scrollbar"
      >
        <div 
          className="bg-white shadow-xl origin-top transition-transform duration-200" 
          ref={componentRef}
          style={{ 
            width: '816px', 
            minHeight: '1056px', 
            transform: `scale(${scale})`,
            marginBottom: `${-(1056 - (1056 * scale))}px` // Adjust margin to prevent empty scroll space
          }}
        >
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
}
