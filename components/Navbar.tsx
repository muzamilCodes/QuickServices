'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BadgePercent, BriefcaseBusiness, CircleUserRound, House, Info, Menu, MessageSquareText, ReceiptText, Wrench, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navLinks = [
  { name: 'Home', href: '/', icon: House },
  { name: 'Services', href: '/services', icon: Wrench },
  { name: 'Offers', href: '/offers', icon: BadgePercent },
  { name: 'About', href: '/about', icon: Info },
  { name: 'Contact', href: '/contact', icon: MessageSquareText },
  { name: 'Bookings', href: '/history', icon: ReceiptText },
  { name: 'Profile', href: '/profile', icon: CircleUserRound },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    router.push('/');
  };

  const goToDashboard = () => {
    setMobileMenuOpen(false);
    router.push('/dashboard/home');
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-black/5 bg-white/90 shadow-sm backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f62c9,#ff8a3d)] text-white shadow-lg shadow-blue-200/60">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">QuickServices</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Home support, faster</p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 rounded-full border border-black/5 bg-white/70 p-1.5 shadow-sm backdrop-blur md:flex">
          {navLinks.map(({ name, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={name}
                href={href}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? 'border border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{name}</span>
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <div className="rounded-full border border-black/5 bg-white/75 px-4 py-2 text-sm text-slate-700 shadow-sm">
                {user?.username || 'User'}
              </div>
              <button
                onClick={goToDashboard}
                className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/login')}
                className="rounded-full px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white/80"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/register')}
                className="rounded-full bg-[linear-gradient(135deg,#0f62c9,#ff8a3d)] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200/70 transition hover:translate-y-[-1px]"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen((current) => !current)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/5 bg-white/80 text-slate-700 shadow-sm backdrop-blur md:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-black/5 bg-white/95 px-4 pb-5 pt-3 shadow-lg backdrop-blur md:hidden">
          <div className="space-y-2">
            {navLinks.map(({ name, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={name}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm ${
                    active
                      ? 'border border-blue-200 bg-blue-50 text-blue-700'
                      : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{name}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 space-y-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={goToDashboard}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
                >
                  Open Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-2xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push('/login');
                  }}
                  className="w-full rounded-2xl border border-black/5 px-4 py-3 text-sm font-medium text-slate-700"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push('/register');
                  }}
                  className="w-full rounded-2xl bg-[linear-gradient(135deg,#0f62c9,#ff8a3d)] px-4 py-3 text-sm font-medium text-white"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
