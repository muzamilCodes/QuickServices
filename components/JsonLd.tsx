import React from 'react';
import { allServices } from '@/lib/services';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://quick-services-indol.vercel.app';

export default function JsonLd() {
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': ['HomeAndConstructionBusiness', 'LocalBusiness', 'ProfessionalService'],
    '@id': `${BASE_URL}/#business`,
    name: 'QuickServices',
    alternateName: 'Quick Services Kashmir',
    url: BASE_URL,
    logo: `${BASE_URL}/hero-user.jpg`,
    image: `${BASE_URL}/hero-user.jpg`,
    description:
      'QuickServices connects homeowners and businesses in Kashmir with verified plumbers, electricians, appliance technicians, and cleaning specialists with upfront pricing and OTP verification.',
    telephone: '+919682645127',
    email: 'Quickservices@gmail.com',
    priceRange: '₹249 - ₹999',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Handwara Qalamabad Main Road',
      addressLocality: 'Handwara',
      addressRegion: 'Jammu & Kashmir',
      postalCode: '193221',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '34.4024',
      longitude: '74.2831',
    },
    areaServed: [
      { '@type': 'City', name: 'Srinagar' },
      { '@type': 'City', name: 'Handwara' },
      { '@type': 'City', name: 'Kupwara' },
      { '@type': 'City', name: 'Baramulla' },
      { '@type': 'State', name: 'Jammu and Kashmir' },
    ],
    founder: {
      '@type': 'Person',
      name: 'Muzamil War',
      jobTitle: 'Founder & Verified Services Lead',
      url: BASE_URL,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '08:00',
        closes: '20:00',
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Home Repair & Maintenance Services',
      itemListElement: allServices.map((service, index) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service.name,
          description: service.description,
          provider: {
            '@id': `${BASE_URL}/#business`,
          },
        },
        price: service.numericPrice,
        priceCurrency: 'INR',
        position: index + 1,
      })),
    },
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'QuickServices',
    description: 'Verified home repair and professional doorstep maintenance in Kashmir',
    publisher: {
      '@id': `${BASE_URL}/#business`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/services?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How quickly can a QuickServices specialist arrive at my doorstep in Kashmir?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our average technician dispatch time is 30 minutes for urgent requests across Srinagar, Handwara, Kupwara, and Baramulla.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the OTP verification work for home service bookings?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A secure 4-digit OTP is sent directly to your email inbox to verify your booking, protect your personal information, and eliminate fake orders.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are the repair prices fixed or will there be hidden charges?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'QuickServices provides transparent upfront pricing starting at ₹249 with zero surprise visit fees. Any spare parts needed are quoted prior to replacement.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I call the assigned technician directly before they arrive?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, once assigned, the specialist’s direct phone number is accessible in your booking radar and dashboard so you can coordinate arrival and gate access.',
        },
      },
      {
        '@type': 'Question',
        name: 'Who founded QuickServices and how are specialists vetted?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'QuickServices was founded by Muzamil War to bring verified, accountable doorstep trades to Kashmir. Every technician undergoes background checks and skill verification.',
        },
      },
    ],
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'QuickServices',
    url: BASE_URL,
    logo: `${BASE_URL}/hero-user.jpg`,
    sameAs: [
      'https://twitter.com/getsocialgrow',
      'https://www.linkedin.com/in/muzamil-war',
      'https://github.com/muzamilCodes/QuickServices'
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+919682645127',
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi', 'Urdu', 'Kashmiri']
      }
    ],
    founder: {
      '@type': 'Person',
      name: 'Muzamil War',
      jobTitle: 'Founder & CEO',
      knowsAbout: ['Home Maintenance', 'Plumbing Diagnostics', 'Electrical Systems', 'Appliance Servicing']
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
