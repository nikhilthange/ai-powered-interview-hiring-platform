import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { resumeBuilderApi } from '../../services/resumeBuilderApi';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { SkeletonPage } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { FileText, Plus, Upload, Trash2, Edit3, Clock } from 'lucide-react';
import SEO from '../../components/seo/SEO';
import SEOPageContent from '../../components/seo/SEOPageContent';
import { buildWebPageSchema, buildBreadcrumbSchema, buildHowToSchema, buildFAQSchema } from '../../utils/schemaGenerator';

const RESUME_BUILDER_FAQS = [
  {
    question: 'How does the HireMate AI Resume Builder work?',
    answer: 'Select a modern ATS-friendly template, fill in your experience sections or import an existing PDF/DOCX, and use integrated AI content generation to craft professional summaries.',
  },
  {
    question: 'Are HireMate resume templates compatible with ATS software?',
    answer: 'Yes! All HireMate resume templates follow clean single-column and dual-column layouts designed for maximum ATS parsing accuracy.',
  },
];

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

  const resumeBuilderSchemas = [
    buildWebPageSchema({
      title: 'AI Resume Builder & Modern Template Creator | HireMate',
      description: 'Build professional ATS-friendly resumes in minutes with AI content suggestions, modern templates, and export options on HireMate.',
      path: '/resume-builder',
    }),
    buildBreadcrumbSchema([{ name: 'Resume Builder', path: '/resume-builder' }]),
    buildFAQSchema(RESUME_BUILDER_FAQS),
    buildHowToSchema({
      name: 'How to Build an ATS-Friendly Engineering Resume with AI',
      description: 'Step-by-step procedure to build and export resumes.',
      steps: [
        { name: 'Choose Template or Import PDF', text: 'Start with a clean layout or import existing CV.', url: '/resume-builder' },
        { name: 'Fill Details', text: 'Add work experience, education, and technical projects.' },
        { name: 'Use AI Assistance', text: 'Generate bullet point achievements with AI suggestions.' },
        { name: 'Export Resume', text: 'Download print-ready PDF or Word file.' },
      ],
    }),
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <SEO
        title="AI Resume Builder & Modern Template Creator | HireMate"
        description="Build professional ATS-friendly resumes in minutes with AI content suggestions, modern templates, and export options on HireMate."
        path="/resume-builder"
        schema={resumeBuilderSchemas}
      />
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
        <Card className="surface-card border-dashed border-2">
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
            <Card key={resume._id} className="surface-card group hover:border-[var(--color-primary-300)] cursor-pointer">
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

      <SEOPageContent
        summary="Create clean, modern, ATS-friendly software engineering resumes with built-in AI section writing suggestions."
        definition="The HireMate AI Resume Builder provides candidate CV templates engineered to pass applicant tracking systems."
        questions={[
          {
            question: 'How do HireMate resume templates ensure high ATS parsing scores?',
            answer: 'Templates use standard font hierarchies, clean semantic margins, zero complex text boxes, and explicit section titles for flawless ATS parsing.',
          },
        ]}
        steps={[
          { title: 'Create or Import', desc: 'Start fresh or upload your existing resume.' },
          { title: 'Fill Sections', desc: 'Add work experience, projects, skills, and education.' },
          { title: 'Enhance with AI', desc: 'Generate strong action-oriented achievement bullets.' },
          { title: 'Download PDF', desc: 'Export high-resolution PDF for job applications.' },
        ]}
        takeaways={[
          'Modern ATS-optimized resume templates',
          'Integrated AI writing assistant for bullet point optimization',
          'PDF and Word file import/export capabilities',
        ]}
        faqs={RESUME_BUILDER_FAQS}
      />
    </div>
  );
}
