import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About QuickServices | Verified Doorstep Trades in Kashmir',
  description:
    'Learn about QuickServices mission, our Kashmir founder Muzamil War, verified specialist background checks, and same-day doorstep quality assurance.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About QuickServices | Verified Doorstep Trades in Kashmir',
    description:
      'Learn about QuickServices mission, verified tradesmen network, and doorstep service standards across Jammu & Kashmir.',
    url: '/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
