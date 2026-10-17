'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowRight, 
  BriefcaseBusiness, 
  CalendarDays, 
  CheckCircle2, 
  Clock3, 
  Compass, 
  History, 
  IndianRupee, 
  MapPin, 
  Navigation, 
  Phone, 
  PlusCircle, 
  Radio, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  User as UserIcon, 
  Wrench,
  X 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getApiBaseUrl } from '@/lib/apiBase';
import { allServices, Service } from '@/lib/services';

interface Booking {
  _id: string;
  serviceType: string;
  status: string;
  createdAt: string;
  description?: string;
  customerPhone?: string;
  customerName?: string;
  amount?: number;
  provider?: {
    name: string;
    phone: string;
    whatsappNumber?: string;
    profilePicture?: string;
  };
  address?: {
    fullAddress?: string;
    city?: string;
    pincode?: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const API_URL = getApiBaseUrl();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch real user bookings
  const fetchMyBookings = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_URL}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Error fetching dashboard bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  }, [API_URL]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      if (user?.isAdmin || user?.role === 'admin') {
        router.push('/admin');
        return;
      }
      if (user?.role === 'provider') {
        router.push('/dashboard/provider');
        return;
      }
      void fetchMyBookings();
    }
  }, [authLoading, fetchMyBookings, isAuthenticated, router, user]);

  // Prevent admin from ever seeing customer dashboard
  if (user?.isAdmin || user?.role === 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
          <p className="text-xs font-bold text-slate-700">Redirecting to Admin Portal...</p>
        </div>
      </div>
    );
  }

  // Prevent providers from ever seeing customer dashboard
  if (user?.role === 'provider' && !user?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-xs font-bold text-slate-700">Redirecting to Provider Workspace...</p>
        </div>
      </div>
    );
  }

  // Derived statistics
  const activeBookings = useMemo(() => {
    return bookings.filter(b => ['pending', 'accepted', 'on-the-way', 'in-progress'].includes(b.status));
  }, [bookings]);

  const completedBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'completed');
  }, [bookings]);

  const totalSpent = useMemo(() => {
    return bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.amount || 499), 0);
  }, [bookings]);

  // Filtered Services List
  const categories = useMemo(() => {
    const set = new Set<string>();
    allServices.forEach(s => set.add(s.category));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredServices = useMemo(() => {
    return allServices.filter(s => {
      const matchesSearch = 
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-amber-50 border-amber-200 text-amber-700', text: 'text-amber-700', label: 'Matching Specialist' },
      accepted: { bg: 'bg-blue-50 border-blue-200 text-blue-700', text: 'text-blue-700', label: 'Specialist Assigned' },
      'on-the-way': { bg: 'bg-blue-600 text-white border-blue-600 animate-pulse', text: 'text-white', label: 'On The Way' },
      'in-progress': { bg: 'bg-purple-50 border-purple-200 text-purple-700', text: 'text-purple-700', label: 'In Progress' },
      completed: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', text: 'text-emerald-700', label: 'Completed' },
      cancelled: { bg: 'bg-rose-50 border-rose-200 text-rose-700', text: 'text-rose-700', label: 'Cancelled' },
    };
    const b = badges[status] || { bg: 'bg-slate-100 text-slate-700 border-slate-200', text: 'text-slate-700', label: status };
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold ${b.bg}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {b.label}
      </span>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 font-semibold">
        Loading QuickServices Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      
      {/* =========================================================================
          HERO BANNER (PROFESSIONAL SLATE + WARM ORANGE ACCENTS)
      ========================================================================= */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10 shadow-lg">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-orange-300 backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                  QuickServices Customer Hub
                </span>

                {user?.role === 'provider' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                    <BriefcaseBusiness className="h-3.5 w-3.5" /> Registered Service Provider
                  </span>
                )}

                {user?.isAdmin && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300 border border-purple-500/30">
                    <ShieldCheck className="h-3.5 w-3.5" /> Platform Administrator
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Welcome back, {user?.username || 'Customer'}!
              </h1>
              <p className="text-sm text-slate-300 max-w-xl">
                Manage your home service requests, track your specialist&apos;s live location on GPS radar, and order verified repairs across Kashmir.
              </p>
            </div>

            {/* Quick Action Buttons Header */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => router.push('/booking')}
                className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0f62c9,#ff8a3d)] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg hover:opacity-95 active:scale-95 transition"
              >
                <PlusCircle className="h-4 w-4" />
                Book New Service
              </button>

              {user?.role === 'provider' && (
                <button
                  onClick={() => router.push('/dashboard/provider')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-900 shadow-md hover:bg-slate-100 active:scale-95 transition"
                >
                  <BriefcaseBusiness className="h-4 w-4 text-orange-500" />
                  Provider Workspace
                </button>
              )}

              {user?.isAdmin && (
                <button
                  onClick={() => router.push('/admin')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-purple-700 active:scale-95 transition"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Control Panel
                </button>
              )}
            </div>

          </div>

          {/* Genuine KPI Stats Row */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-white/10 pt-6">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Bookings</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">{activeBookings.length}</span>
                {activeBookings.length > 0 && (
                  <span className="text-xs font-bold text-emerald-400 animate-pulse">Live</span>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Completed Jobs</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">{completedBookings.length}</span>
                <span className="text-xs text-slate-400 font-medium">Delivered</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Average Dispatch</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">30 min</span>
                <span className="text-xs text-slate-400 font-medium">Doorstep</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Security & Trust</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</span>
                <span className="text-xs text-slate-400 font-medium">OTP Verified</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 1: ACTIVE BOOKINGS & LIVE GPS RADAR (IF ANY ACTIVE)
      ========================================================================= */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        
        {activeBookings.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                  Active Service Tracking & GPS Radar
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {activeBookings.length} active service{activeBookings.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeBookings.map((b) => (
                <div
                  key={b._id}
                  className="rounded-3xl border-2 border-blue-200/80 bg-white p-6 shadow-xl space-y-5 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Order #{b._id.slice(-6).toUpperCase()}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-0.5">
                        {b.serviceType.charAt(0).toUpperCase() + b.serviceType.slice(1)} Specialist
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        📍 {b.address?.fullAddress}, {b.address?.city}
                      </p>
                    </div>
                    {getStatusBadge(b.status)}
                  </div>

                  {/* Specialist Phone & Info */}
                  <div className="flex items-center justify-between rounded-2xl bg-blue-50/70 p-4 border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold text-sm shadow-md">
                        {b.provider?.name ? b.provider.name.charAt(0) : 'S'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {b.provider?.name || 'Assigning specialist...'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {b.provider?.phone ? `📞 ${b.provider.phone}` : 'Dispatcher coordinating'}
                        </p>
                      </div>
                    </div>

                    {b.provider?.phone && (
                      <a
                        href={`tel:${b.provider.phone}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call
                      </a>
                    )}
                  </div>

                  {/* Live Tracking Radar CTA */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => router.push(`/dashboard/booking/${b._id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-slate-800 active:scale-95 transition"
                    >
                      <Navigation className="h-4 w-4 text-orange-400 animate-spin" />
                      View Live Map Tracking & ETA
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================================
            SECTION 2: ALL SERVICES & PRODUCTS CATALOG (FULL DIRECTORY WITH IMAGES)
        ========================================================================= */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-bold text-slate-800 shadow-sm mb-2">
                <Wrench className="h-3.5 w-3.5 text-orange-500" />
                Verified Kashmir Doorstep Trades
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
                Explore All Services & Products
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Transparent upfront pricing, 30-min average dispatch, and verified technician guarantee.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plumber, electrician, ac..."
                className="w-full rounded-2xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm focus:border-blue-600 focus:outline-none shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                    isSelected
                      ? 'bg-slate-950 text-white shadow-md'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 shadow-sm'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm hover:shadow-xl transition duration-300 hover:-translate-y-1"
              >
                {/* Image Header with Badge */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={service.image}
                    alt={`${service.name} - QuickServices Verified Home Service`}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                  
                  <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-900 shadow-sm backdrop-blur-sm">
                    {service.category}
                  </span>

                  <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-lg shadow-md backdrop-blur-sm">
                    {service.icon}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition leading-snug">
                        {service.name}
                      </h3>
                    </div>

                    <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-900">{service.rating.toFixed(1)}</span>
                      <span className="text-slate-400 font-medium">({service.reviewsCount} reviews)</span>
                    </div>

                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Starting At</p>
                      <p className="text-base font-black text-slate-950 font-mono">
                        {service.price}
                        <span className="text-[11px] font-normal text-slate-500">/{service.priceUnit}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => router.push(`/booking?service=${service.id}`)}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 active:scale-95 transition"
                    >
                      Book Now
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: RECENT BOOKING HISTORY SHORTCUTS
        ========================================================================= */}
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Service History</h3>
                <p className="text-xs text-slate-500">All previous doorstep appointments and invoices</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/history')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View Full History →
            </button>
          </div>

          <div className="mt-6">
            {bookings.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                You haven&apos;t placed any bookings yet. Browse the catalog above to book your first verified service!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {bookings.slice(0, 4).map((b) => (
                  <div key={b._id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔧</span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {b.serviceType.charAt(0).toUpperCase() + b.serviceType.slice(1)} Service
                        </h4>
                        <p className="text-xs text-slate-500">
                          {new Date(b.createdAt).toLocaleDateString()} • {b.address?.city || 'Doorstep Service'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(b.status)}
                      <button
                        onClick={() => router.push(`/dashboard/booking/${b._id}`)}
                        className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}