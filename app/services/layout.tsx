import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Home Services & Doorstep Repair in Kashmir',
  description:
    'Explore 20+ verified home repair services across Srinagar and Kashmir. Plumbers, electricians, cleaners, and appliance experts with transparent pricing.',
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'All Home Services & Doorstep Repair in Kashmir | QuickServices',
    description:
      'Book verified local tradesmen for plumbing, electrical, cleaning, and appliance repair with same-day dispatch across Kashmir.',
    url: '/services',
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
