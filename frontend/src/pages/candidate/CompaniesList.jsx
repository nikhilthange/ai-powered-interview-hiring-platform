import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2, MapPin, Users, ChevronRight, Star, BadgeCheck, Filter, X } from 'lucide-react';
import companyService from '../../services/companyService';
import { toast } from 'react-hot-toast';
import { getMediaUrl } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const INDUSTRIES = ['Technology', 'FinTech', 'HealthTech', 'E-commerce', 'SaaS', 'AI', 'EdTech', 'Cybersecurity'];
const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
}

const CompaniesList = () => {
  const [companies, setCompanies] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    industry: [],
    size: [],
    location: '',
    isVerified: false
  });
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        industry: filters.industry.join(','),
        size: filters.size.join(','),
        location: filters.location,
        isVerified: filters.isVerified ? 'true' : ''
      };
      
      const [compRes, recRes] = await Promise.all([
        companyService.getAllCompanies(params),
        companyService.getRecommendedCompanies({ limit: 3 })
      ]);
      
      setCompanies(compRes.data?.companies || []);
      setRecommended(recRes.data?.companies || []);
    } catch (error) {
      console.error('Failed to load companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies();
  };

  const toggleFilter = (type, value) => {
    setFilters(prev => {
      const current = prev[type];
      const updated = current.includes(value) 
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ industry: [], size: [], location: '', isVerified: false });
  };

  const CompanyCard = ({ company }) => (
    <motion.div variants={itemVariants} className="h-full">
      <Link
        to={`/companies/${company.id}`}
        className="group flex flex-col h-full bg-white dark:bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300"
      >
        <div className="h-32 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
        {company.coverImage && company.coverImage !== 'default-company-cover.png' ? (
           <img src={getMediaUrl(company.coverImage)} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
           <div className="w-full h-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20"></div>
        )}
      </div>
      
      <div className="px-5 pb-5 flex-1 flex flex-col relative">
        <div className="flex justify-between items-start -mt-10 mb-3">
          <div className="h-20 w-20 rounded-xl shadow-md border-4 border-white dark:border-[var(--bg-primary)] bg-white overflow-hidden z-10">
            {company.logo && company.logo !== 'default-company-logo.png' ? (
               <img src={getMediaUrl(company.logo)} alt="Logo" className="w-full h-full object-cover" />
            ) : (
               <Building2 className="h-full w-full p-4 text-gray-400 bg-gray-50 dark:bg-gray-800" />
            )}
          </div>
          {company.rating > 0 && (
            <div className="mt-12 flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg text-xs font-semibold">
              <Star className="h-3 w-3 fill-current" />
              <span>{company.rating}</span>
            </div>
          )}
        </div>

        <div className="mb-2">
          <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
            {company.name}
            {company.isVerified && <BadgeCheck className="h-4 w-4 text-blue-500" title="Verified Company" />}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] font-medium">{company.industry}</p>
        </div>

        <p className="text-sm text-[var(--text-tertiary)] line-clamp-2 mb-4 flex-1">
          {company.about}
        </p>

        <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-[var(--text-secondary)] mb-4">
          {company.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>{company.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{company.employeeCount}</span>
          </div>
        </div>

        <div className="mt-auto border-t border-[var(--border-color)] pt-4 flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--text-tertiary)]">
            {company.followersCount?.toLocaleString() || 0} followers
          </span>
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center group-hover:underline">
            View Profile <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
      </Link>
    </motion.div>
  );

  return (
    <div className="w-full h-full flex flex-col overflow-hidden space-y-4">
      <div className="mb-2 shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight mb-2">
            Discover Companies
          </h1>
          <p className="text-[var(--text-secondary)]">
            Find and follow the best places to work based on your career goals.
          </p>
        </div>
        
        <button 
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="md:hidden flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm font-medium"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 min-h-0 overflow-hidden items-stretch">
        {/* Left Sidebar - Filters */}
        <AnimatePresence>
          {(showMobileFilters || window.innerWidth >= 768) && (
            <aside 
              className="w-full md:w-64 shrink-0 md:h-full md:overflow-y-auto scrollbar-none pb-4"
            >
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-[var(--border-color)] shadow-sm transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[var(--text-primary)]">Filters</h3>
                  {(filters.industry.length > 0 || filters.size.length > 0 || filters.location || filters.isVerified || searchTerm) && (
                    <button onClick={clearFilters} className="text-xs text-indigo-600 hover:underline">
                      Clear all
                    </button>
                  )}
                </div>

                {/* Search */}
                <div className="mb-6">
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Search</label>
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
                    <input
                      type="text"
                      placeholder="Name, keyword..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    />
                  </form>
                </div>
                
                {/* Location */}
                <div className="mb-6">
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
                    <input
                      type="text"
                      placeholder="e.g. San Francisco"
                      value={filters.location}
                      onChange={(e) => setFilters({...filters, location: e.target.value})}
                      className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Industry */}
                <div className="mb-6">
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Industry</label>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto scrollbar-thin">
                    {INDUSTRIES.map(ind => (
                      <label key={ind} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            className="peer sr-only"
                            checked={filters.industry.includes(ind)}
                            onChange={() => toggleFilter('industry', ind)}
                          />
                          <div className="h-4 w-4 rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors"></div>
                          <div className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{ind}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div className="mb-6">
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Company Size</label>
                  <div className="space-y-2.5">
                    {SIZES.map(size => (
                      <label key={size} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            className="peer sr-only"
                            checked={filters.size.includes(size)}
                            onChange={() => toggleFilter('size', size)}
                          />
                          <div className="h-4 w-4 rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors"></div>
                          <div className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Verified */}
                <div>
                   <label className="flex items-center justify-between cursor-pointer group">
                     <span className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                        Verified Only
                        <BadgeCheck className="h-4 w-4 text-blue-500" />
                     </span>
                     <div className="relative">
                       <input 
                         type="checkbox" 
                         className="peer sr-only"
                         checked={filters.isVerified}
                         onChange={(e) => setFilters({...filters, isVerified: e.target.checked})}
                       />
                       <div className="block h-5 w-9 rounded-full bg-gray-200 dark:bg-gray-700 peer-checked:bg-indigo-600 transition-colors"></div>
                       <div className="dot absolute left-1 top-1 h-3 w-3 rounded-full bg-white transition-transform peer-checked:translate-x-4"></div>
                     </div>
                   </label>
                </div>
              </div>
            </aside>
          )}
        </AnimatePresence>

        {/* Right Content - Grid */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          
          {/* Recommendations Block (only show on page 1 without filters for cleaner UX) */}
          {recommended.length > 0 && !searchTerm && filters.industry.length === 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Recommended for you
                </h2>
              </div>
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommended.map(company => (
                  <CompanyCard key={`rec-${company.id}`} company={company} />
                ))}
              </motion.div>
              <div className="my-8 h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent" />
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl h-80">
                  <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-t-2xl"></div>
                  <div className="p-5">
                    <div className="h-20 w-20 bg-gray-300 dark:bg-gray-700 rounded-xl -mt-10 mb-4 border-4 border-white dark:border-gray-900"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-6"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/5"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : companies.length === 0 ? (
            <div className="py-12 flex flex-col items-center text-center bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] shadow-sm">
              <div className="h-20 w-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No companies found</h3>
              <p className="text-[var(--text-secondary)] text-sm max-w-sm mb-6">
                We couldn't find any companies matching your criteria. Try adjusting your filters or search terms.
              </p>
              <button 
                onClick={clearFilters}
                className="px-5 py-2.5 border border-[var(--border-color)] text-[var(--text-primary)] font-medium rounded-xl hover:bg-[var(--bg-secondary)] shadow-sm transition-colors text-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="sticky top-[88px] z-10 flex flex-col gap-3 mb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-3 border-b border-[var(--border-color)] -mx-2 px-2 rounded-t-xl transition-all">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    {companies.length} Companies <span className="text-sm font-normal text-[var(--text-tertiary)] ml-2">Found</span>
                  </h2>
                  <div className="text-sm text-[var(--text-secondary)] font-medium cursor-pointer flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors">
                    Sort by: <span className="text-[var(--text-primary)] font-semibold">Recommended</span>
                    <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                
                {(searchTerm || filters.industry.length > 0 || filters.size.length > 0 || filters.location || filters.isVerified) && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {searchTerm && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-medium border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                        "{searchTerm}"
                        <button onClick={() => setSearchTerm('')} className="hover:text-indigo-900 dark:hover:text-indigo-200 transition-colors"><X className="h-3 w-3"/></button>
                      </span>
                    )}
                    {filters.location && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-medium border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                        {filters.location}
                        <button onClick={() => setFilters(f => ({...f, location: ''}))} className="hover:text-indigo-900 dark:hover:text-indigo-200 transition-colors"><X className="h-3 w-3"/></button>
                      </span>
                    )}
                    {filters.industry.map(ind => (
                      <span key={ind} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-medium border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                        {ind}
                        <button onClick={() => toggleFilter('industry', ind)} className="hover:text-indigo-900 dark:hover:text-indigo-200 transition-colors"><X className="h-3 w-3"/></button>
                      </span>
                    ))}
                    {filters.size.map(sz => (
                      <span key={sz} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-medium border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                        {sz} employees
                        <button onClick={() => toggleFilter('size', sz)} className="hover:text-indigo-900 dark:hover:text-indigo-200 transition-colors"><X className="h-3 w-3"/></button>
                      </span>
                    ))}
                    {filters.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-medium border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                        Verified
                        <button onClick={() => setFilters(f => ({...f, isVerified: false}))} className="hover:text-indigo-900 dark:hover:text-indigo-200 transition-colors"><X className="h-3 w-3"/></button>
                      </span>
                    )}
                    <button onClick={clearFilters} className="text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:underline ml-1 transition-colors">
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </motion.div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default CompaniesList;
