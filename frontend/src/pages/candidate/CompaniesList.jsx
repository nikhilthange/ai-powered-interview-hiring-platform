import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Building2, MapPin, Users, ChevronRight } from 'lucide-react';
import companyService from '../../services/companyService';
import { toast } from 'react-hot-toast';

const CompaniesList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async (search = '') => {
    setLoading(true);
    try {
      const response = await companyService.getAllCompanies({ search });
      setCompanies(response.data?.companies || []);
    } catch (error) {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies(searchTerm);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Discover Companies
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Find and follow the best places to work.
          </p>
        </div>
      </div>

      <div className="mb-8 max-w-xl">
        <form onSubmit={handleSearch} className="flex rounded-md shadow-sm">
          <div className="relative flex-grow focus-within:z-10">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300"
              placeholder="Search companies by name, industry, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No companies found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link
              key={company.id}
              to={`/companies/${company.id}`}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col group"
            >
              <div className="h-32 bg-gray-200 relative overflow-hidden">
                {company.coverImage && company.coverImage !== 'default-company-cover.png' ? (
                   <img src={`${baseUrl}/uploads/${company.coverImage}`} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                   <div className="w-full h-full bg-gradient-to-r from-primary-100 to-primary-200"></div>
                )}
              </div>
              <div className="px-4 py-5 sm:p-6 flex-grow flex flex-col relative -mt-10">
                <div className="h-20 w-20 rounded-lg shadow-sm border-4 border-white bg-white overflow-hidden flex-shrink-0 z-10 mb-3">
                  {company.logo && company.logo !== 'default-company-logo.png' ? (
                     <img src={`${baseUrl}/uploads/${company.logo}`} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                     <Building2 className="h-full w-full p-4 text-gray-400 bg-gray-50" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                  {company.name}
                </h3>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <span className="truncate">{company.industry}</span>
                </div>
                <div className="mt-4 flex flex-col gap-2 text-sm text-gray-500 flex-grow">
                  <div className="flex items-center">
                    <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <span>{company.employeeCount} employees</span>
                  </div>
                </div>
                <div className="mt-6 border-t border-gray-100 pt-4 flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">{company.followersCount || 0} followers</span>
                  <span className="text-primary-600 font-medium flex items-center group-hover:underline">
                    View Profile <ChevronRight className="ml-1 w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompaniesList;
