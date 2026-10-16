import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book a Verified Service Specialist | QuickServices Kashmir',
  description:
    'Book verified plumbers, electricians, cleaners, and appliance technicians in Kashmir. Select your date, get instant OTP confirmation, and track live.',
  alternates: {
    canonical: '/booking',
  },
  openGraph: {
    title: 'Book a Verified Service Specialist | QuickServices Kashmir',
    description:
      'Doorstep service bookings across Kashmir with fast dispatch and verified specialists.',
    url: '/booking',
  },
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
