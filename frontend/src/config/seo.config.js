/**
 * Centralized SEO & GEO Configuration for HireMate
 * Production Domain: https://hiremate-portal.vercel.app
 */

export const SITE_CONFIG = {
  name: 'HireMate',
  legalName: 'HireMate AI Technologies Inc.',
  domain: 'https://hiremate-portal.vercel.app',
  defaultTitle: 'HireMate - AI-Powered Interview Preparation & Resume Analyzer Platform',
  defaultDescription: 'Supercharge your tech career with HireMate. Access AI mock interviews with real-time feedback, ATS resume analysis, skill gap detection, and personalized career roadmaps.',
  themeColor: '#6366F1',
  locale: 'en_US',
  type: 'website',
  twitterHandle: '@HireMateAI',
  defaultImage: 'https://hiremate-portal.vercel.app/og-image.png',
  logo: 'https://hiremate-portal.vercel.app/logo.svg',
  favicon: '/favicon.svg',
  searchUrl: 'https://hiremate-portal.vercel.app/jobs?q={search_term_string}',
  contactEmail: 'support@hiremate-portal.vercel.app',
  applicationCategory: 'BusinessApplication / Career & Recruitment Tech',
  operatingSystem: 'All Modern Web Browsers (Chrome, Firefox, Safari, Edge)',
}

/**
 * Builds canonical URL for a given relative route path
 * @param {string} path 
 * @returns {string} Absolute canonical URL
 */
export const getCanonicalUrl = (path = '') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  // Remove trailing slash for root normalization unless it's root '/'
  const normalizedPath = cleanPath === '/' ? '' : cleanPath.replace(/\/$/, '')
  return `${SITE_CONFIG.domain}${normalizedPath}`
}

/**
 * Global Organization Entity for Schema.org JSON-LD
 */
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_CONFIG.domain}/#organization`,
  name: SITE_CONFIG.name,
  legalName: SITE_CONFIG.legalName,
  url: SITE_CONFIG.domain,
  logo: SITE_CONFIG.logo,
  description: SITE_CONFIG.defaultDescription,
  sameAs: [
    'https://twitter.com/HireMateAI',
    'https://github.com/nikhilthange/ai-powered-interview-hiring-platform',
    'https://linkedin.com/company/hiremate-ai',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: SITE_CONFIG.contactEmail,
    contactType: 'customer support',
    availableLanguage: ['English'],
  },
}

/**
 * Global SoftwareApplication Schema
 */
export const SOFTWARE_APPLICATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${SITE_CONFIG.domain}/#software`,
  name: SITE_CONFIG.name,
  operatingSystem: SITE_CONFIG.operatingSystem,
  applicationCategory: SITE_CONFIG.applicationCategory,
  url: SITE_CONFIG.domain,
  offers: {
    '@type': 'Offer',
    price: '0.00',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '1250',
    reviewCount: '980',
    bestRating: '5',
    worstRating: '1',
  },
  publisher: {
    '@id': `${SITE_CONFIG.domain}/#organization`,
  },
}
