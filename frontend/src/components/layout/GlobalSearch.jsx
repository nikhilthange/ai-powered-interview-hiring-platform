import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, Building2, User, Target, Loader2, X, Clock, TrendingUp } from 'lucide-react';
import { searchApi } from '../../services/searchApi';
import { useClickOutside } from '../../hooks/useClickOutside';
import { cn, getMediaUrl } from '../../lib/utils';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState({ jobs: [], companies: [], users: [], skills: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const trendingSearches = ['React Developer', 'Software Engineer', 'Full Stack Developer', 'Google', 'Microsoft'];

  useEffect(() => {
    const saved = localStorage.getItem('hiremate_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse recent searches', error);
      }
    }
  }, []);

  const saveRecentSearch = (term) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('hiremate_recent_searches', JSON.stringify(updated));
  };

  useClickOutside(() => setIsOpen(false), searchRef);

  // Debounced Search
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults({ jobs: [], companies: [], users: [], skills: [] });
        return;
      }
      setLoading(true);
      try {
        const res = await searchApi.globalSearch(query);
        setResults(res.data.data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Global Keyboard Shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute flattened list for keyboard nav
  const flatList = [];
  if (query.trim()) {
    results.jobs.forEach(item => flatList.push({ type: 'job', ...item }));
    results.companies.forEach(item => flatList.push({ type: 'company', ...item }));
    results.skills.forEach(item => flatList.push({ type: 'skill', ...item }));
    results.users.forEach(item => flatList.push({ type: 'user', ...item }));
  } else {
    recentSearches.forEach(term => flatList.push({ type: 'history', name: term }));
    if (recentSearches.length === 0) {
      trendingSearches.forEach(term => flatList.push({ type: 'trending', name: term }));
    }
  }

  const handleSelect = (item) => {
    saveRecentSearch(item.name || item.title || query);
    setIsOpen(false);
    setQuery('');
    
    if (item.type === 'job') navigate(`/jobs/${item._id}`);
    else if (item.type === 'company') navigate(`/companies/${item._id}`);
    else if (item.type === 'user') navigate(`/profile/${item._id}`);
    else if (item.type === 'skill' || item.type === 'history' || item.type === 'trending') {
      navigate(`/jobs?search=${encodeURIComponent(item.name || item.title)}`);
    }
  };

  // Keyboard navigation within dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < flatList.length - 1 ? prev + 1 : 0));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatList.length - 1));
      }
      if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < flatList.length) {
        e.preventDefault();
        handleSelect(flatList[selectedIndex]);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, flatList, selectedIndex]);

  // Reset selection on query change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const renderSection = (title, items, icon, type) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4 last:mb-0">
        <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2 px-3">{title}</h3>
        <div className="space-y-1">
          {items.map((item) => {
            const index = flatList.findIndex(f => f._id === item._id && f.type === type);
            const isSelected = index === selectedIndex;
            return (
              <div
                key={item._id || item.name}
                onClick={() => handleSelect({ type, ...item })}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors",
                  isSelected ? "bg-[var(--color-primary-50)] dark:bg-indigo-500/10" : "hover:bg-[var(--bg-secondary)]"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-lg shrink-0",
                  isSelected ? "bg-white dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" : "bg-[var(--bg-secondary)] text-[var(--text-tertiary)]"
                )}>
                  {type === 'company' && item.logo && item.logo !== 'default-company-logo.png' ? (
                    <img src={getMediaUrl(item.logo)} alt={item.name} className="h-6 w-6 object-contain rounded-md" />
                  ) : type === 'user' && item.avatarUrl ? (
                    <img src={getMediaUrl(item.avatarUrl)} alt={item.name} className="h-full w-full object-cover rounded-lg" />
                  ) : (
                    icon
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn("text-sm font-medium truncate", isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-[var(--text-primary)]")}>
                    {item.title || item.name}
                  </div>
                  {(item.companyId?.name || item.industry || item.email || item.location) && (
                    <div className="text-xs text-[var(--text-secondary)] truncate">
                      {item.companyId?.name || item.industry || item.email || item.location}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const hasResults = results.jobs.length > 0 || results.companies.length > 0 || results.users.length > 0 || results.skills.length > 0;

  return (
    <div ref={searchRef} className="relative w-full max-w-[420px] group z-[100]">
      <div className={cn(
        "relative flex items-center transition-all duration-300",
        isOpen ? "z-50" : ""
      )}>
        <Search className={cn("absolute left-3 h-4 w-4 transition-colors", isOpen ? "text-[var(--color-primary-500)]" : "text-[var(--text-tertiary)] group-focus-within:text-[var(--color-primary-500)]")} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search jobs, companies, skills..."
          className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] pl-9 pr-14 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 focus:border-[var(--color-primary-500)] transition-all"
        />
        {query ? (
          <button onClick={handleClear} className="absolute right-3 p-1 rounded-md text-[var(--text-tertiary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="absolute right-3 hidden sm:inline-flex items-center gap-0.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] px-1.5 py-0.5 text-[10px] text-[var(--text-tertiary)] font-mono">
            ⌘K
          </kbd>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-2 left-0 right-0 max-h-[80vh] overflow-y-auto surface-card p-2 shadow-2xl rounded-2xl border border-[var(--border-color)] scrollbar-thin z-50"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary-500)] mb-3" />
                <p className="text-sm text-[var(--text-secondary)]">Searching across HireMate...</p>
              </div>
            ) : query.trim() !== '' ? (
              hasResults ? (
                <>
                  {renderSection('Jobs', results.jobs, <Briefcase className="h-4 w-4" />, 'job')}
                  {renderSection('Companies', results.companies, <Building2 className="h-4 w-4" />, 'company')}
                  {renderSection('People', results.users, <User className="h-4 w-4" />, 'user')}
                  {renderSection('Skills', results.skills, <Target className="h-4 w-4" />, 'skill')}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <div className="h-12 w-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-3">
                    <Search className="h-6 w-6 text-[var(--text-tertiary)]" />
                  </div>
                  <p className="text-[var(--text-primary)] font-medium">No results found for "{query}"</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Try checking for typos or using different keywords.</p>
                </div>
              )
            ) : (
              <>
                {recentSearches.length > 0 ? (
                  renderSection('Recent Searches', recentSearches.map(s => ({ name: s })), <Clock className="h-4 w-4" />, 'history')
                ) : (
                  renderSection('Trending Searches', trendingSearches.map(s => ({ name: s })), <TrendingUp className="h-4 w-4" />, 'trending')
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
