import { siteConfig } from '@/config/site'

export function LocalBusinessJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GroceryStore',
    name: siteConfig.name,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '6421 S King Dr Suite B',
      addressLocality: 'Chicago',
      addressRegion: 'IL',
      postalCode: '60637',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.address.lat,
      longitude: siteConfig.address.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '20:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday'],
        opens: '10:00',
        closes: '18:00',
      },
    ],
    servesCuisine: 'African',
    priceRange: '$$',
    hasMap: `https://maps.google.com/?q=${siteConfig.address.lat},${siteConfig.address.lng}`,
    sameAs: Object.values(siteConfig.social).filter(Boolean),
    description: 'Authentic African groceries and food products delivered to your door in Chicago. Serving Woodlawn, Hyde Park, and surrounding South Side neighborhoods.',
    keywords: siteConfig.keywords.join(', '),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
