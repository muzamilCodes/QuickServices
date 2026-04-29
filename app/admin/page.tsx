'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCheck, BriefcaseBusiness, CalendarDays, CircleAlert, ClipboardList, RefreshCw, ShieldCheck, UsersRound } from 'lucide-react';
import { servicesById } from '@/lib/services';
import { useAuthStore } from '@/store/authStore';

interface AdminStats {
  totalUsers: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalProviders: number;
  pendingProviders: number;
}

interface Booking {
  _id: string;
  serviceType: string;
  status: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  address?: {
    fullAddress?: string;
    city?: string;
    pincode?: string;
    landmark?: string;
  };
  user?: {
    username?: string;
    email?: string;
  };
}

interface Provider {
  _id: string;
  name: string;
  phone: string;
  services?: string[];
  isApproved: boolean;
  isAvailable: boolean;
  rating?: number;
}

interface UserRow {
  _id: string;
  username: string;
  email: string;
  isAdmin?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const statCards = [
  { key: 'totalUsers', label: 'Users', icon: UsersRound },
  { key: 'totalBookings', label: 'Bookings', icon: ClipboardList },
  { key: 'pendingBookings', label: 'Pending', icon: CircleAlert },
  { key: 'completedBookings', label: 'Completed', icon: BadgeCheck },
  { key: 'totalProviders', label: 'Providers', icon: BriefcaseBusiness },
  { key: 'pendingProviders', label: 'Provider approvals', icon: ShieldCheck },
] as const;

const bookingStatuses = ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'];

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setMessage('');

