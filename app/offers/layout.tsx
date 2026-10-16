import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Service Offers & Discounts | QuickServices Kashmir',
  description:
    'Save on verified plumbing, electrical, and appliance repair with exclusive QuickServices offers across Srinagar, Handwara, and Kashmir.',
  alternates: {
    canonical: '/offers',
  },
  openGraph: {
    title: 'Service Offers & Discounts | QuickServices Kashmir',
    description:
      'Verified home service deals, bundled maintenance savings, and seasonal repair discounts in Kashmir.',
    url: '/offers',
  },
};

export default function OffersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
