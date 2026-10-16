'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BriefcaseBusiness, 
  CircleUserRound, 
  House, 
  Info, 
  Menu, 
  MessageSquareText, 
  ReceiptText, 
  ShieldCheck, 
  Sparkles, 
  Wrench, 
  X,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  ChevronDown,
  UserPlus
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const mainNavLinks = [
  { name: 'Home', href: '/', icon: House },
  { name: 'Services', href: '/services', icon: Wrench },
  { name: 'Highlights', href: '/offers', icon: Sparkles },
  { name: 'About', href: '/about', icon: Info },
  { name: 'Contact', href: '/contact', icon: MessageSquareText },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [registerDropdownOpen, setRegisterDropdownOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
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
    if (user?.role === 'provider') {
      router.push('/dashboard/provider');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 shadow-md shadow-slate-200/50 backdrop-blur-xl border-b border-slate-200/80 py-2.5'
          : 'bg-white/90 shadow-sm backdrop-blur-lg border-b border-slate-200/60 py-3.5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f62c9,#ff8a3d)] text-white shadow-md shadow-blue-500/20 transition group-hover:scale-105">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-slate-950 leading-none">
              Quick<span className="text-blue-600">Services</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400 mt-0.5">
              Home Support, Faster
            </span>
          </div>
        </Link>

        {/* Center Pill Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/80 p-1.5 shadow-inner backdrop-blur">
          {mainNavLinks.map(({ name, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={name}
                href={href}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? 'border border-blue-200 bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{name}</span>
              </Link>
            );
          })}

          {/* Dedicated Pro CTA inside nav */}
          <Link
            href="/providers/register"
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-sm hover:opacity-95 transition"
            title="Register to offer your services"
          >
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            <span>Join as Pro</span>
          </Link>

          {isAuthenticated && (
            <Link
              href="/dashboard/history"
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                pathname === '/dashboard/history'
                  ? 'border border-blue-200 bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
              }`}
            >
              <ReceiptText className="h-3.5 w-3.5" />
              <span>Bookings</span>
            </Link>
          )}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          {isAuthenticated ? (
            <>
              {/* User Greeting Pill with Role Tag */}
              <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-slate-800">
                <CircleUserRound className="h-3.5 w-3.5 text-blue-600" />
                <span className="max-w-[100px] truncate">{user?.username || 'User'}</span>
                {user?.role === 'provider' ? (
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold">PRO</span>
                ) : user?.isAdmin ? (
                  <span className="rounded-full bg-orange-100 text-orange-800 px-2 py-0.5 text-[10px] font-extrabold">ADMIN</span>
                ) : null}
              </div>

              {/* Admin Panel Button */}
              {user?.isAdmin && (
                <button
                  onClick={() => router.push('/admin')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:opacity-95"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Admin
                </button>
              )}

              {/* Provider Workspace Button */}
              {user?.role === 'provider' ? (
                <button
                  onClick={() => router.push('/dashboard/provider')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <BriefcaseBusiness className="h-3.5 w-3.5" />
                  Pro Dashboard
                </button>
              ) : (
                <button
                  onClick={goToDashboard}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/login')}
                className="rounded-full px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Login
              </button>

              {/* Register Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setRegisterDropdownOpen(!registerDropdownOpen)}
                  onBlur={() => setTimeout(() => setRegisterDropdownOpen(false), 200)}
                  className="flex items-center gap-1 rounded-full bg-[linear-gradient(135deg,#0f62c9,#ff8a3d)] px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:opacity-95 hover:shadow-lg active:scale-95"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {registerDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-200 z-50">
                    <Link
                      href="/register"
                      className="flex flex-col gap-0.5 rounded-xl p-2.5 hover:bg-slate-50 transition text-left"
                    >
                      <span className="text-xs font-bold text-slate-900">Customer Account</span>
                      <span className="text-[11px] text-slate-500">Book and hire home repair specialists</span>
                    </Link>
                    <div className="my-1 border-t border-slate-100" />
                    <Link
                      href="/providers/register"
                      className="flex flex-col gap-0.5 rounded-xl p-2.5 bg-orange-50/50 hover:bg-orange-50 transition text-left"
                    >
                      <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                        <BriefcaseBusiness className="h-3 w-3" /> Service Provider (Pro)
                      </span>
                      <span className="text-[11px] text-slate-600">Apni service offer karein & kamaiye</span>
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile / Tablet Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen((curr) => !curr)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

      </div>

      {/* Mobile Slide-Down Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white/95 px-4 pb-6 pt-3 shadow-xl backdrop-blur-xl lg:hidden max-h-[85vh] overflow-y-auto">
          
          {/* Pro Registration Banner for Mobile */}
          <div className="mb-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-3.5 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-orange-100">Offer Your Services</p>
                <p className="text-sm font-bold mt-0.5">Become a Service Provider</p>
              </div>
              <Link
                href="/providers/register"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl bg-white px-3 py-1.5 text-xs font-extrabold text-orange-600 shadow-sm hover:bg-orange-50"
              >
                Join Now →
              </Link>
            </div>
          </div>

          <div className="space-y-1.5">
            {mainNavLinks.map(({ name, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={name}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? 'border border-blue-200 bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{name}</span>
                </Link>
              );
            })}

            {isAuthenticated && (
              <Link
                href="/dashboard/history"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  pathname === '/dashboard/history'
                    ? 'border border-blue-200 bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ReceiptText className="h-4 w-4" />
                <span>My Bookings</span>
              </Link>
            )}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="mb-2 px-2 flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>Signed in as <span className="font-bold text-slate-900">{user?.username}</span></span>
                  {user?.role === 'provider' && (
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-extrabold">PRO</span>
                  )}
                </div>

                {user?.isAdmin && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/admin');
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 py-3 text-sm font-bold text-white shadow-sm"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    Admin Control Panel
                  </button>
                )}

                {user?.role === 'provider' ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/dashboard/provider');
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm"
                  >
                    <BriefcaseBusiness className="h-4 w-4" />
                    Provider Workspace & Jobs
                  </button>
                ) : (
                  <button
                    onClick={goToDashboard}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white shadow-sm"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    My Customer Dashboard
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-2.5 text-sm font-bold text-rose-600"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push('/login');
                  }}
                  className="flex items-center justify-center rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push('/register');
                  }}
                  className="flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f62c9,#ff8a3d)] py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
