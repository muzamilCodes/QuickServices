'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock3, IndianRupee, MapPin, ShieldCheck, Star } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { servicesById, Service } from '@/lib/services';
import { getApiBaseUrl } from '@/lib/apiBase';
import Breadcrumbs from '@/components/Breadcrumbs';

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('service') || 'plumber';
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [devBookingOtp, setDevBookingOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [backendServices, setBackendServices] = useState<Service[]>([]);
  const [isLoyalCustomer, setIsLoyalCustomer] = useState(false);
  const [bookingCount, setBookingCount] = useState(0);
  const [loyaltyCouponCode, setLoyaltyCouponCode] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(2);

  const apiUrl = getApiBaseUrl();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${apiUrl}/public/services`);
        const data = await res.json();
        if (data.success && Array.isArray(data.services)) {
          const services = data.services.map((s: any) => ({
            _id: s._id,
            id: s.id || s._id,
            name: s.name,
            icon: s.icon || '🔧',
            description: s.description || '',
            details: s.details || [],
            price: `₹${s.totalEstimatedPrice || s.basePrice || s.price || 499}`,
            numericPrice: Number(s.totalEstimatedPrice || s.basePrice || s.price) || 499,
            basePrice: Number(s.basePrice || s.price) || 499,
            priceUnit: s.priceUnit || 'visit',
            pricingUnit: s.pricingUnit || (s.priceUnit === 'hour' ? 'per_hour' : 'per_visit'),
            hourlyRate: Number(s.hourlyRate) || 0,
            minDurationHours: Number(s.minDurationHours) || 1,
            additionalTimeBilling: s.additionalTimeBilling || '1 hour',
            visitingCharges: Number(s.visitingCharges) || 0,
            materialCharges: Number(s.materialCharges) || 0,
            estimatedLabourCost: Number(s.estimatedLabourCost) || 0,
            totalEstimatedPrice: Number(s.totalEstimatedPrice || s.basePrice || s.price) || 499,
            rating: s.rating || 4.5,
            eta: s.eta || '30 min average dispatch',
            submittedBy: s.submittedBy || '',
          }));
          setBackendServices(services);
        }
      } catch (error) {
        // ignore backend service fetch failures, fallback to local services
      }
    };

    void fetchServices();
  }, [apiUrl]);

  useEffect(() => {
    const checkLoyaltyStatus = async () => {
      if (!isAuthenticated) {
        setIsLoyalCustomer(false);
        setLoyaltyCouponCode(null);
        return;
      }

      try {
        // Get completion count (used for UI messaging)
        const res = await fetch(`${apiUrl}/bookings/my-bookings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();

        if (data.success && data.bookings) {
          const completedCount = data.bookings.filter((b: any) => b.status === 'completed').length;
          setBookingCount(completedCount);
          setIsLoyalCustomer(completedCount >= 5);
        }

        // Fetch unused coupon code so we can send it during booking checkout
        const couponRes = await fetch(`${apiUrl}/loyalty/coupons/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const couponData = await couponRes.json();

        if (couponData.success) {
          const available = Array.isArray(couponData.availableCoupons)
            ? couponData.availableCoupons
            : [];
          const firstUnused = available[0]?.code ?? null;
          setLoyaltyCouponCode(firstUnused);
          setIsLoyalCustomer(Boolean(firstUnused));
        }
      } catch {
        setIsLoyalCustomer(false);
        setLoyaltyCouponCode(null);
      }
    };

    if (!isLoading) {
      void checkLoyaltyStatus();
    }
  }, [apiUrl, isAuthenticated, isLoading]);

  const service = useMemo(() => {
    const backend = backendServices.find((s) => s.id === serviceId || s._id === serviceId);
    return backend || servicesById[serviceId] || servicesById.plumber;
  }, [backendServices, serviceId]);

  useEffect(() => {
    if (service.minDurationHours) {
      setSelectedDuration(service.minDurationHours);
    }
  }, [service.minDurationHours]);

  const isHourly = service.pricingUnit === 'per_hour' || service.priceUnit === 'hour';
  const hourlyRate = service.hourlyRate || (isHourly ? (service.numericPrice || 300) : 0);
  const minDuration = service.minDurationHours || 1;
  const effectiveDuration = Math.max(minDuration, selectedDuration || minDuration);

  const labourTotal = isHourly
    ? hourlyRate * effectiveDuration
    : (service.basePrice || service.numericPrice || 499);

  const visitingFee = Number(service.visitingCharges) || 0;
  const materialFee = Number(service.materialCharges) || 0;
  const originalBookingAmount = labourTotal + visitingFee + materialFee;

  const finalPayableAmount = isLoyalCustomer
    ? Math.round(originalBookingAmount * 0.5)
    : originalBookingAmount;

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
      const apiUrl = getApiBaseUrl();
      const res = await fetch(`${apiUrl}/bookings/create`, {
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
          amount: finalPayableAmount,
          originalAmount: originalBookingAmount,
          selectedDuration: isHourly ? effectiveDuration : undefined,
          // Backend uses this to validate + mark coupon as used during OTP verify
          couponCode: loyaltyCouponCode || null,
          address: {
            fullAddress: form.address,
            city: form.city,
            pincode: form.pincode,
          },
        }),
      });
      let data: { success?: boolean; message?: string; devOtp?: string } = {};
      let rawBody = '';
      try {
        rawBody = await res.text();
        try {
          data = JSON.parse(rawBody) as { success?: boolean; message?: string };
        } catch {
          // body was not JSON
        }
      } catch {
        // ignore read errors
      }

      // Helpful log when backend returns non-JSON or empty body
      if (!data || Object.keys(data).length === 0) {
        console.error('booking/create empty or non-JSON response body', { status: res.status, statusText: res.statusText, rawBody });
      }

      if (res.ok && data.success) {
        setDevBookingOtp(data.devOtp || '');
        setShowOTP(true);
      } else {
        console.error('booking/create failed', { status: res.status, statusText: res.statusText, data, rawBody });
        setMessage(data.message || (rawBody ? `Unable to create booking (${res.status}): ${rawBody}` : `Unable to create booking (${res.status}).`));
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
      const apiUrl = getApiBaseUrl();
      const res = await fetch(`${apiUrl}/bookings/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ otp, bookingMode: 'system' }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (data.success) {
        setDevBookingOtp('');
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
      <div className="mx-auto max-w-6xl mb-4">
        <Breadcrumbs items={[{ name: 'Services', href: '/services' }, { name: service.name }]} />
      </div>
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
              <p className="mt-2 text-lg font-semibold font-mono">
                {isHourly ? `₹${hourlyRate}` : service.price}
              </p>
              <p className="text-xs text-slate-400">
                {isHourly ? `per hour (min ${minDuration} hrs)` : `per ${service.priceUnit}`}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Clock3 className="h-4 w-4 text-blue-300" />
              <p className="mt-2 text-sm font-semibold">{service.eta}</p>
              <p className="text-xs text-slate-400">
                {service.submittedBy ? `Pro: ${service.submittedBy}` : 'Timing'}
              </p>
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

          {isLoyalCustomer && (
            <div className="mt-6 rounded-[28px] border border-amber-200 bg-amber-50 p-6">
              <h3 className="text-lg font-semibold text-amber-900">✨ 50% Loyalty Discount</h3>
              <p className="mt-2 text-sm text-amber-800">
                You have completed {bookingCount} bookings! Your 50% loyalty discount is available for checkout.
              </p>

              <div className="mt-3 text-sm font-medium text-amber-900">
                Coupon code: {loyaltyCouponCode ?? 'Not available'}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-amber-200 bg-white p-3">
                  <p className="text-xs text-slate-600">Original price</p>
                  <p className="text-lg font-semibold text-slate-950">{service.price}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs text-emerald-700">After 50% discount</p>
                  <p className="text-lg font-semibold text-emerald-700">
                    {(() => {
                      const match = service.price.match(/\d+(?:\.\d+)?/);
                      const original = match ? Number(match[0]) : 0;
                      const final = Math.round(original * 0.5);
                      return `₹${final}`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}


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

            {/* If Hourly Service, allow customer to select hours with minimum duration enforced */}
            {isHourly && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Booking Duration (Hours)
                  </label>
                  <span className="text-[11px] text-blue-700 font-semibold">
                    Minimum: {minDuration} hr{minDuration > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[minDuration, minDuration + 1, minDuration + 2, minDuration + 3, 6, 8]
                    .filter((v, idx, arr) => arr.indexOf(v) === idx && v >= minDuration)
                    .slice(0, 5)
                    .map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setSelectedDuration(hrs)}
                        className={`flex-1 rounded-xl py-2 text-xs font-bold transition border ${
                          effectiveDuration === hrs
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {hrs} hrs
                      </button>
                    ))}
                </div>
                <p className="text-[10px] text-slate-500">
                  Rate: <strong>₹{hourlyRate}/hour</strong> · Additional time billed every{' '}
                  <strong>{service.additionalTimeBilling || '1 hour'}</strong>.
                </p>
              </div>
            )}

            {/* Complete Estimated Price Breakdown Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Estimated Price Summary
                </span>
                <span className="text-[11px] text-slate-400 font-medium">No hidden charges</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>
                    Labour Cost {isHourly ? `(${effectiveDuration} hrs @ ₹${hourlyRate}/hr)` : ''}:
                  </span>
                  <span className="font-bold text-slate-900 font-mono">₹{labourTotal}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Visiting / Inspection Fee:</span>
                  <span className="font-semibold text-slate-700 font-mono">
                    {visitingFee > 0 ? `+₹${visitingFee}` : '₹0 (Free Visit)'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Estimated Material Charges:</span>
                  <span className="font-semibold text-slate-700 font-mono">
                    {materialFee > 0 ? `+₹${materialFee}` : '₹0 (As actuals / none)'}
                  </span>
                </div>

                {isLoyalCustomer && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold">
                    <span>Loyalty 50% Discount Applied:</span>
                    <span className="font-mono">-₹{Math.round(originalBookingAmount * 0.5)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="text-sm font-extrabold text-slate-900">
                  Total Estimated Payable:
                </span>
                <span className="text-lg font-black text-emerald-700 font-mono">
                  ₹{finalPayableAmount}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                Payment is made after job completion via Cash on Delivery or UPI.
              </p>
            </div>

            {message && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60 shadow-lg"
            >
              {loading ? 'Processing...' : `Confirm Booking · ₹${finalPayableAmount}`}
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
            {devBookingOtp && (
              <div className="mt-5 rounded-2xl border border-orange-300 bg-orange-50 p-4 text-center">
                <p className="text-sm font-semibold text-orange-900">Email is not working right now. Use this OTP:</p>
                <p className="mt-2 text-3xl font-bold tracking-[0.35em] text-orange-700">{devBookingOtp}</p>
              </div>
            )}
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
