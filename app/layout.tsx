import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import AppShell from '@/components/AppShell';
import JsonLd from '@/components/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://quick-services-indol.vercel.app';
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-QUICKSERV01';

export const viewport: Viewport = {
  themeColor: '#0f62c9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'QuickServices | Verified Home Services & Repair in Kashmir',
    template: '%s | QuickServices',
  },
  description:
    'Book verified plumbers, electricians, appliance technicians, and home cleaners across Kashmir. 30-min fast dispatch, secure OTP booking, and clear upfront pricing.',
  keywords: [
    'QuickServices',
    'Quick Services Kashmir',
    'Home services Srinagar',
    'Plumber in Handwara',
    'Electrician Kupwara',
    'Appliance repair Kashmir',
    'Home cleaning Srinagar',
    'Verified local technician',
    'Doorstep repair Kashmir',
    'Muzamil War',
  ],
  authors: [{ name: 'Muzamil War', url: SITE_URL }],
  creator: 'Muzamil War',
  publisher: 'QuickServices',
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'QuickServices',
    title: 'QuickServices | Verified Home Services & Repair in Kashmir',
    description:
      'Book verified plumbers, electricians, cleaners, and appliance technicians across Kashmir with fast 30-min dispatch and OTP confirmation.',
    images: [
      {
        url: '/hero-user.jpg',
        width: 1200,
        height: 630,
        alt: 'QuickServices Verified Home Services in Kashmir - Founded by Muzamil War',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuickServices | Verified Home Services & Repair in Kashmir',
    description:
      'Book verified plumbers, electricians, cleaners, and appliance technicians across Kashmir with fast 30-min dispatch.',
    images: ['/hero-user.jpg'],
    creator: '@getsocialgrow',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'quickservices_gsc_token',
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || 'quickservices_bing_token',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <JsonLd />
        {/* Google Analytics 4 (GA4) */}
        {GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="antialiased text-slate-900 bg-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
