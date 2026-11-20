'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Star,
  MessageSquare,
  Wrench,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Send,
  User,
  ThumbsUp
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getApiBaseUrl } from '@/lib/apiBase';

interface Booking {
  _id: string;
  serviceType: string;
  status: string;
  createdAt: string;
  provider?: { name: string; phone: string };
  review?: {
    rating: number;
    comment?: string;
    createdAt?: string;
  };
}

export default function ReviewsPage() {
  const router = useRouter();
  const API = getApiBaseUrl();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Review submission state
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchBookings = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
    if (isAuthenticated) void fetchBookings();
  }, [isAuthenticated, authLoading, fetchBookings, router]);

  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const reviewedBookings = completedBookings.filter((b) => b.review?.rating);
  const pendingReviews = completedBookings.filter((b) => !b.review?.rating);

  const handleSubmitReview = async (bookingId: string) => {
    const token = localStorage.getItem('token');
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch(`${API}/bookings/${bookingId}/review`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveBookingId(null);
        setComment('');
        await fetchBookings();
        setMessage('Thank you! Your feedback helps verified specialists in Kashmir.');
      } else {
        setMessage(data.message || 'Error submitting review');
      }
    } catch {
      setMessage('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 flex items-center gap-2.5">
          <Star className="h-7 w-7 text-purple-600 fill-current" /> My Reviews & Feedback
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Share your experience and rate the technicians who visited your doorstep.
        </p>
      </div>

      {message && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Review Request Banner for unreviewed jobs */}
      {pendingReviews.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <ThumbsUp className="h-4 w-4" /> Action Required ({pendingReviews.length} Pending Review)
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold">How was your recent doorstep service?</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            You recently completed a job. Rating your specialist takes 15 seconds and helps maintain quality standards across Kashmir!
          </p>

          <div className="space-y-3 pt-2">
            {pendingReviews.map((b) => (
              <div key={b._id} className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-sm text-white capitalize">{b.serviceType.replace('-', ' ')}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Attended by: <span className="font-bold text-white">{b.provider?.name || 'Verified Specialist'}</span>
                  </p>
                </div>

                {activeBookingId === b._id ? (
                  <div className="w-full md:w-auto flex-1 max-w-md space-y-3 bg-white text-slate-800 p-4 rounded-xl">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold">Your Rating:</span>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="p-1 hover:scale-125 transition"
                        >
                          <Star className={`h-5 w-5 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Was the technician on time, polite and effective?"
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-purple-600"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setActiveBookingId(null)}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmitReview(b._id)}
                        disabled={submitting}
                        className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition"
                      >
                        {submitting ? 'Submitting...' : 'Post Review'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setActiveBookingId(b._id);
                      setRating(5);
                      setComment('');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-300 transition"
                  >
                    <Star className="h-3.5 w-3.5 fill-current" /> Rate Specialist Now
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submitted Reviews History */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <MessageSquare className="h-4 w-4 text-purple-600" /> Your Submitted Reviews
        </h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-7 w-7 animate-spin text-purple-600" />
          </div>
        ) : reviewedBookings.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs sm:text-sm">
            You haven&apos;t reviewed any completed bookings yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviewedBookings.map((b) => (
              <div key={b._id} className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 capitalize">
                      {b.serviceType.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">• Provider: {b.provider?.name || 'Verified Specialist'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= (b.review?.rating || 5) ? 'fill-current' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>

                {b.review?.comment && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    &ldquo;{b.review.comment}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
