import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Save, Upload, Link as LinkIcon, Users, Image as ImageIcon, MapPin } from 'lucide-react';
import companyService from '../../services/companyService';
import { toast } from 'react-hot-toast';

const CompanyProfileForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    about: '',
    website: '',
    industry: '',
    employeeCount: '1-10',
    culture: '',
    benefits: '', // we will store as comma separated string for the form
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
          
          const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';
          
          setPreviews({
            logo: comp.logo && comp.logo !== 'default-company-logo.png' ? `${baseUrl}/uploads/${comp.logo}` : null,
            coverImage: comp.coverImage && comp.coverImage !== 'default-company-cover.png' ? `${baseUrl}/uploads/${comp.coverImage}` : null,
            officePhotos: comp.officePhotos?.map(p => `${baseUrl}/uploads/${p}`) || []
          });
        }
      } catch (error) {
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
      const newFiles = Array.from(selectedFiles).slice(0, 5); // limit to 5
      setFiles(prev => ({ ...prev, officePhotos: newFiles }));
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => ({ ...prev, officePhotos: newPreviews }));
    } else {
      const file = selectedFiles[0];
      setFiles(prev => ({ ...prev, [type]: file }));
      setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('about', formData.about);
      data.append('website', formData.website);
      data.append('industry', formData.industry);
      data.append('employeeCount', formData.employeeCount);
      data.append('culture', formData.culture);
      
      // Parse benefits
      const benefitsArr = formData.benefits.split(',').map(b => b.trim()).filter(b => b);
      data.append('benefits', JSON.stringify(benefitsArr));

      // Parse social
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Building2 className="mr-3 h-8 w-8 text-primary-600" />
          Company Profile
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Set up your company's branding and information to attract top talent.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
        
        {/* Branding Section */}
        <div className="space-y-6 pt-8 sm:pt-10 sm:space-y-5">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <ImageIcon className="mr-2 h-5 w-5 text-gray-400" />
              Branding
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Upload your logo and cover image.
            </p>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
            <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Logo
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <div className="flex items-center">
                <span className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
                  {previews.logo ? (
                    <img src={previews.logo} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-full w-full p-3 text-gray-300" />
                  )}
                </span>
                <label className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <span>Change</span>
                  <input type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                </label>
              </div>
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
            <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Cover Image
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <div className="max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative group overflow-hidden">
                {previews.coverImage ? (
                  <>
                    <img src={previews.coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="relative z-10 text-center">
                      <label className="cursor-pointer bg-white/80 rounded-md px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-500">
                        <span>Change Cover</span>
                        <input type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileChange(e, 'coverImage')} />
                      </label>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Upload a file</span>
                        <input type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileChange(e, 'coverImage')} />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="space-y-6 pt-8 sm:pt-10 sm:space-y-5">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Basic Information</h3>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Company Name *
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="max-w-lg block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Industry *
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="text"
                name="industry"
                id="industry"
                required
                placeholder="e.g. Information Technology"
                value={formData.industry}
                onChange={handleChange}
                className="max-w-lg block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
            <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Company Size
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <select
                id="employeeCount"
                name="employeeCount"
                value={formData.employeeCount}
                onChange={handleChange}
                className="max-w-lg block focus:ring-primary-500 focus:border-primary-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              >
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
            <label htmlFor="about" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              About *
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <textarea
                id="about"
                name="about"
                rows={4}
                required
                value={formData.about}
                onChange={handleChange}
                className="max-w-lg shadow-sm block w-full focus:ring-primary-500 focus:border-primary-500 sm:text-sm border border-gray-300 rounded-md"
                placeholder="Tell candidates what your company does..."
              />
            </div>
          </div>
        </div>

        {/* Culture & Perks Section */}
        <div className="space-y-6 pt-8 sm:pt-10 sm:space-y-5">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <Users className="mr-2 h-5 w-5 text-gray-400" />
              Culture & Benefits
            </h3>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
            <label htmlFor="culture" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Company Culture
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <textarea
                id="culture"
                name="culture"
                rows={3}
                value={formData.culture}
                onChange={handleChange}
                className="max-w-lg shadow-sm block w-full focus:ring-primary-500 focus:border-primary-500 sm:text-sm border border-gray-300 rounded-md"
                placeholder="Describe the work environment, values, etc."
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
            <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Benefits & Perks
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="text"
                name="benefits"
                id="benefits"
                value={formData.benefits}
                onChange={handleChange}
                className="max-w-lg block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                placeholder="e.g. Health Insurance, 401k, Remote Work (comma separated)"
              />
            </div>
          </div>
        </div>

        {/* Links & Socials Section */}
        <div className="space-y-6 pt-8 sm:pt-10 sm:space-y-5">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <LinkIcon className="mr-2 h-5 w-5 text-gray-400" />
              Links & Social
            </h3>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Website
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="url"
                name="website"
                id="website"
                value={formData.website}
                onChange={handleChange}
                className="max-w-lg block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              LinkedIn
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="url"
                name="linkedin"
                id="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="max-w-lg block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>
          </div>
          
          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Twitter
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="url"
                name="twitter"
                id="twitter"
                value={formData.twitter}
                onChange={handleChange}
                className="max-w-lg block w-full shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                placeholder="https://twitter.com/yourcompany"
              />
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/recruiter/dashboard')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile'}
              <Save className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfileForm;
