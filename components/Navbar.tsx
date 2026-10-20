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
  Sparkles, 
  Wrench, 
  X,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  UserPlus
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/components/ThemeProvider';
import NotificationBell from '@/components/NotificationBell';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const isPro = user?.role === 'provider';
  const isAdmin = Boolean(user?.isAdmin);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isDark
          ? scrolled
            ? 'bg-[#0d1117]/97 shadow-lg shadow-black/40 backdrop-blur-xl border-b border-white/8 py-2.5'
            : 'bg-[#0d1117]/90 shadow-sm backdrop-blur-lg border-b border-white/6 py-3'
          : scrolled
            ? 'bg-white/95 shadow-sm border-b border-slate-200/80 backdrop-blur-lg py-2.5'
            : 'bg-white/85 shadow-xs border-b border-black/5 backdrop-blur-md py-3'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* ================= 1. Brand Logo ================= */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f62c9,#ff8a3d)] text-white shadow-md shadow-blue-500/20 transition group-hover:scale-105">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className={`text-lg font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Quick<span className={isDark ? 'text-[#4f9cff]' : 'text-[#0f62c9]'}>Services</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mt-1">
              Home Support, Faster
            </span>
          </div>
        </Link>

        {/* ================= 2. Center Navigation Links (Clean & Spacious) ================= */}
        <nav
          className={`hidden lg:flex items-center gap-1 rounded-full border px-3 py-1.5 shadow-inner backdrop-blur ${
            isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-black/[0.03]'
          }`}
        >
          {mainNavLinks.map(({ name, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={name}
                href={href}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                  isDark
                    ? active
                      ? 'border border-[#4f9cff]/30 bg-[#4f9cff]/15 text-[#4f9cff] shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/8'
                    : active
                      ? 'border border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-white/80'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{name}</span>
              </Link>
            );
          })}
        </nav>

        {/* ================= 3. Right Action Buttons & Theme Switcher ================= */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          {/* Theme Toggle (Original Light / Dark) */}
          <ThemeToggle />

          {/* If NOT logged in */}
          {!isAuthenticated ? (
            <>
              {/* Login Button */}
              <button
                onClick={() => router.push('/login')}
                className={`rounded-full px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
                  isDark
                    ? 'text-slate-300 hover:bg-white/8 hover:text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                Login
              </button>

              {/* Register Button */}
              <button
                onClick={() => router.push('/register')}
                className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#0f62c9,#ff8a3d)] px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:opacity-95 active:scale-95 whitespace-nowrap"
              >
                <UserPlus className="h-3.5 w-3.5 shrink-0" />
                <span>Register</span>
              </button>
            </>
          ) : (
            /* If Logged In */
            <>
              {/* Notification Bell */}
              <NotificationBell />

              {/* User Identity Pill */}
              <div
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold whitespace-nowrap ${
                  isDark
                    ? 'border-white/10 bg-white/6 text-slate-200'
                    : 'border-slate-200 bg-slate-50 text-slate-800'
                }`}
              >
                <CircleUserRound className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="max-w-[120px] truncate">{user?.username || 'Account'}</span>
                {isAdmin ? (
                  <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-black tracking-wide">
                    ADMIN
                  </span>
                ) : isPro ? (
                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-black tracking-wide">
                    PRO
                  </span>
                ) : null}
              </div>

              {/* Role-specific Action Button */}
              {isAdmin ? (
                <button
                  onClick={() => router.push('/admin')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition whitespace-nowrap"
                >
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  <span>Admin Portal</span>
                </button>
              ) : isPro ? (
                <button
                  onClick={() => router.push('/dashboard/provider')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition whitespace-nowrap"
                >
                  <BriefcaseBusiness className="h-3.5 w-3.5 shrink-0" />
                  <span>Pro Workspace</span>
                </button>
              ) : (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition whitespace-nowrap"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
                  <span>Dashboard</span>
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={`inline-flex items-center justify-center rounded-full border p-2 transition shrink-0 ${
                  isDark
                    ? 'border-white/10 text-slate-400 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400'
                    : 'border-slate-200 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600'
                }`}
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          )}

        </div>

        {/* ================= 4. Mobile / Tablet Header Actions ================= */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen((curr) => !curr)}
            className={`flex h-10 w-10 items-center justify-center rounded-2xl border shadow-sm transition ${
              isDark
                ? 'border-white/10 bg-white/6 text-slate-300 hover:bg-white/12'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* ================= 5. Mobile Slide-Down Drawer ================= */}
      {mobileMenuOpen && (
        <div
          className={`border-t px-4 pb-6 pt-3 shadow-xl backdrop-blur-xl lg:hidden max-h-[85vh] overflow-y-auto ${
            isDark
              ? 'border-white/8 bg-[#0d1117]/98 text-white'
              : 'border-slate-100 bg-white/95 text-slate-900'
          }`}
        >
          <div className="space-y-1.5">
            {mainNavLinks.map(({ name, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={name}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isDark
                      ? active
                        ? 'border border-[#4f9cff]/30 bg-[#4f9cff]/10 text-[#4f9cff]'
                        : 'text-slate-300 hover:bg-white/6'
                      : active
                        ? 'border border-blue-200 bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
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
                    ? isDark
                      ? 'border border-[#4f9cff]/30 bg-[#4f9cff]/10 text-[#4f9cff]'
                      : 'border border-blue-200 bg-blue-50 text-blue-700'
                    : isDark
                      ? 'text-slate-300 hover:bg-white/6'
                      : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ReceiptText className="h-4 w-4 shrink-0" />
                <span>My Bookings</span>
              </Link>
            )}
          </div>

          <div className={`mt-4 border-t pt-4 space-y-2 ${isDark ? 'border-white/8' : 'border-slate-100'}`}>
            {isAuthenticated ? (
              <>
                <div className="mb-2 px-2 flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>Signed in as <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.username}</span></span>
                  {isAdmin ? (
                    <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-black">ADMIN</span>
                  ) : isPro ? (
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-black">PRO</span>
                  ) : null}
                </div>

                {isAdmin ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/admin');
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 py-3 text-sm font-bold text-white shadow-sm"
                  >
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    Admin Control Panel
                  </button>
                ) : isPro ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/dashboard/provider');
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm"
                  >
                    <BriefcaseBusiness className="h-4 w-4 shrink-0" />
                    Provider Workspace & Jobs
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/dashboard');
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white shadow-sm"
                  >
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    My Customer Dashboard
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-2.5 text-sm font-bold text-rose-600"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
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
                  className={`flex items-center justify-center rounded-2xl border py-3 text-sm font-bold transition ${
                    isDark
                      ? 'border-white/10 bg-white/6 text-slate-200 hover:bg-white/10'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
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