    try {
      const verifyRes = await fetch(`${API_URL}/user/verify/admin`, { headers: getHeaders() });
      const verifyData = (await verifyRes.json()) as { success?: boolean; message?: string };

      if (!verifyData.success) {
        setAuthorized(false);
        setMessage(verifyData.message || 'Admin access required.');
        return;
      }

      setAuthorized(true);

      const [dashboardRes, bookingsRes, providersRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/admin/dashboard`, { headers: getHeaders() }),
        fetch(`${API_URL}/admin/bookings?limit=8`, { headers: getHeaders() }),
        fetch(`${API_URL}/admin/providers`, { headers: getHeaders() }),
        fetch(`${API_URL}/user/getAll`, { headers: getHeaders() }),
      ]);

      const dashboardData = (await dashboardRes.json()) as { success?: boolean; stats?: AdminStats };
      const bookingsData = (await bookingsRes.json()) as { success?: boolean; bookings?: Booking[] };
      const providersData = (await providersRes.json()) as { success?: boolean; providers?: Provider[] };
      const usersData = (await usersRes.json()) as { success?: boolean; data?: UserRow[] };

      if (dashboardData.success && dashboardData.stats) setStats(dashboardData.stats);
      if (bookingsData.success && bookingsData.bookings) setBookings(bookingsData.bookings);
      if (providersData.success && providersData.providers) setProviders(providersData.providers);
      if (usersData.success && usersData.data) setUsers(usersData.data);
    } catch {
      setMessage('Unable to load admin dashboard. Check that the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBookingStatus = async (bookingId: string, status: string) => {
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string; booking?: Booking };

      if (!data.success) {
        setMessage(data.message || 'Unable to update booking status.');
        return;
      }

      setBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId ? { ...booking, status: data.booking?.status || status } : booking,
        ),
      );

      if (stats) {
        setStats({
          ...stats,
          pendingBookings: status === 'pending'
            ? stats.pendingBookings
            : Math.max(0, stats.pendingBookings - (bookings.find((booking) => booking._id === bookingId)?.status === 'pending' ? 1 : 0)),
          completedBookings: stats.completedBookings
            + (status === 'completed' ? 1 : 0)
            - (bookings.find((booking) => booking._id === bookingId)?.status === 'completed' && status !== 'completed' ? 1 : 0),
        });
      }
    } catch {
      setMessage('Status update failed. Check backend server.');
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadAdminData();
    }
  }, [isAuthenticated, isLoading, loadAdminData, router]);

  if (isLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading admin dashboard...</div>;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[30px] bg-white/90 p-8 text-center shadow-xl shadow-slate-100">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-slate-950">Admin access needed</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            {message || 'Your account is logged in, but it is not marked as admin yet.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 rounded-full bg-blue-700 px-5 py-3 text-sm font-medium text-white"
          >
            Go home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[32px] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Admin dashboard</p>
              <h1 className="mt-3 text-4xl font-semibold">Manage bookings, users, and providers</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Review platform activity, recent service requests, provider approvals, and customer accounts from one place.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => void loadAdminData()}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Admin Navigation */}
          <nav className="mt-6 flex flex-wrap gap-3">
            <a href="/admin/booking" className="rounded-full bg-white/20 px-5 py-3 text-sm font-medium text-white hover:bg-white/30 transition">
              All Bookings
            </a>
            <a href="/admin/services" className="rounded-full bg-white/20 px-5 py-3 text-sm font-medium text-white hover:bg-white/30 transition">
              Services
            </a>
            <a href="/admin/providers" className="rounded-full bg-white/20 px-5 py-3 text-sm font-medium text-white hover:bg-white/30 transition">
              Providers
            </a>
            <a href="/admin/users" className="rounded-full bg-white/20 px-5 py-3 text-sm font-medium text-white hover:bg-white/30 transition">
              Users
            </a>
          </nav>
        </section>


        {stats && (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {statCards.map(({ key, label, icon: Icon }) => (
              <div key={key} className="rounded-[24px] border border-black/5 bg-white/90 p-5 shadow-lg shadow-slate-100">
                <Icon className="h-5 w-5 text-blue-700" />
                <p className="mt-4 text-3xl font-semibold text-slate-950">{stats[key]}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </section>
        )}

        {message && (
          <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {message}
          </div>
        )}

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[28px] bg-white/90 p-6 shadow-xl shadow-slate-100">
            <h2 className="text-2xl font-semibold text-slate-950">Recent bookings</h2>
            <div className="mt-5 space-y-4">
              {bookings.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No bookings found yet.</p>
              ) : (
                bookings.map((booking) => (
                  <div key={booking._id} className="rounded-2xl border border-black/5 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-950">
                          {servicesById[booking.serviceType]?.icon || '🧰'} {servicesById[booking.serviceType]?.name || booking.serviceType}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {booking.customerName || booking.user?.username || 'Customer'} · {booking.user?.email || 'No email'}
                        </p>
                        {booking.customerPhone && (
                          <p className="mt-1 text-sm text-slate-600">{booking.customerPhone}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 sm:items-end">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{booking.status}</span>
                        <select
                          value={booking.status}
                          onChange={(event) => void updateBookingStatus(booking._id, event.target.value)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-500"
                        >
                          {bookingStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-slate-600">
                      <p className="font-medium text-slate-900">Full address</p>
                      <p>
                        {booking.address?.fullAddress || 'Address not available'}
                        {booking.address?.landmark ? `, ${booking.address.landmark}` : ''}
                        {booking.address?.city ? `, ${booking.address.city}` : ''}
                        {booking.address?.pincode ? ` ${booking.address.pincode}` : ''}
                      </p>
                    </div>
                    <p className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] bg-white/90 p-6 shadow-xl shadow-slate-100">
              <h2 className="text-2xl font-semibold text-slate-950">Providers</h2>
              <div className="mt-5 space-y-3">
                {providers.slice(0, 6).map((provider) => (
                  <div key={provider._id} className="rounded-2xl border border-black/5 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-950">{provider.name}</h3>
                        <p className="mt-1 text-sm text-slate-600">{provider.phone}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${provider.isApproved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {provider.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{provider.services?.join(', ') || 'No services listed'}</p>
                  </div>
                ))}
                {providers.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No providers found yet.</p>}
              </div>
            </div>

            <div className="rounded-[28px] bg-white/90 p-6 shadow-xl shadow-slate-100">
              <h2 className="text-2xl font-semibold text-slate-950">Users</h2>
              <div className="mt-5 space-y-3">
                {users.slice(0, 6).map((user) => (
                  <div key={user._id} className="rounded-2xl border border-black/5 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-950">{user.username}</h3>
                        <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                      </div>
                      {user.isAdmin && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">Admin</span>}
                    </div>
                  </div>
                ))}
                {users.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No users found yet.</p>}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
