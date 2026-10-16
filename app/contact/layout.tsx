import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact QuickServices | Support & Helpdesk in Kashmir',
  description:
    'Need urgent home repairs or booking assistance? Contact QuickServices Kashmir helpline at +91 9682645127 or email Quickservices@gmail.com for fast support.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact QuickServices | Support & Helpdesk in Kashmir',
    description:
      'Direct customer helpline +91 9682645127, email support, and local office contact for QuickServices in Handwara and Srinagar.',
    url: '/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
