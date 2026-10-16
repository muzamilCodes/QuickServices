import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Why Choose QuickServices | Safe Doorstep Maintenance',
  description:
    'Discover why Kashmir homeowners trust QuickServices: 30-minute response, background-checked pros, OTP safety, and transparent upfront pricing.',
  alternates: {
    canonical: '/benefits',
  },
  openGraph: {
    title: 'Why Choose QuickServices | Safe Doorstep Maintenance',
    description:
      'Verified technicians, transparent pricing, OTP verification, and doorstep convenience in Srinagar and Kashmir.',
    url: '/benefits',
  },
};

export default function BenefitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
