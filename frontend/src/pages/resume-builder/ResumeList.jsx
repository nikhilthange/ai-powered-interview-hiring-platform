import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { resumeBuilderApi } from '../../services/resumeBuilderApi';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { SkeletonPage } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { FileText, Plus, Upload, Trash2, Edit3, Clock } from 'lucide-react';

export default function ResumeList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isImporting, setIsImporting] = useState(false);

  const { data: resumes, isLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => resumeBuilderApi.getResumes().then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data) => resumeBuilderApi.createResume(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast({ title: 'Success', description: 'Resume created successfully.' });
      navigate(`/resume-builder/${data.data._id}`);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to create resume.', variant: 'destructive' })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => resumeBuilderApi.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast({ title: 'Success', description: 'Resume deleted.' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete resume.', variant: 'destructive' })
  });

  const importMutation = useMutation({
    mutationFn: (file) => resumeBuilderApi.importResume(file),
    onSuccess: (data) => {
      // Create a new resume with the imported data
      createMutation.mutate({
        title: 'Imported Resume',
        content: data.data
      });
      setIsImporting(false);
    },
    onError: (err) => {
      setIsImporting(false);
      toast({ title: 'Import Failed', description: err.response?.data?.message || 'Could not parse the file.', variant: 'destructive' });
    }
  });

  const handleCreateEmpty = () => {
    createMutation.mutate({ title: 'Untitled Resume' });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    importMutation.mutate(file);
    e.target.value = ''; // Reset input
  };

  if (isLoading) return <SkeletonPage />;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">AI Resume Builder</h1>
          <p className="text-[var(--text-secondary)] mt-1">Create, manage, and optimize your professional resumes.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input 
              type="file" 
              accept=".pdf,.docx" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              onChange={handleFileChange}
              disabled={isImporting || createMutation.isPending}
            />
            <Button variant="outline" disabled={isImporting || createMutation.isPending}>
              {isImporting ? <Clock className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              {isImporting ? 'Parsing AI...' : 'Import PDF/DOCX'}
            </Button>
          </div>
          <Button onClick={handleCreateEmpty} disabled={createMutation.isPending || isImporting}>
            <Plus className="h-4 w-4 mr-2" /> New Resume
          </Button>
        </div>
      </div>

      {resumes?.length === 0 ? (
        <Card className="border-dashed border-2 border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <CardContent className="p-12 text-center flex flex-col items-center">
            <div className="h-16 w-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Resumes Yet</h3>
            <p className="text-[var(--text-secondary)] mb-6 max-w-sm">
              Create a new resume from scratch or import your existing PDF/DOCX to get started with AI enhancements.
            </p>
            <Button onClick={handleCreateEmpty} disabled={createMutation.isPending}>Create Your First Resume</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes?.map(resume => (
            <Card key={resume._id} className="hover:border-indigo-300 transition-colors group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/resume-builder/${resume._id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-indigo-600">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteMutation.mutate(resume._id)}
                      disabled={deleteMutation.isPending}
                      className="h-8 w-8 p-0 text-[var(--text-secondary)] hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Link to={`/resume-builder/${resume._id}`} className="block">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] hover:text-indigo-600 transition-colors">
                    {resume.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-4 text-xs text-[var(--text-tertiary)] font-medium">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-secondary)]">
                      <span className="capitalize">{resume.template} Template</span>
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-secondary)]">
                      <Clock className="h-3 w-3" />
                      {new Date(resume.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
