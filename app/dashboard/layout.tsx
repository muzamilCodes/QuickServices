'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  CalendarDays,
  MapPin,
  CreditCard,
  Star,
  Bell,
  Tag,
  Headphones,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Wrench,
  Home,
  Sparkles,
  Info,
  Mail,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getApiBaseUrl } from '@/lib/apiBase';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/history', label: 'My Bookings', icon: CalendarDays },
  { href: '/dashboard/addresses', label: 'My Addresses', icon: MapPin },
  { href: '/dashboard/payments', label: 'Payments & Invoices', icon: CreditCard },
  { href: '/dashboard/reviews', label: 'My Reviews', icon: Star },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, badge: true },
  { href: '/dashboard/coupons', label: 'Coupons', icon: Tag },
  { href: '/dashboard/support', label: 'Support', icon: Headphones },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(3);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('token');
    const API = getApiBaseUrl();
    fetch(`${API}/user/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.notifications)) {
          const unread = d.notifications.filter((n: any) => !n.read && !n.isRead).length;
          setNotifCount(unread > 0 ? unread : 3);
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActive = (item: (typeof NAV_ITEMS)[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const userName = user?.username || 'War Muzamil';

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 antialiased font-sans flex flex-col">
      {/* ── TOP NAVBAR (as seen in screenshot) ────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 shadow-md shadow-blue-500/25 text-white">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-950">QuickServices</span>
                <span className="block text-[10px] font-semibold text-slate-400 -mt-1 tracking-wide">Home Support, Faster</span>
              </div>
            </Link>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-700">
            <Link href="/" className="flex items-center gap-1.5 hover:text-blue-600 transition">
              <Home className="h-4 w-4 text-slate-400" /> Home
            </Link>
            <Link href="/services" className="flex items-center gap-1.5 hover:text-blue-600 transition">
              <Wrench className="h-4 w-4 text-slate-400" /> Services
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </Link>
            <Link href="/offers" className="flex items-center gap-1.5 hover:text-blue-600 transition">
              <Sparkles className="h-4 w-4 text-amber-500" /> Highlights
            </Link>
            <Link href="/about" className="flex items-center gap-1.5 hover:text-blue-600 transition">
              <Info className="h-4 w-4 text-slate-400" /> About
            </Link>
            <Link href="/contact" className="flex items-center gap-1.5 hover:text-blue-600 transition">
              <Mail className="h-4 w-4 text-slate-400" /> Contact
            </Link>
          </nav>

          {/* Right User Bar */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notification Bell */}
            <Link
              href="/dashboard/notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
                  {notifCount}
                </span>
              )}
            </Link>

            {/* Profile Avatar & Name */}
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2.5 rounded-full p-1 pl-1.5 pr-3 hover:bg-slate-100 transition"
            >
              <div className="relative h-9 w-9 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm ring-1 ring-slate-200">
                <Image
                  src="/hero-user.jpg"
                  alt={userName}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback to initial avatar if image fails to load
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="flex h-full w-full items-center justify-center bg-blue-600 text-xs font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
              <span className="hidden sm:inline text-sm font-bold text-slate-900">{userName}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── BODY: SIDEBAR + MAIN CONTENT ───────────────────────────── */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Sidebar (dark navy background matching screenshot) */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col shrink-0 bg-[#0c1833] text-white self-stretch flex-col justify-between">
          <div className="p-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                    active
                      ? 'bg-[#1a56db] text-white shadow-lg shadow-blue-900/40'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && notifCount > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
                      {notifCount}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Logout Button */}
            <div className="pt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-rose-500/20 hover:text-rose-300 transition-all border border-white/5"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Bottom Scenic Kashmir Card */}
          <div className="p-4 pt-0">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-transparent p-3 text-white border border-white/10">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=600&q=80')",
                }}
              />
              <div className="relative z-10 pt-16">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                  <MapPin className="h-3.5 w-3.5 text-red-400" />
                  <span>Handwara, Kashmir</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0c1833] text-white p-4 shadow-2xl flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-3">
                  <span className="font-black text-lg">QuickServices</span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-xl bg-white/10 text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                          active
                            ? 'bg-[#1a56db] text-white shadow-lg'
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && notifCount > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
                            {notifCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold text-rose-300 hover:bg-rose-500/20"
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-red-400" /> Handwara, Kashmir
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
