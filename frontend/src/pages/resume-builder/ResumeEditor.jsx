import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeBuilderApi } from '../../services/resumeBuilderApi';
import EditorForm from './EditorForm';
import ResumePreview from '../../components/resume/ResumePreview';
import AIAssistantModal from './AIAssistantModal';
import ResumeToolbar from '../../components/resume/ResumeToolbar';
import { SkeletonPage } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';

export default function ResumeEditor() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [resumeData, setResumeData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  const [aiModalText, setAiModalText] = useState(null);
  const [aiModalCallback, setAiModalCallback] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['resume', id],
    queryFn: () => resumeBuilderApi.getResume(id).then(res => res.data),
    enabled: !!id
  });

  useEffect(() => {
    if (data && !resumeData) {
      setResumeData(data);
      setLastSaved(new Date(data.updatedAt));
    }
  }, [data, resumeData]);

  const updateMutation = useMutation({
    mutationFn: (newData) => resumeBuilderApi.updateResume(id, newData),
    onSuccess: (updated) => {
      setLastSaved(new Date());
      setIsSaving(false);
      queryClient.setQueryData(['resume', id], updated.data);
    },
    onError: () => {
      setIsSaving(false);
      toast({ title: 'Error', description: 'Failed to autosave.', variant: 'destructive' });
    }
  });

  // Autosave logic
  const debounceRef = useRef(null);
  const handleDataChange = (field, value) => {
    const newData = { ...resumeData, [field]: value };
    setResumeData(newData);
    
    setIsSaving(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateMutation.mutate(newData);
    }, 5000); // 5s debounce for Autosave
  };

  const handleManualSave = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!isSaving && lastSaved) return; // already saved
    setIsSaving(true);
    updateMutation.mutate(resumeData);
  };

  const handleAIAssistRequest = (text, callback) => {
    setAiModalText(text);
    setAiModalCallback(() => callback);
  };

  if (isLoading || !resumeData) return <SkeletonPage />;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col -m-6 sm:-m-8">
      {/* Editor Header */}
      <ResumeToolbar 
        title={resumeData.title}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onSave={handleManualSave}
        isPending={updateMutation.isPending}
      />

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane - Form */}
        <div className="w-full lg:w-[45%] h-full border-r border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 sm:p-6">
          <EditorForm 
            resumeData={resumeData} 
            onChange={handleDataChange} 
            onAIAssist={handleAIAssistRequest}
          />
        </div>

        {/* Right Pane - Preview */}
        <div className="hidden lg:block lg:w-[55%] h-full bg-[var(--bg-tertiary)] p-6">
          <ResumePreview resumeData={resumeData} />
        </div>
      </div>

      {aiModalText !== null && (
        <AIAssistantModal 
          text={aiModalText}
          onApply={(newText) => {
            if (aiModalCallback) aiModalCallback(newText);
            setAiModalText(null);
            setAiModalCallback(null);
          }}
          onClose={() => {
            setAiModalText(null);
            setAiModalCallback(null);
          }}
        />
      )}
    </div>
  );
}
