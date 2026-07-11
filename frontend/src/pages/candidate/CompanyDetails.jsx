import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Globe, Users, Briefcase, MapPin, ExternalLink, Heart, ArrowLeft, Link as LinkIcon, Star, BadgeCheck, Plus } from 'lucide-react';
import companyService from '../../services/companyService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { getMediaUrl, cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const CompanyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  const fetchCompanyDetails = async () => {
    try {
      const response = await companyService.getCompanyById(id);
      setCompany(response.data.company);
    } catch (error) {
      toast.error('Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

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
    } catch (error) {
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
          
          <div className="h-48 md:h-64 lg:h-80 w-full relative bg-gray-100 dark:bg-gray-800">
            {company.coverImage && company.coverImage !== 'default-company-cover.png' ? (
              <img src={getMediaUrl(company.coverImage)} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-600 to-purple-800 opacity-90"></div>
            )}
          </div>

          <div className="px-6 lg:px-10 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 md:-mt-20 pb-6 gap-6">
              
              <div className="flex flex-col md:flex-row items-start md:items-end gap-6 w-full">
                <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl shadow-lg border-4 border-[var(--bg-primary)] bg-white dark:bg-gray-800 overflow-hidden shrink-0 z-10">
                  {company.logo && company.logo !== 'default-company-logo.png' ? (
                    <img src={getMediaUrl(company.logo)} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="h-full w-full p-8 text-gray-400 bg-gray-50 dark:bg-gray-800" />
                  )}
                </div>
                
                <div className="flex-1 pb-1">
                  <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                    {company.name}
                    {company.isVerified && <BadgeCheck className="h-6 w-6 text-blue-500 mt-1" title="Verified" />}
                  </h1>
                  <p className="text-lg text-[var(--text-secondary)] mt-1 font-medium">{company.industry}</p>
                  <div className="mt-2.5 flex flex-wrap items-center text-sm text-[var(--text-tertiary)] gap-x-4 gap-y-2">
                    {company.location && (
                      <span className="flex items-center"><MapPin className="mr-1.5 h-4 w-4" />{company.location}</span>
                    )}
                    <span className="flex items-center"><Users className="mr-1.5 h-4 w-4" />{company.employeeCount} employees</span>
                    <span className="flex items-center"><Users className="mr-1.5 h-4 w-4" />{company.followersCount || 0} followers</span>
                    {company.rating > 0 && (
                      <span className="flex items-center text-amber-500 font-semibold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded text-xs">
                        <Star className="mr-1 h-3 w-3 fill-current" />{company.rating} Rating
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
            <div className="border-t border-[var(--border-color)]">
              <nav className="flex -mb-px space-x-8 overflow-x-auto scrollbar-none" aria-label="Tabs">
                {['about', 'jobs', 'life'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                      activeTab === tab
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'jobs' && company.jobs && company.jobs.length > 0 && `(${company.jobs.length})`}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {activeTab === 'about' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <section className="bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Overview</h2>
                  <div className="prose prose-indigo dark:prose-invert max-w-none text-[var(--text-secondary)]">
                    <p className="whitespace-pre-line leading-relaxed">{company.about}</p>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'jobs' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <section className="bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Open Roles</h2>
                  {company.jobs && company.jobs.length > 0 ? (
                    <div className="space-y-4">
                      {company.jobs.map(job => (
                        <div key={job.id} className="p-4 border border-[var(--border-color)] rounded-xl hover:shadow-md transition-shadow">
                          <Link to={`/jobs/${job.id}`} className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                            {job.title}
                          </Link>
                          <div className="mt-2 flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                            <span className="flex items-center"><MapPin className="mr-1 h-4 w-4" /> {job.location || 'Remote'}</span>
                            <span className="flex items-center"><Briefcase className="mr-1 h-4 w-4" /> {job.type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Briefcase className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                      <h3 className="text-lg font-medium text-[var(--text-primary)]">No open jobs</h3>
                      <p className="text-[var(--text-secondary)] mt-1">This company is not hiring currently.</p>
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {activeTab === 'life' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {company.culture && (
                  <section className="bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] p-6 lg:p-8">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Culture</h2>
                    <div className="prose prose-indigo dark:prose-invert max-w-none text-[var(--text-secondary)]">
                      <p className="whitespace-pre-line leading-relaxed">{company.culture}</p>
                    </div>
                  </section>
                )}
                {company.officePhotos && company.officePhotos.length > 0 && (
                  <section className="bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] p-6 lg:p-8">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Photos</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {company.officePhotos.map((photo, idx) => (
                        <div key={idx} className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img src={getMediaUrl(photo)} alt={`Office ${idx + 1}`} className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {!company.culture && (!company.officePhotos || company.officePhotos.length === 0) && (
                   <div className="bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-color)] p-12 text-center text-[var(--text-secondary)]">
                      Nothing shared yet.
                   </div>
                )}
              </motion.div>
            )}
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
