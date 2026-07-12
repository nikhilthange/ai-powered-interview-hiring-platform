import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Save, Upload, Link as LinkIcon, Users, Image as ImageIcon, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import companyService from '../../services/companyService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getMediaUrl } from '../../lib/utils';

const steps = [
  { id: 1, name: 'Basic Details', icon: Building2 },
  { id: 2, name: 'Branding', icon: ImageIcon },
  { id: 3, name: 'Culture & Perks', icon: Users },
];

const CompanyProfileForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    about: '',
    website: '',
    industry: '',
    employeeCount: '1-10',
    culture: '',
    benefits: '',
    linkedin: '',
    twitter: '',
  });

  const [files, setFiles] = useState({
    logo: null,
    coverImage: null,
    officePhotos: []
  });

  const [previews, setPreviews] = useState({
    logo: null,
    coverImage: null,
    officePhotos: []
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await companyService.getMyCompany();
        if (response.data?.company) {
          const comp = response.data.company;
          setFormData({
            name: comp.name || '',
            about: comp.about || '',
            website: comp.website || '',
            industry: comp.industry || '',
            employeeCount: comp.employeeCount || '1-10',
            culture: comp.culture || '',
            benefits: comp.benefits ? comp.benefits.join(', ') : '',
            linkedin: comp.socialLinks?.linkedin || '',
            twitter: comp.socialLinks?.twitter || '',
          });
          
          setPreviews({
            logo: comp.logo && comp.logo !== 'default-company-logo.png' ? getMediaUrl(comp.logo) : null,
            coverImage: comp.coverImage && comp.coverImage !== 'default-company-cover.png' ? getMediaUrl(comp.coverImage) : null,
            officePhotos: comp.officePhotos?.map(p => getMediaUrl(p)) || []
          });
        }
      } catch (error) {
        console.error('Failed to load company profile', error);
        toast.error('Failed to load company profile');
      } finally {
        setFetching(false);
      }
    };
    fetchCompany();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (type === 'officePhotos') {
      const newFiles = Array.from(selectedFiles).slice(0, 5);
      setFiles(prev => ({ ...prev, officePhotos: newFiles }));
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => ({ ...prev, officePhotos: newPreviews }));
    } else {
      const file = selectedFiles[0];
      setFiles(prev => ({ ...prev, [type]: file }));
      setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && (!formData.name || !formData.industry)) {
      toast.error('Please fill in required fields (Name, Industry)');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.about) {
      toast.error('Please provide an About section');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'benefits') {
          const benefitsArr = formData.benefits.split(',').map(b => b.trim()).filter(b => b);
          data.append('benefits', JSON.stringify(benefitsArr));
        } else if (key === 'linkedin' || key === 'twitter') {
           // wait to handle below
        } else {
          data.append(key, formData[key]);
        }
      });

      const socialLinks = {
        linkedin: formData.linkedin,
        twitter: formData.twitter
      };
      data.append('socialLinks', JSON.stringify(socialLinks));

      if (files.logo) data.append('logo', files.logo);
      if (files.coverImage) data.append('coverImage', files.coverImage);
      if (files.officePhotos && files.officePhotos.length > 0) {
        files.officePhotos.forEach(file => {
          data.append('officePhotos', file);
        });
      }

      await companyService.createOrUpdateCompany(data);
      toast.success('Company profile updated successfully!');
      navigate('/recruiter/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update company profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Company Profile</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Create a compelling profile to attract top talent to your team.</p>
      </div>

      {/* Stepper */}
      <nav aria-label="Progress" className="mb-12">
        <ol role="list" className="flex items-center justify-center">
          {steps.map((step, stepIdx) => (
            <li key={step.name} className={cn(stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '', 'relative')}>
              <div className="flex items-center">
                <div className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300 z-10",
                  currentStep > step.id ? "border-indigo-600 bg-indigo-600" : currentStep === step.id ? "border-indigo-600 bg-[var(--bg-primary)]" : "border-gray-300 dark:border-gray-600 bg-[var(--bg-primary)]"
                )}>
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-6 w-6 text-white" aria-hidden="true" />
                  ) : (
                    <step.icon className={cn("h-5 w-5", currentStep === step.id ? "text-indigo-600" : "text-gray-400 dark:text-gray-500")} />
                  )}
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div className={cn("absolute left-5 top-5 -ml-px mt-0.5 h-0.5 w-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 -z-10", currentStep > step.id ? "bg-indigo-600" : "")} aria-hidden="true" />
                )}
              </div>
              <span className={cn("absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap", currentStep === step.id ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400")}>
                {step.name}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <div className="bg-[var(--bg-primary)] shadow-xl shadow-black/5 rounded-3xl border border-[var(--border-color)] overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 sm:p-10">
          
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Basic Details</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Provide the essential information about your company.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-[var(--text-primary)]">Company Name *</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-2 block w-full rounded-xl border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-[var(--bg-secondary)] px-4 py-3" placeholder="Acme Corp" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)]">Industry *</label>
                    <input type="text" name="industry" required value={formData.industry} onChange={handleChange} className="mt-2 block w-full rounded-xl border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-[var(--bg-secondary)] px-4 py-3" placeholder="e.g. Technology" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)]">Company Size</label>
                    <select name="employeeCount" value={formData.employeeCount} onChange={handleChange} className="mt-2 block w-full rounded-xl border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-[var(--bg-secondary)] px-4 py-3">
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)]">Website</label>
                    <div className="mt-2 relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LinkIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <input type="url" name="website" value={formData.website} onChange={handleChange} className="block w-full pl-10 rounded-xl border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 bg-[var(--bg-secondary)] px-4 py-3" placeholder="https://example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)]">LinkedIn</label>
                    <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className="mt-2 block w-full rounded-xl border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-[var(--bg-secondary)] px-4 py-3" placeholder="https://linkedin.com/company/acme" />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Visual Branding</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Upload your logo and cover image to make your profile stand out.</p>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">Company Logo</label>
                    <div className="flex items-center gap-6">
                      <div className="h-24 w-24 rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center relative group">
                        {previews.logo ? (
                          <img src={previews.logo} alt="Logo preview" className="h-full w-full object-contain p-2 bg-white" />
                        ) : (
                          <Building2 className="h-8 w-8 text-gray-400" />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="h-6 w-6 text-white" />
                        </div>
                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        <p className="font-medium text-[var(--text-primary)]">Upload a high-res logo</p>
                        <p>PNG, JPG, or SVG up to 2MB.</p>
                        <p>Square ratio recommended.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">Cover Image</label>
                    <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border-2 border-dashed border-gray-300 dark:border-gray-700 group flex flex-col items-center justify-center">
                      {previews.coverImage ? (
                        <>
                          <img src={previews.coverImage} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-semibold text-sm shadow-lg">Change Cover</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="font-medium text-[var(--text-primary)]">Upload a cover image</p>
                          <p className="text-sm text-[var(--text-secondary)] mt-1">1200 x 400px recommended</p>
                        </>
                      )}
                      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileChange(e, 'coverImage')} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Culture & Perks</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Tell candidates what it's like to work at your company.</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)]">About Us *</label>
                    <textarea name="about" required rows={4} value={formData.about} onChange={handleChange} className="mt-2 block w-full rounded-xl border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-[var(--bg-secondary)] px-4 py-3" placeholder="Provide a detailed overview of your company..." />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)]">Company Culture</label>
                    <textarea name="culture" rows={3} value={formData.culture} onChange={handleChange} className="mt-2 block w-full rounded-xl border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-[var(--bg-secondary)] px-4 py-3" placeholder="Describe your team's values and work environment..." />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)]">Benefits & Perks</label>
                    <input type="text" name="benefits" value={formData.benefits} onChange={handleChange} className="mt-2 block w-full rounded-xl border-gray-300 dark:border-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-[var(--bg-secondary)] px-4 py-3" placeholder="e.g. Health Insurance, Remote Work, 401k (comma separated)" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 pt-6 border-t border-[var(--border-color)] flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={cn(
                "inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold transition-colors",
                currentStep === 1 ? "opacity-0 pointer-events-none" : "text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-gray-300 dark:border-gray-700"
              )}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </button>
            
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
              >
                Next Step <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
              >
                {loading ? 'Saving...' : 'Save & Publish Profile'}
                <Save className="ml-2 h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfileForm;
