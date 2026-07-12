import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Users, Briefcase, MapPin, ExternalLink, Heart, ArrowLeft, Link as LinkIcon, Star, BadgeCheck, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { chatApi } from '../../services/chatApi';
import { getMediaUrl, cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import companyService from '../../services/companyService';

const CompanyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await companyService.getCompanyById(id);
        setCompany(response.data.company);
      } catch (_error) {
        toast.error('Failed to load company details');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyDetails();
  }, [id, toast]);

  const messageMutation = useMutation({
    mutationFn: (recruiterId) => chatApi.getOrCreateRoom(recruiterId),
    onSuccess: () => navigate('/chat'),
    onError: () => toast.error('Failed to start conversation.')
  });

  useEffect(() => {
    if (user?.followingCompanies && company) {
      setIsFollowing(user.followingCompanies.includes(company.id));
    }
  }, [user, company]);

  const handleFollowToggle = async () => {
    if (!user) {
      toast.error('Please login to follow companies');
      return;
    }
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await companyService.unfollowCompany(id);
        setIsFollowing(false);
        setCompany(prev => ({ ...prev, followersCount: Math.max(0, prev.followersCount - 1) }));
        toast.success(`Unfollowed ${company.name}`);
      } else {
        await companyService.followCompany(id);
        setIsFollowing(true);
        setCompany(prev => ({ ...prev, followersCount: (prev.followersCount || 0) + 1 }));
        toast.success(`Following ${company.name}`);
      }
    } catch (_error) {
      toast.error('Action failed. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[var(--bg-secondary)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-20 bg-[var(--bg-secondary)] min-h-screen">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Company not found</h2>
        <Link to="/companies" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500 font-medium">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to companies
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-secondary)] min-h-screen pb-12">
      {/* Cover Image Container */}
      <div className="max-w-7xl mx-auto md:mt-6 md:px-6 lg:px-8">
        <div className="bg-[var(--bg-primary)] md:rounded-2xl shadow-sm border-x md:border border-b border-[var(--border-color)] overflow-hidden">
          
          <div className="h-48 md:h-72 lg:h-96 w-full relative bg-gray-100 dark:bg-gray-800">
            {company.coverImage && company.coverImage !== 'default-company-cover.png' ? (
              <>
                <img src={getMediaUrl(company.coverImage)} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-indigo-900 via-purple-900 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            )}
          </div>

          <div className="px-6 lg:px-10 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 md:-mt-20 pb-6 gap-6">
              
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6 w-full">
                <div className="h-32 w-32 md:h-44 md:w-44 rounded-3xl shadow-2xl shadow-black/10 border-4 border-[var(--bg-primary)] bg-white dark:bg-gray-800 overflow-hidden shrink-0 z-10 relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {company.logo && company.logo !== 'default-company-logo.png' ? (
                    <img src={getMediaUrl(company.logo)} alt="Logo" className="w-full h-full object-contain p-2 bg-white" />
                  ) : (
                    <Building2 className="h-full w-full p-10 text-gray-400 bg-gray-50 dark:bg-gray-800" />
                  )}
                </div>
                
                <div className="flex-1 pb-1 z-10">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
                    {company.name}
                    {company.isVerified && <BadgeCheck className="h-7 w-7 text-blue-500 drop-shadow-sm" title="Verified" />}
                  </h1>
                  <p className="text-lg md:text-xl text-[var(--text-secondary)] mt-1 font-medium">{company.industry}</p>
                  <div className="mt-4 flex flex-wrap items-center text-sm font-medium text-[var(--text-tertiary)] gap-x-5 gap-y-3">
                    {company.location && (
                      <span className="flex items-center"><MapPin className="mr-1.5 h-4 w-4 text-indigo-500" />{company.location}</span>
                    )}
                    <span className="flex items-center"><Users className="mr-1.5 h-4 w-4 text-purple-500" />{company.employeeCount} employees</span>
                    <span className="flex items-center"><Heart className="mr-1.5 h-4 w-4 text-pink-500" />{company.followersCount || 0} followers</span>
                    {company.rating > 0 && (
                      <span className="flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-md text-xs font-bold border border-amber-200 dark:border-amber-900/50">
                        <Star className="mr-1.5 h-3.5 w-3.5 fill-current" />{company.rating} Rating
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 pb-1">
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={cn(
                    "w-full md:w-48 inline-flex justify-center items-center px-6 py-2.5 border text-sm font-semibold rounded-full shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                    isFollowing
                      ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      : "border-transparent bg-indigo-600 text-white hover:bg-indigo-700"
                  )}
                >
                  {isFollowing ? (
                    <>Following</>
                  ) : (
                    <><Plus className="mr-1.5 h-4 w-4" /> Follow</>
                  )}
                </button>
                {user && company.recruiterId && user._id !== company.recruiterId && (
                  <button
                    onClick={() => messageMutation.mutate(company.recruiterId)}
                    disabled={messageMutation.isPending}
                    className="w-full md:w-48 inline-flex justify-center items-center px-6 py-2.5 border border-indigo-600 text-indigo-600 dark:text-indigo-400 text-sm font-semibold rounded-full shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all focus:outline-none"
                  >
                    {messageMutation.isPending ? 'Starting...' : 'Message Recruiter'}
                  </button>
                )}
                {company.website && (
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full md:w-48 inline-flex justify-center items-center px-6 py-2.5 border border-indigo-600 text-indigo-600 dark:text-indigo-400 text-sm font-semibold rounded-full shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                  >
                    Visit website <ExternalLink className="ml-1.5 h-4 w-4" />
                  </a>
                )}
              </div>

            </div>

            {/* Tabs */}
            <div className="border-t border-[var(--border-color)] relative">
              <nav className="flex space-x-8 overflow-x-auto scrollbar-none" aria-label="Tabs">
                {['about', 'jobs', 'life'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "relative whitespace-nowrap py-4 px-1 font-semibold text-sm transition-colors",
                      activeTab === tab
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'jobs' && company.jobs && company.jobs.length > 0 && `(${company.jobs.length})`}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full"
                      />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            <AnimatePresence mode="wait">
            {activeTab === 'about' && (
              <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 lg:p-8 hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-500" />
                    Overview
                  </h2>
                  <div className="prose prose-indigo dark:prose-invert max-w-none text-[var(--text-secondary)]">
                    <p className="whitespace-pre-line leading-relaxed text-base">{company.about}</p>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'jobs' && (
              <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 lg:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-indigo-500" />
                      Open Roles
                    </h2>
                    <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-2.5 py-1 rounded-full">
                      {company.jobs?.length || 0} Openings
                    </span>
                  </div>
                  {company.jobs && company.jobs.length > 0 ? (
                    <div className="space-y-4">
                      {company.jobs.map(job => (
                        <div key={job.id} className="group p-5 border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-lg hover:border-indigo-100 dark:hover:border-indigo-900/30 bg-[var(--bg-primary)] transition-all relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="flex justify-between items-start mb-2">
                            <Link to={`/jobs/${job.id}`} className="text-lg font-bold text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {job.title}
                            </Link>
                            <span className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded">Active</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)] font-medium">
                            <span className="flex items-center"><MapPin className="mr-1.5 h-4 w-4 text-gray-400" /> {job.location || 'Remote'}</span>
                            <span className="flex items-center"><Briefcase className="mr-1.5 h-4 w-4 text-gray-400" /> {job.jobType}</span>
                            {job.salaryRange && (job.salaryRange.min > 0 || job.salaryRange.max > 0) && (
                               <span className="flex items-center"><Star className="mr-1.5 h-4 w-4 text-gray-400" /> ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                      <div className="mx-auto h-16 w-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm mb-4">
                        <Briefcase className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">No open jobs</h3>
                      <p className="text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">This company currently doesn't have any open positions listed on the platform.</p>
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {activeTab === 'life' && (
              <motion.div key="life" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                {company.culture && (
                  <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 lg:p-8 hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-pink-500" />
                      Culture & Values
                    </h2>
                    <div className="prose prose-indigo dark:prose-invert max-w-none text-[var(--text-secondary)]">
                      <p className="whitespace-pre-line leading-relaxed text-base">{company.culture}</p>
                    </div>
                  </section>
                )}
                {company.officePhotos && company.officePhotos.length > 0 && (
                  <section className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 lg:p-8">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-indigo-500" />
                      Office & Environment
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {company.officePhotos.map((photo, idx) => (
                        <div key={idx} className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative group shadow-sm border border-gray-200 dark:border-gray-700">
                          <img src={getMediaUrl(photo)} alt={`Office ${idx + 1}`} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="text-white text-sm font-semibold tracking-wider">VIEW</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {!company.culture && (!company.officePhotos || company.officePhotos.length === 0) && (
                   <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                     <div className="mx-auto h-16 w-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm mb-4">
                       <Heart className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                     </div>
                     <h3 className="text-lg font-bold text-[var(--text-primary)]">Nothing shared yet</h3>
                     <p className="text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">This company hasn't shared details about their culture or office environment.</p>
                   </div>
                )}
              </motion.div>
            )}
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            {/* Side Content: Benefits */}
            {company.benefits && company.benefits.length > 0 && (
              <section className="bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] p-6">
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Benefits & Perks</h2>
                <ul className="space-y-3">
                  {company.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-[var(--text-secondary)]">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                      <span className="text-sm font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Side Content: Socials */}
            {(company.socialLinks?.linkedin || company.socialLinks?.twitter || company.socialLinks?.facebook) && (
              <section className="bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] p-6">
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Connect</h2>
                <div className="flex gap-4">
                  {company.socialLinks?.linkedin && (
                    <a href={company.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                      <LinkIcon className="h-5 w-5" />
                    </a>
                  )}
                  {company.socialLinks?.twitter && (
                    <a href={company.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-sky-50 dark:bg-sky-900/20 text-sky-500 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors">
                      <LinkIcon className="h-5 w-5" />
                    </a>
                  )}
                  {company.socialLinks?.facebook && (
                    <a href={company.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                      <LinkIcon className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;
