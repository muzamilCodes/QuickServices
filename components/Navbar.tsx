'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BriefcaseBusiness, 
  Menu, 
  X, 
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isHome
          ? scrolled
            ? 'bg-[#0A33A8]/95 shadow-lg shadow-blue-950/20 backdrop-blur-md border-b border-white/10'
            : 'bg-[#0B39BB]'
          : scrolled
          ? 'bg-white/95 shadow-md backdrop-blur-md border-b border-slate-200'
          : 'bg-[#0B39BB] text-white'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0B39BB] shadow-md transition group-hover:scale-105">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className={`text-xl font-extrabold tracking-tight ${isHome || !scrolled ? 'text-white' : 'text-slate-900'}`}>
              Quick<span className="text-amber-300">Services</span>
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Matching Screenshot) */}
        <div className="hidden items-center gap-6 lg:flex">
          <Link
            href="/services"
            className={`text-xs font-bold tracking-wider uppercase transition ${
              isHome || !scrolled ? 'text-white/90 hover:text-white' : 'text-slate-700 hover:text-[#0B39BB]'
            }`}
          >
            POST A JOB
          </Link>
          <Link
            href="/services"
            className={`text-xs font-bold tracking-wider uppercase transition ${
              isHome || !scrolled ? 'text-white/90 hover:text-white' : 'text-slate-700 hover:text-[#0B39BB]'
            }`}
          >
            FIND A SERVICE
          </Link>
          <Link
            href="/benefits"
            className={`text-xs font-bold tracking-wider uppercase transition ${
              isHome || !scrolled ? 'text-white/90 hover:text-white' : 'text-slate-700 hover:text-[#0B39BB]'
            }`}
          >
            FIND A WORK
          </Link>
          <Link
            href="/dashboard/history"
            className={`text-xs font-bold tracking-wider uppercase transition ${
              isHome || !scrolled ? 'text-white/90 hover:text-white' : 'text-slate-700 hover:text-[#0B39BB]'
            }`}
          >
            MY BOOKINGS
          </Link>
        </div>

        {/* Action Buttons (Matching Screenshot) */}
        <div className="hidden items-center gap-3 sm:flex">
          {isAuthenticated ? (
            <>
              {user?.isAdmin && (
                <button
                  onClick={() => router.push('/admin')}
                  className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition hover:brightness-105"
                >
                  ADMIN PANEL
                </button>
              )}
              <button
                onClick={() => router.push('/dashboard/home')}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  isHome || !scrolled
                    ? 'bg-white text-[#0B39BB] hover:bg-slate-100 shadow-sm'
                    : 'bg-[#0B39BB] text-white hover:bg-blue-800'
                }`}
              >
                DASHBOARD
              </button>
              <button
                onClick={handleLogout}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  isHome || !scrolled
                    ? 'border-white/30 text-white/90 hover:bg-white/10'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/login')}
                className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  isHome || !scrolled
                    ? 'bg-white text-[#0B39BB] hover:bg-slate-100 shadow-sm'
                    : 'bg-[#0B39BB] text-white hover:bg-blue-800'
                }`}
              >
                SIGNUP / LOGIN
              </button>
              <button
                onClick={() => router.push('/contact')}
                className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  isHome || !scrolled
                    ? 'border-white/40 text-white hover:bg-white/10'
                    : 'border-[#0B39BB] text-[#0B39BB] hover:bg-blue-50'
                }`}
              >
                BECOME SERVICE AGENT
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen((curr) => !curr)}
          className={`flex h-10 w-10 items-center justify-center rounded-xl md:hidden ${
            isHome || !scrolled ? 'text-white hover:bg-white/10' : 'text-slate-800 hover:bg-slate-100'
          }`}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-[#0B39BB] px-5 pb-6 pt-4 text-white shadow-2xl md:hidden">
          <div className="flex flex-col gap-3 font-semibold text-sm">
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 hover:bg-white/10"
            >
              POST A JOB
            </Link>
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 hover:bg-white/10"
            >
              FIND A SERVICE
            </Link>
            <Link
              href="/benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 hover:bg-white/10"
            >
              FIND A WORK
            </Link>
            <Link
              href="/dashboard/history"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 hover:bg-white/10"
            >
              MY BOOKINGS
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2.5 hover:bg-white/10"
            >
              BECOME SERVICE AGENT
            </Link>
          </div>

          <div className="mt-5 border-t border-white/15 pt-4 space-y-2">
            {isAuthenticated ? (
              <>
                {user?.isAdmin && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/admin');
                    }}
                    className="w-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 py-2.5 text-xs font-bold text-slate-950"
                  >
                    ADMIN PANEL
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push('/dashboard/home');
                  }}
                  className="w-full rounded-full bg-white py-2.5 text-xs font-bold text-[#0B39BB]"
                >
                  DASHBOARD
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-full border border-white/30 py-2.5 text-xs font-semibold text-white hover:bg-white/10"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push('/login');
                }}
                className="w-full rounded-full bg-white py-2.5 text-xs font-bold text-[#0B39BB]"
              >
                SIGNUP / LOGIN
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
