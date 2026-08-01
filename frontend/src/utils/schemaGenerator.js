import { SITE_CONFIG, getCanonicalUrl } from '../config/seo.config'

/**
 * Builds schema for WebSite with SearchAction for homepage
 */
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.domain}/#website`,
    url: SITE_CONFIG.domain,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.defaultDescription,
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.domain}/#organization`,
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.domain,
      logo: SITE_CONFIG.logo,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.domain}/jobs?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Builds schema for a standard WebPage
 */
export function buildWebPageSchema({ title, description, path, datePublished, dateModified }) {
  const canonicalUrl = getCanonicalUrl(path)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonicalUrl}/#webpage`,
    url: canonicalUrl,
    name: title,
    description: description,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_CONFIG.domain}/#website`,
    },
    about: {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_CONFIG.domain}/#software`,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.domain}/#organization`,
    },
    ...(datePublished ? { datePublished } : {}),
    dateModified: dateModified || new Date().toISOString().split('T')[0],
  }
}

/**
 * Builds schema for BreadcrumbList
 * @param {Array<{ name: string, path: string }>} items 
 */
export function buildBreadcrumbSchema(items = []) {
  const itemListElement = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_CONFIG.domain,
    },
    ...items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: item.name,
      item: getCanonicalUrl(item.path),
    })),
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  }
}

/**
 * Builds schema for FAQPage
 * @param {Array<{ question: string, answer: string }>} faqs 
 */
export function buildFAQSchema(faqs = []) {
  if (!faqs || faqs.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Builds schema for HowTo guide (e.g. ATS Resume Optimization, Mock Interview Prep)
 */
export function buildHowToSchema({ name, description, steps = [] }) {
  if (!steps || steps.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: name,
    description: description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name || `Step ${index + 1}`,
      text: step.text,
      ...(step.url ? { url: getCanonicalUrl(step.url) } : {}),
    })),
  }
}

/**
 * Builds schema for a JobPosting
 */
export function buildJobPostingSchema(job) {
  if (!job) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || job.summary || 'Technical job position listed on HireMate.',
    datePosted: job.createdAt || job.datePosted || new Date().toISOString(),
    validThrough: job.expiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    employmentType: job.employmentType || job.type || 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.companyName || job.company?.name || 'HireMate Tech Partner',
      sameAs: job.companyWebsite || job.company?.website || SITE_CONFIG.domain,
      logo: job.companyLogo || job.company?.logo || SITE_CONFIG.logo,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location || job.city || 'Remote',
        addressCountry: job.country || 'US',
      },
    },
    baseSalary: job.salary ? {
      '@type': 'MonetaryAmount',
      currency: job.currency || 'USD',
      value: {
        '@type': 'QuantitativeValue',
        value: job.salary,
        unitText: job.salaryPeriod || 'YEAR',
      },
    } : undefined,
  }
}

/**
 * Builds schema for Person (e.g. Developer Profile)
 */
export function buildPersonSchema(user) {
  if (!user) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.name || user.username || 'HireMate User',
    url: getCanonicalUrl(`/u/${user.username || 'profile'}`),
    jobTitle: user.title || user.role || 'Software Engineer',
    worksFor: user.company ? {
      '@type': 'Organization',
      name: user.company,
    } : undefined,
    sameAs: [
      user.github ? `https://github.com/${user.github.replace('@', '')}` : null,
      user.linkedin ? (user.linkedin.startsWith('http') ? user.linkedin : `https://linkedin.com/in/${user.linkedin}`) : null,
    ].filter(Boolean),
  }
}

/**
 * Builds schema for ItemList (e.g. Job Listings or Companies)
 */
export function buildItemListSchema({ name, description, items = [] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: name,
    description: description,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.title || item.name || `Item ${index + 1}`,
      url: getCanonicalUrl(item.path || item.url || ''),
    })),
  }
}
