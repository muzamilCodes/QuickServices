'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { allServices } from '@/lib/services';
import { getApiBaseUrl } from '@/lib/apiBase';
import { ArrowRight, BookOpen, Calendar, ChevronRight, Package, Plus, ShieldCheck, Star } from 'lucide-react';

export default function DashboardHome() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [bookingCount, setBookingCount] = useState<number | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('token');
    const API = getApiBaseUrl();
    fetch(`${API}/bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.bookings) {
          setBookingCount(d.bookings.length);
          setRecentBookings(d.bookings.slice(0, 3));
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const popularServices = allServices.filter(s => s.popular).slice(0, 8);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4 py-10 text-white sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-medium text-blue-300">Good day 👋</p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Welcome, {user?.username || 'Guest'}!</h1>
          <p className="mt-2 text-slate-300 text-sm">What service do you need today?</p>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <Package className="h-5 w-5 text-blue-300" />
              <p className="mt-2 text-2xl font-bold">{allServices.length}+</p>
              <p className="text-xs text-slate-400 mt-0.5">Services</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <BookOpen className="h-5 w-5 text-green-300" />
              <p className="mt-2 text-2xl font-bold">{bookingCount ?? '—'}</p>
              <p className="text-xs text-slate-400 mt-0.5">My Bookings</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <ShieldCheck className="h-5 w-5 text-orange-300" />
              <p className="mt-2 text-2xl font-bold">OTP</p>
              <p className="text-xs text-slate-400 mt-0.5">Verified</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <Star className="h-5 w-5 text-yellow-300" />
              <p className="mt-2 text-2xl font-bold">Kashmir</p>
              <p className="text-xs text-slate-400 mt-0.5">Local First</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Quick Actions */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => router.push('/booking')}
            className="flex items-center justify-between rounded-2xl bg-blue-700 p-5 text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Plus className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-bold">Book a Service</p>
                <p className="text-xs text-blue-200">Quick booking in 2 minutes</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            onClick={() => router.push('/dashboard/history')}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Calendar className="h-5 w-5 text-slate-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900">My Bookings</p>
                <p className="text-xs text-slate-500">View all history</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Recent Bookings */}
        {recentBookings.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recent Bookings</h2>
              <button onClick={() => router.push('/dashboard/history')} className="text-sm font-medium text-blue-700 hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {recentBookings.map(b => (
                <button
                  key={b._id}
                  onClick={() => router.push(`/dashboard/booking/${b._id}`)}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 capitalize">{b.serviceType}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusColor(b.status)}`}>{b.status}</span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Services */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Popular Services</h2>
            <button onClick={() => router.push('/services')} className="text-sm font-medium text-blue-700 hover:underline">See all</button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {popularServices.map((service) => (
              <button
                key={service.id}
                onClick={() => router.push(`/booking?service=${service.id}`)}
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md"
              >
                <div className="text-4xl">{service.icon}</div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">{service.name}</h3>
                <p className="mt-1 text-xs font-semibold text-blue-700">₹{service.price}/{service.priceUnit}</p>
                <div className="mt-2 flex items-center justify-center gap-1 text-xs text-amber-500">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="font-medium">{service.rating.toFixed(1)}</span>
                </div>
                <span className="mt-2 inline-block text-xs font-medium text-blue-600 group-hover:underline">Book Now →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
