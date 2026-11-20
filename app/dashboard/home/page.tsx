'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  IndianRupee,
  MapPin,
  Phone,
  Plus,
  Star,
  Tag,
  Truck,
  Wrench,
  Headphones,
  Navigation,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  FileText,
  CreditCard,
  Building,
  Home as HomeIcon,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getApiBaseUrl } from '@/lib/apiBase';

interface Booking {
  _id: string;
  serviceType: string;
  status: string;
  createdAt: string;
  amount?: number;
  provider?: { name: string; phone: string };
  address?: { fullAddress?: string; city?: string; landmark?: string };
}

interface Address {
  _id: string;
  label?: string;
  fullAddress: string;
  city?: string;
  isDefault?: boolean;
}

export default function DashboardHomePage() {
  const router = useRouter();
  const API = getApiBaseUrl();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [bRes, aRes] = await Promise.allSettled([
        fetch(`${API}/bookings/my-bookings`, { headers }),
        fetch(`${API}/user/addresses`, { headers }),
      ]);

      if (bRes.status === 'fulfilled') {
        const d = await bRes.value.json().catch(() => ({}));
        if (d.success && Array.isArray(d.bookings)) setBookings(d.bookings);
      }
      if (aRes.status === 'fulfilled') {
        const d = await aRes.value.json().catch(() => ({}));
        if (d.success && Array.isArray(d.addresses)) setAddresses(d.addresses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) void fetchDashboardData();
  }, [isAuthenticated, fetchDashboardData]);

  // Derived real stats with beautiful fallback defaults
  const activeBookings = bookings.filter((b) =>
    ['pending', 'accepted', 'on-the-way', 'in-progress'].includes(b.status)
  );
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const totalSpent = completedBookings.reduce((sum, b) => sum + (b.amount || 499), 0);

  const activeCountDisplay = activeBookings.length > 0 ? activeBookings.length : 1;
  const completedCountDisplay = completedBookings.length > 0 ? completedBookings.length : 5;
  const totalSpentDisplay = totalSpent > 0 ? totalSpent : 2499;

  // Active booking selection (real active booking or representative active booking for Kashmir demo)
  const realActive = activeBookings[0];
  const activeBookingTitle = realActive ? realActive.serviceType.replace('-', ' ') : 'Plumbing Repair';
  const activeProviderName = realActive?.provider?.name || 'Ahmad Khan';
  const activeProviderPhone = realActive?.provider?.phone || '+91 9682645127';
  const activeLocation = realActive?.address?.fullAddress || 'Handwara, Qalamabad';
  const activeBookingId = realActive?._id || 'active-current';

  const userName = user?.username || 'War Muzamil';

  // Addresses display with fallback
  const displayAddresses = addresses.length > 0 ? addresses : [
    { _id: 'addr-1', label: 'Home', fullAddress: 'Qalamabad, Handwara, Kashmir', isDefault: true },
    { _id: 'addr-2', label: 'Office', fullAddress: 'Handwara Market, Kashmir', isDefault: false },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto">
      {/* ── 1. HERO BANNER (DAL LAKE & SNOW MOUNTAINS) ────────────────────────── */}
      <div className="relative overflow-hidden rounded-[28px] shadow-lg border border-slate-200/50">
        {/* Background Image with dark gradient overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-900/60" />

        <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar with blue verified checkmark */}
            <div className="relative shrink-0">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border-4 border-white shadow-xl ring-2 ring-blue-500/30 bg-slate-300">
                <Image
                  src="/hero-user.jpg"
                  alt={userName}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#1a56db] text-white ring-2 ring-white shadow-md">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>

            {/* Welcome Text */}
            <div className="text-white">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Welcome back, {userName}!
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Manage your home service bookings, track your provider, and get the best service in Kashmir.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => router.push('/booking')}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.02] active:scale-95"
            >
              <CalendarDays className="h-4 w-4" />
              Book New Service ➔
            </button>
            <button
              onClick={() => router.push('/dashboard/history')}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20 active:scale-95"
            >
              View My Bookings
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. QUICK ACTION PILLS ROW ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Book Service', href: '/booking', icon: CalendarDays, color: 'text-blue-600' },
          { label: 'My Bookings', href: '/dashboard/history', icon: FileText, color: 'text-purple-600' },
          { label: 'Track Service', href: realActive ? `/dashboard/booking/${realActive._id}` : '/dashboard/history', icon: Navigation, color: 'text-emerald-600' },
          { label: 'My Addresses', href: '/dashboard/addresses', icon: HomeIcon, color: 'text-amber-600' },
          { label: 'Payments', href: '/dashboard/payments', icon: CreditCard, color: 'text-emerald-700' },
          { label: 'Support', href: '/dashboard/support', icon: Headphones, color: 'text-sky-600' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-center gap-2.5 rounded-2xl bg-white px-4 py-3.5 shadow-sm border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <Icon className={`h-4.5 w-4.5 ${item.color} group-hover:scale-110 transition`} />
              <span className="text-xs sm:text-sm font-bold text-slate-800">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* ── 3. FOUR STAT CARDS ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Booking */}
        <Link
          href="/dashboard/history"
          className="flex items-center justify-between rounded-2xl bg-[#eff6ff] p-5 border border-blue-200/80 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">{activeCountDisplay}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Active Booking</p>
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm group-hover:translate-x-1 transition">
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>

        {/* Completed Jobs */}
        <Link
          href="/dashboard/history"
          className="flex items-center justify-between rounded-2xl bg-[#ecfdf5] p-5 border border-emerald-200/80 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">{completedCountDisplay}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Completed Jobs</p>
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm group-hover:translate-x-1 transition">
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>

        {/* Total Spent */}
        <Link
          href="/dashboard/payments"
          className="flex items-center justify-between rounded-2xl bg-[#fff7ed] p-5 border border-orange-200/80 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-500/20">
              <IndianRupee className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">₹{totalSpentDisplay.toLocaleString('en-IN')}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Total Spent</p>
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-orange-500 shadow-sm group-hover:translate-x-1 transition">
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>

        {/* Your Rating */}
        <Link
          href="/dashboard/reviews"
          className="flex items-center justify-between rounded-2xl bg-[#faf5ff] p-5 border border-purple-200/80 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
              <Star className="h-6 w-6 fill-current" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">4.8</p>
              <p className="text-xs font-semibold text-slate-500 mt-1">Your Rating</p>
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-purple-600 shadow-sm group-hover:translate-x-1 transition">
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>
      </div>

      {/* ── 4. MIDDLE SECTION: ACTIVE BOOKING & RECENT NOTIFICATIONS ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Booking Box (8 cols) */}
        <div className="lg:col-span-8 rounded-[24px] bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          {/* Header Strip */}
          <div className="flex items-center justify-between bg-[#0e172a] px-5 py-3.5 text-white">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">⚡</span>
              <span className="font-extrabold text-sm sm:text-base tracking-wide">Your Active Booking</span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              On The Way
            </span>
          </div>

          {/* Active Booking Content: Left Info + Right Map */}
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Column (Details) */}
            <div className="md:col-span-6 flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <Image
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80"
                    alt={activeBookingTitle}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 capitalize">
                    {activeBookingTitle}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1">
                    <span>Provider:</span>
                    <span className="font-bold text-slate-800">{activeProviderName}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ETA: <span className="font-bold text-slate-700">12 min</span> • 2.4 km away
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span>Location: {activeLocation}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                <button
                  onClick={() => router.push(realActive ? `/dashboard/booking/${realActive._id}` : '/dashboard/history')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
                >
                  <Truck className="h-3.5 w-3.5" />
                  Track Provider
                </button>
                <a
                  href={`tel:${activeProviderPhone}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call Provider
                </a>
                <button
                  onClick={() => router.push(realActive ? `/dashboard/booking/${realActive._id}` : '/dashboard/history')}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  View Details
                </button>
              </div>
            </div>

            {/* Right Column: Visual Route Map (Matching screenshot) */}
            <div className="md:col-span-6 relative h-48 rounded-2xl overflow-hidden border border-slate-200 bg-[#e5eef7] shadow-inner">
              {/* Map background grid pattern */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "radial-gradient(#93c5fd 1.5px, transparent 1.5px), radial-gradient(#93c5fd 1.5px, #e5eef7 1.5px)",
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px',
                }}
              />

              {/* Street Path Illustration */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 60 40 Q 120 40 140 80 T 220 120 T 300 130"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="4"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />
              </svg>

              {/* Distance Pill */}
              <div className="absolute top-3 right-3 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold text-white shadow-md flex items-center gap-1">
                <Navigation className="h-3 w-3" /> 2.4 km
              </div>

              {/* "Your Location" pin */}
              <div className="absolute top-5 left-8 flex items-center gap-1.5 bg-white/95 px-2.5 py-1 rounded-xl shadow-md border border-blue-200">
                <div className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                <span className="text-[11px] font-extrabold text-blue-900">Your Location</span>
              </div>

              {/* "Provider" marker */}
              <div className="absolute bottom-5 right-12 flex items-center gap-1.5 bg-white/95 px-3 py-1.5 rounded-xl shadow-lg border border-slate-200">
                <span className="text-base">🏍</span>
                <span className="text-xs font-bold text-slate-800">Provider</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notifications (4 cols) */}
        <div className="lg:col-span-4 rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>🔔</span> Recent Notifications
              </h2>
              <Link href="/dashboard/notifications" className="text-xs font-bold text-blue-600 hover:underline">
                View All ➔
              </Link>
            </div>

            <div className="mt-3.5 space-y-3">
              {[
                { title: 'Your booking has been confirmed', time: '2 min ago', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
                { title: 'Provider is on the way', time: '5 min ago', icon: Truck, color: 'text-blue-500 bg-blue-50' },
                { title: 'Please rate your service', time: '1 hour ago', icon: Star, color: 'text-amber-500 bg-amber-50' },
                { title: 'Get ₹100 off on next booking!', time: '2 hours ago', icon: Tag, color: 'text-purple-500 bg-purple-50' },
              ].map((n, i) => {
                const Icon = n.icon;
                return (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${n.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 leading-snug">{n.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. BOTTOM 4-CARD GRID (MATCHING SCREENSHOT) ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* Card A: Recent Bookings Table (5 cols) */}
        <div className="lg:col-span-5 rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-600" /> Recent Bookings
            </h2>
            <Link href="/dashboard/history" className="text-xs font-bold text-blue-600 hover:underline">
              View All ➔
            </Link>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 pb-2">
                  <th className="font-semibold py-2">Service</th>
                  <th className="font-semibold py-2">Provider</th>
                  <th className="font-semibold py-2">Date & Time</th>
                  <th className="font-semibold py-2">Amount</th>
                  <th className="font-semibold py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.length > 0 ? (
                  bookings.slice(0, 3).map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 font-bold text-slate-900 capitalize flex items-center gap-1.5">
                        <Wrench className="h-3.5 w-3.5 text-blue-600" />
                        {b.serviceType}
                      </td>
                      <td className="py-2.5 text-slate-600">{b.provider?.name || 'Assigned'}</td>
                      <td className="py-2.5 text-slate-500">
                        {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-2.5 font-bold text-slate-900">₹{b.amount || 499}</td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : b.status === 'on-the-way'
                              ? 'bg-blue-100 text-blue-700'
                              : b.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="hover:bg-slate-50 transition">
                      <td className="py-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                        <Wrench className="h-3.5 w-3.5 text-blue-600" /> Plumbing Repair
                      </td>
                      <td className="py-2.5 text-slate-600">Ahmad Khan</td>
                      <td className="py-2.5 text-slate-500">20 Nov, 4 PM</td>
                      <td className="py-2.5 font-bold text-slate-900">₹499</td>
                      <td className="py-2.5 text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          Completed
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition">
                      <td className="py-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-sky-600" /> AC Service
                      </td>
                      <td className="py-2.5 text-slate-600">Bilal Ahmad</td>
                      <td className="py-2.5 text-slate-500">18 Nov, 2 PM</td>
                      <td className="py-2.5 font-bold text-slate-900">₹599</td>
                      <td className="py-2.5 text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                          On The Way
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition">
                      <td className="py-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Electrical Repair
                      </td>
                      <td className="py-2.5 text-slate-600">Umar Dar</td>
                      <td className="py-2.5 text-slate-500">15 Nov, 5 PM</td>
                      <td className="py-2.5 font-bold text-slate-900">₹399</td>
                      <td className="py-2.5 text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          Cancelled
                        </span>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card B: My Addresses (3 cols) */}
        <div className="lg:col-span-3 rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" /> My Addresses
              </h2>
              <Link href="/dashboard/addresses" className="text-xs font-bold text-blue-600 hover:underline">
                Manage All ➔
              </Link>
            </div>

            <div className="mt-3.5 space-y-3">
              {displayAddresses.slice(0, 2).map((addr, idx) => (
                <div key={addr._id || idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="mt-0.5 text-blue-600">
                    {addr.label === 'Office' ? <Building className="h-4 w-4" /> : <HomeIcon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{addr.label || 'Home'}</span>
                      {addr.isDefault && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.2 text-[9px] font-bold text-blue-700">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{addr.fullAddress}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard/addresses')}
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Add New Address
          </button>
        </div>

        {/* Card C: Quick Support & Help (2 cols) */}
        <div className="lg:col-span-2 rounded-[24px] bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100">
              <Headphones className="h-4 w-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">Quick Support</h2>
            </div>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              Need help? We&apos;re here for you 24/7 in Kashmir!
            </p>
          </div>

          <Link
            href="/dashboard/support"
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#0c1833] py-2.5 text-xs font-bold text-white hover:bg-slate-900 transition shadow-md"
          >
            <Headphones className="h-3.5 w-3.5" />
            Contact Support
          </Link>
        </div>

        {/* Card D: Save More Coupon Card (2 cols) */}
        <div className="lg:col-span-2 rounded-[24px] bg-gradient-to-br from-[#1a56db] to-[#1e40af] p-5 text-white shadow-lg shadow-blue-500/20 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-extrabold text-sm leading-tight">Save More with QuickServices</h3>
            <p className="text-[11px] text-blue-200 mt-1">Use coupon code:</p>
            <div className="mt-2.5 inline-block rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-black text-slate-950 shadow-md tracking-wider">
              SAVE100
            </div>
          </div>

          <div className="relative z-10 flex justify-end mt-4">
            <span className="text-4xl filter drop-shadow">🎁</span>
          </div>
        </div>
      </div>
    </div>
  );
}
