'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/authStore';

const authRoutes = new Set([
  '/login',
  '/register',
  '/signup',
  '/otp',
  '/forgot-password',
  '/reset-password',
]);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const hideChrome = pathname ? authRoutes.has(pathname) : false;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      {!hideChrome && <Navbar />}
      <main className={hideChrome ? '' : 'pt-20'}>{children}</main>
      {!hideChrome && <Footer />}
    </>
  );
}
