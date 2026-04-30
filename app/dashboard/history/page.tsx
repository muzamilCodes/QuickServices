'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarDays, MapPin, Star, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { servicesById } from '@/lib/services';

interface Booking {
  _id: string;
  serviceType: string;
  status: string;
  createdAt: string;
  description?: string;
  address?: {
    fullAddress?: string;
    city?: string;
    pincode?: string;
  };
}

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState('');
  const [message, setMessage] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:4000/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = (await res.json()) as { success?: boolean; bookings?: Booking[] };
      if (data.success && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchBookings();
    }
  }, [fetchBookings, isAuthenticated, isLoading, router]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-700',
      accepted: 'bg-blue-50 text-blue-700',
      'in-progress': 'bg-violet-50 text-violet-700',
      completed: 'bg-emerald-50 text-emerald-700',
      cancelled: 'bg-rose-50 text-rose-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const cancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId);
    setMessage('');

    try {
      const res = await fetch(`http://localhost:4000/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = (await res.json()) as { success?: boolean; message?: string; booking?: Booking };

      if (!data.success) {
        setMessage(data.message || 'Unable to cancel booking.');
        return;
      }

      setBookings((current) =>
        current.map((booking) =>
          booking._id === bookingId ? { ...booking, status: data.booking?.status || 'cancelled' } : booking,
        ),
      );
      setMessage('Booking cancelled successfully.');
    } catch {
      setMessage('Cancel failed. Please try again.');
    } finally {
      setCancellingId('');
    }
  };

  if (isLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading your bookings...</div>;
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[30px] bg-white/85 p-8 shadow-xl shadow-slate-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Booking history</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">Keep track of every service request</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Revisit recent jobs, see the latest status, and jump back into the same service when you need it again.
              </p>
            </div>
            <button
              onClick={() => router.push('/services')}
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
            >
              Book another service
            </button>
          </div>
        </section>

        <section className="mt-8">
          {message && (
            <div className="mb-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
              {message}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/75 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-3xl">📋</div>
              <h2 className="mt-5 text-2xl font-semibold text-slate-900">No bookings yet</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
                Your first request will show up here with status, date, and address details.
              </p>
              <button
                onClick={() => router.push('/services')}
                className="mt-6 rounded-full bg-blue-700 px-5 py-3 text-sm font-medium text-white"
              >
                Explore services
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {bookings.map((booking) => (
                <div key={booking._id} className="rounded-[28px] border border-black/5 bg-white/90 p-6 shadow-lg shadow-slate-100">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                        {servicesById[booking.serviceType]?.icon || '🧰'}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-semibold text-slate-950">
                            {servicesById[booking.serviceType]?.name || booking.serviceType}
                          </h2>
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          {servicesById[booking.serviceType] && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              {servicesById[booking.serviceType].rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        {servicesById[booking.serviceType] && (
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {servicesById[booking.serviceType].description}
                          </p>
                        )}
                        {booking.description && (
                          <p className="mt-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            {booking.description}
                          </p>
                        )}
                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                          <p className="inline-flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                            <span>
                              {booking.address?.fullAddress || 'Address not available'}
                              {booking.address?.city ? `, ${booking.address.city}` : ''}
                              {booking.address?.pincode ? ` ${booking.address.pincode}` : ''}
                            </span>
                          </p>
                          <p className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-slate-400" />
                            <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                          </p>
                          {servicesById[booking.serviceType] && (
                            <p className="font-semibold text-slate-900">
                              {servicesById[booking.serviceType].price}/{servicesById[booking.serviceType].priceUnit}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

<div className="flex flex-wrap gap-3 lg:justify-end">
                      <button
                        onClick={() => router.push(`/dashboard/booking/${booking._id}`)}
                        className="inline-flex items-center gap-2 self-start rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-600"
                      >
                        View Details
                      </button>
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => void cancelBooking(booking._id)}
                          disabled={cancellingId === booking._id}
                          className="inline-flex items-center gap-2 self-start rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <XCircle className="h-4 w-4" />
                          {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/booking?service=${booking.serviceType}`)}
                        className="inline-flex items-center gap-2 self-start rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-600"
                      >
                        Book again
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
