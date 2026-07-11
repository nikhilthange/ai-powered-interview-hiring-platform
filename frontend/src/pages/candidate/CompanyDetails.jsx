import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Globe, Users, Briefcase, MapPin, ExternalLink, Heart, ArrowLeft, Link as LinkIcon } from 'lucide-react';
import companyService from '../../services/companyService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const CompanyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  useEffect(() => {
    // Check if the current user is following this company
    if (user?.followingCompanies && company) {
      setIsFollowing(user.followingCompanies.includes(company.id));
    }
  }, [user, company]);

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
        // Optional: Update user context or refetch user data to keep state in sync
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900">Company not found</h2>
        <Link to="/companies" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-500">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to companies
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Cover Image */}
      <div className="h-64 sm:h-80 w-full bg-gray-200 relative">
        {company.coverImage && company.coverImage !== 'default-company-cover.png' ? (
          <img src={`${baseUrl}/uploads/${company.coverImage}`} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary-600 to-primary-800 opacity-90"></div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 sm:-mt-24">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sm:p-10 flex flex-col sm:flex-row items-center sm:items-end justify-between">
            <div className="flex flex-col sm:flex-row items-center sm:items-end w-full sm:w-auto text-center sm:text-left">
              <div className="h-32 w-32 rounded-xl shadow-md border-4 border-white bg-white overflow-hidden flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                {company.logo && company.logo !== 'default-company-logo.png' ? (
                  <img src={`${baseUrl}/uploads/${company.logo}`} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <Building2 className="h-full w-full p-6 text-gray-400 bg-gray-50" />
                )}
              </div>
              <div className="mb-2">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{company.name}</h1>
                <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start text-sm text-gray-600 gap-4">
                  <span className="flex items-center"><Briefcase className="mr-1.5 h-4 w-4 text-gray-400" />{company.industry}</span>
                  <span className="flex items-center"><Users className="mr-1.5 h-4 w-4 text-gray-400" />{company.employeeCount}</span>
                  {company.website && (
                     <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary-600 hover:underline">
                       <Globe className="mr-1.5 h-4 w-4" /> Website <ExternalLink className="ml-1 h-3 w-3" />
                     </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 sm:mt-0 flex flex-col sm:items-end space-y-3 w-full sm:w-auto">
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-800 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {isFollowing ? (
                  <>Following</>
                ) : (
                  <><Heart className="mr-2 h-4 w-4" /> Follow Company</>
                )}
              </button>
              <div className="text-sm font-medium text-gray-500 text-center sm:text-right w-full">
                {company.followersCount || 0} Followers
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About Us</h2>
              <div className="prose prose-primary max-w-none text-gray-600">
                <p className="whitespace-pre-line">{company.about}</p>
              </div>
            </section>

            {/* Culture */}
            {company.culture && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Company Culture</h2>
                <div className="prose prose-primary max-w-none text-gray-600">
                  <p className="whitespace-pre-line">{company.culture}</p>
                </div>
              </section>
            )}

            {/* Office Photos */}
            {company.officePhotos && company.officePhotos.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Life at {company.name}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {company.officePhotos.map((photo, idx) => (
                    <div key={idx} className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-100">
                      <img src={`${baseUrl}/uploads/${photo}`} alt={`Office ${idx + 1}`} className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-8">
            {/* Benefits */}
            {company.benefits && company.benefits.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Perks & Benefits</h2>
                <ul className="space-y-3">
                  {company.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center mt-0.5 mr-3">
                        <div className="h-2 w-2 rounded-full bg-primary-600"></div>
                      </div>
                      <span className="text-gray-600 text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Socials */}
            {(company.socialLinks?.linkedin || company.socialLinks?.twitter || company.socialLinks?.facebook) && (
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Connect</h2>
                <div className="flex space-x-4">
                  {company.socialLinks?.linkedin && (
                    <a href={company.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                      <LinkIcon className="h-6 w-6" />
                    </a>
                  )}
                  {company.socialLinks?.twitter && (
                    <a href={company.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                      <LinkIcon className="h-6 w-6" />
                    </a>
                  )}
                  {company.socialLinks?.facebook && (
                    <a href={company.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-800 transition-colors">
                      <LinkIcon className="h-6 w-6" />
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
