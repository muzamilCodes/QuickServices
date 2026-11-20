'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarDays, MapPin, MessageSquare, Star, Trash2, XCircle, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { servicesById } from '@/lib/services';
import { getApiBaseUrl } from '@/lib/apiBase';

interface Booking {
  _id: string;
  serviceType: string;
  status: string;
  createdAt: string;
  description?: string;
  customerPhone?: string;
  customerName?: string;
  review?: { rating: number; comment?: string };
  complaint?: { reason: string; description: string };
  provider?: {
    name: string;
    phone: string;
    whatsappNumber?: string;
  };
  address?: {
    fullAddress?: string;
    city?: string;
    pincode?: string;
  };
}

interface ReviewFormState {
  bookingId: string;
  rating: number;
  comment: string;
  submitting: boolean;
}

interface ComplaintFormState {
  bookingId: string;
  reason: string;
  description: string;
  submitting: boolean;
}

export default function HistoryPage() {
  const API_URL = getApiBaseUrl();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState('');
  const [message, setMessage] = useState('');

  // Review & complaint forms
  const [reviewForm, setReviewForm] = useState<ReviewFormState | null>(null);
  const [complaintForm, setComplaintForm] = useState<ComplaintFormState | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = (await res.json()) as { success?: boolean; bookings?: Booking[]; message?: string };
      if (data.success && data.bookings) {
        setBookings(data.bookings);
      } else {
        setMessage(data.message || 'Unable to load bookings.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Unable to connect to the server. Please check your network or backend URL.');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

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
      pending: 'bg-amber-50 text-amber-700 border border-amber-200',
      accepted: 'bg-blue-50 text-blue-700 border border-blue-200',
      'on-the-way': 'bg-blue-600 text-white animate-pulse',
      'in-progress': 'bg-violet-50 text-violet-700 border border-violet-200',
      completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      cancelled: 'bg-rose-50 text-rose-700 border border-rose-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const cancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId);
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
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

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Delete this booking from your history?')) return;
    setCancellingId(bookingId);
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = (await res.json()) as { success?: boolean; message?: string };

      if (!data.success) {
        setMessage(data.message || 'Unable to delete booking.');
        return;
      }

      setBookings((current) => current.filter((booking) => booking._id !== bookingId));
      setMessage('Booking removed from history.');
    } catch {
      setMessage('Delete failed. Please try again.');
    } finally {
      setCancellingId('');
    }
  };

  const submitReview = async () => {
    if (!reviewForm) return;
    setReviewForm(f => f ? { ...f, submitting: true } : null);
    try {
      const res = await fetch(`${API_URL}/bookings/${reviewForm.bookingId}/review`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: reviewForm.rating, comment: reviewForm.comment }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (data.success) {
        setMessage('Review submitted! Thank you.');
        setBookings(curr =>
          curr.map(b =>
            b._id === reviewForm.bookingId
              ? { ...b, review: { rating: reviewForm.rating, comment: reviewForm.comment } }
              : b
          )
        );
        setReviewForm(null);
      } else {
        setMessage(data.message || 'Could not submit review.');
        setReviewForm(f => f ? { ...f, submitting: false } : null);
      }
    } catch {
      setMessage('Review submission failed. Please try again.');
      setReviewForm(f => f ? { ...f, submitting: false } : null);
    }
  };

  const submitComplaint = async () => {
    if (!complaintForm) return;
    setComplaintForm(f => f ? { ...f, submitting: true } : null);
    try {
      const res = await fetch(`${API_URL}/bookings/${complaintForm.bookingId}/complaint`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: complaintForm.reason, description: complaintForm.description }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (data.success) {
        setMessage('Complaint reported. Our team will review it shortly.');
        setBookings(curr =>
          curr.map(b =>
            b._id === complaintForm.bookingId
              ? { ...b, complaint: { reason: complaintForm.reason, description: complaintForm.description } }
              : b
          )
        );
        setComplaintForm(null);
      } else {
        setMessage(data.message || 'Could not submit complaint.');
        setComplaintForm(f => f ? { ...f, submitting: false } : null);
      }
    } catch {
      setMessage('Complaint submission failed. Please try again.');
      setComplaintForm(f => f ? { ...f, submitting: false } : null);
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
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-semibold text-slate-950">
                            {servicesById[booking.serviceType]?.name || booking.serviceType}
                          </h2>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(booking.status)}`}>
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

                        {booking.provider && (
                          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-blue-50/80 px-3.5 py-2 text-xs text-blue-900 border border-blue-100">
                            <span className="font-semibold text-slate-700">Specialist:</span>
                            <span className="font-bold text-slate-900">{booking.provider.name}</span>
                            <span className="text-slate-300">•</span>
                            <a
                              href={`tel:${booking.provider.phone}`}
                              className="inline-flex items-center gap-1 font-mono font-bold text-blue-700 hover:text-blue-900 hover:underline"
                            >
                              📞 {booking.provider.phone}
                            </a>
                          </div>
                        )}

                        {/* Existing review badge */}
                        {booking.review?.rating && (
                          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            You rated {booking.review.rating}/5
                          </div>
                        )}

                        {/* Existing complaint badge */}
                        {booking.complaint?.reason && (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Complaint filed: {booking.complaint.reason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 lg:justify-end lg:flex-col lg:items-end">
                      <button
                        onClick={() => router.push(`/dashboard/booking/${booking._id}`)}
                        className="inline-flex items-center gap-2 self-start rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        </span>
                        Track Live Status
                      </button>

                      {booking.status === 'completed' && !booking.review?.rating && (
                        <button
                          onClick={() => setReviewForm({ bookingId: booking._id, rating: 5, comment: '', submitting: false })}
                          className="inline-flex items-center gap-2 self-start rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
                        >
                          <Star className="h-4 w-4" />
                          Leave Review
                        </button>
                      )}

                      {booking.status === 'completed' && !booking.complaint?.reason && (
                        <button
                          onClick={() => setComplaintForm({ bookingId: booking._id, reason: '', description: '', submitting: false })}
                          className="inline-flex items-center gap-2 self-start rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Report Issue
                        </button>
                      )}

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
                      {(booking.status === 'cancelled' || booking.status === 'completed') && (
                        <button
                          onClick={() => void deleteBooking(booking._id)}
                          disabled={cancellingId === booking._id}
                          className="inline-flex items-center gap-2 self-start rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" />
                          {cancellingId === booking._id ? 'Removing...' : 'Delete'}
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

                  {/* Inline Review Form */}
                  {reviewForm?.bookingId === booking._id && (
                    <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="h-4 w-4 text-amber-600" />
                        <h3 className="font-bold text-slate-900 text-sm">Leave a Review</h3>
                      </div>
                      {/* Star Rating */}
                      <div className="flex gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setReviewForm(f => f ? { ...f, rating: star } : null)}
                            className="transition hover:scale-110"
                          >
                            <Star
                              className={`h-7 w-7 ${star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 self-center text-sm font-semibold text-amber-700">{reviewForm.rating}/5</span>
                      </div>
                      <textarea
                        rows={3}
                        value={reviewForm.comment}
                        onChange={e => setReviewForm(f => f ? { ...f, comment: e.target.value } : null)}
                        placeholder="Share your experience... (optional)"
                        className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
                      />
                      <div className="mt-3 flex gap-2 justify-end">
                        <button
                          onClick={() => setReviewForm(null)}
                          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => void submitReview()}
                          disabled={reviewForm.submitting}
                          className="rounded-full bg-amber-500 px-5 py-2 text-xs font-bold text-white transition hover:bg-amber-600 disabled:opacity-60"
                        >
                          {reviewForm.submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline Complaint Form */}
                  {complaintForm?.bookingId === booking._id && (
                    <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50/60 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                        <h3 className="font-bold text-slate-900 text-sm">Report an Issue</h3>
                      </div>
                      <input
                        type="text"
                        value={complaintForm.reason}
                        onChange={e => setComplaintForm(f => f ? { ...f, reason: e.target.value } : null)}
                        placeholder="Short reason (e.g. Poor quality, No-show)"
                        className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 mb-3"
                      />
                      <textarea
                        rows={3}
                        value={complaintForm.description}
                        onChange={e => setComplaintForm(f => f ? { ...f, description: e.target.value } : null)}
                        placeholder="Please describe the issue in detail..."
                        className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-none"
                      />
                      <div className="mt-3 flex gap-2 justify-end">
                        <button
                          onClick={() => setComplaintForm(null)}
                          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => void submitComplaint()}
                          disabled={complaintForm.submitting || !complaintForm.reason || !complaintForm.description}
                          className="rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                        >
                          {complaintForm.submitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
