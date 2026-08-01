import { Helmet } from 'react-helmet-async'
import { SITE_CONFIG, getCanonicalUrl } from '../../config/seo.config'

/**
 * Reusable SEO Component using react-helmet-async
 * Injects unique title, description, canonical link, OG tags, Twitter cards, robots, and JSON-LD schemas per route.
 */
export default function SEO({
  title,
  description,
  path = '',
  image,
  type = 'website',
  robots = 'index, follow',
  schema = null,
  keywords = [],
}) {
  const fullTitle = title
    ? title.includes(SITE_CONFIG.name)
      ? title
      : `${title} | ${SITE_CONFIG.name}`
    : SITE_CONFIG.defaultTitle

  const metaDescription = description || SITE_CONFIG.defaultDescription
  const canonicalUrl = getCanonicalUrl(path)
  const metaImage = image || SITE_CONFIG.defaultImage

  // Format schema objects for script injection
  const schemaList = Array.isArray(schema) ? schema.filter(Boolean) : [schema].filter(Boolean)

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      <meta name="robots" content={robots} />
      <meta name="author" content={SITE_CONFIG.name} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content={SITE_CONFIG.name} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:locale" content={SITE_CONFIG.locale} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />
      <meta name="twitter:creator" content={SITE_CONFIG.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Dynamic JSON-LD Structured Data */}
      {schemaList.map((sch, index) => (
        <script key={`jsonld-schema-${index}`} type="application/ld+json">
          {JSON.stringify(sch)}
        </script>
      ))}
    </Helmet>
  )
}
