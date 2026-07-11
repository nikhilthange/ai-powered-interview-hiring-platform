import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeBuilderApi } from '../../services/resumeBuilderApi';
import EditorForm from './EditorForm';
import LivePreview from './LivePreview';
import AIAssistantModal from './AIAssistantModal';
import { SkeletonPage } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { ArrowLeft, Save } from 'lucide-react';
import Button from '../../components/ui/Button';

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
      <div className="h-14 border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/resume-builder" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-semibold text-[var(--text-primary)]">{resumeData.title || 'Untitled Resume'}</h1>
              {isSaving && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Unsaved Changes</span>}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-3 w-3" />
                  Last saved {lastSaved ? lastSaved.toLocaleTimeString() : 'just now'}
                </>
              )}
            </div>
          </div>
        </div>
        <Button size="sm" onClick={handleManualSave} disabled={updateMutation.isPending || (!isSaving && !!lastSaved)}>
          <Save className="h-4 w-4 mr-2" /> Save
        </Button>
      </div>

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
          <LivePreview resumeData={resumeData} />
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
