'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock3, IndianRupee, MapPin, ShieldCheck, Star } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { servicesById } from '@/lib/services';

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service') || 'plumber';
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const service = useMemo(() => servicesById[serviceId] || servicesById.plumber, [serviceId]);

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    city: '',
    pincode: '',
    description: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:4000/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...form,
          customerName: form.customerName || user?.username || '',
          customerPhone: form.customerPhone || user?.mobile || '',
          serviceType: serviceId,
          address: {
            fullAddress: form.address,
            city: form.city,
            pincode: form.pincode,
          },
        }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (data.success) {
        setShowOTP(true);
      } else {
        setMessage(data.message || 'Unable to create booking.');
      }
    } catch {
      setMessage('Booking failed.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:4000/bookings/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ otp, bookingMode: 'system' }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (data.success) {
        router.push('/history');
      } else {
        setMessage(data.message || 'Verification failed.');
      }
    } catch {
      setMessage('Verification failed.');
    } finally {
      setLoading(false);
      setShowOTP(false);
    }
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Preparing booking form...</div>;
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[30px] bg-slate-950 p-8 text-white shadow-xl shadow-slate-200">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-3xl">
            {service.icon}
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.2em] text-slate-400">Service booking</p>
          <h1 className="mt-3 text-3xl font-semibold">{service.name}</h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">{service.description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
              <p className="mt-2 text-lg font-semibold">{service.rating.toFixed(1)}</p>
              <p className="text-xs text-slate-400">Rating</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <IndianRupee className="h-4 w-4 text-emerald-300" />
              <p className="mt-2 text-lg font-semibold">{service.price}</p>
              <p className="text-xs text-slate-400">per {service.priceUnit}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Clock3 className="h-4 w-4 text-blue-300" />
              <p className="mt-2 text-sm font-semibold">{service.eta}</p>
              <p className="text-xs text-slate-400">Timing</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {service.details.map((detail) => (
              <span key={detail} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85">
                {detail}
              </span>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="inline-flex items-center gap-2 text-sm text-white">
                <MapPin className="h-4 w-4 text-orange-300" />
                Add your full address so the provider lands at the right spot.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="inline-flex items-center gap-2 text-sm text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                We will ask for the OTP confirmation after creating the request.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] bg-white/90 p-8 shadow-xl shadow-slate-100">
          <h2 className="text-2xl font-semibold text-slate-950">Tell us about the job</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Fill in the details once and we will carry them through the booking confirmation.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              type="text"
              placeholder="Full name"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
              value={form.customerName || user?.username || ''}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              required
            />
            <input
              type="tel"
              placeholder="Phone number"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
              value={form.customerPhone || user?.mobile || ''}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Full address"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="City"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Pincode"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                required
              />
            </div>
            <textarea
              placeholder={`Describe your ${service.name.toLowerCase()} request`}
              rows={4}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />

            {message && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? 'Processing...' : `Continue with ${service.name}`}
            </button>
          </form>
        </section>
      </div>

      {showOTP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold text-slate-950">Confirm OTP</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enter the 6-digit code sent to your email to finish the booking.
            </p>
            <input
              type="text"
              placeholder="6-digit OTP"
              className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-center text-2xl tracking-[0.35em] outline-none transition focus:border-blue-500"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            <div className="mt-5 flex gap-3">
              <button
                onClick={verifyOTP}
                className="flex-1 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white"
              >
                Confirm booking
              </button>
              <button
                onClick={() => setShowOTP(false)}
                className="flex-1 rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-slate-500">Loading booking page...</div>}>
      <BookingPageContent />
    </Suspense>
  );
}
