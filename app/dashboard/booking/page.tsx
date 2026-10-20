'use client';

import React, { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Clock3, 
  IndianRupee, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Phone, 
  MessageCircle, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  ArrowLeft,
  Loader2,
  Sparkles,
  Layers,
  Info
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getApiBaseUrl } from '@/lib/apiBase';
import Breadcrumbs from '@/components/Breadcrumbs';
import CustomerLocationPicker, { LocationData } from '@/components/CustomerLocationPicker';
import ProviderCard, { ProviderDetails, AvailabilityInfo } from '@/components/ProviderCard';
import WhatsAppShareModal from '@/components/WhatsAppShareModal';

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceIdParam = searchParams.get('service') || 'plumber';

  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const formRef = useRef<HTMLFormElement>(null);

  // Core Service & Provider State
  const [serviceData, setServiceData] = useState<any>(null);
  const [providerData, setProviderData] = useState<ProviderDetails | null>(null);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityInfo | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string>('');

  // Selected Booking Date & Time Slot
  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [selectedSlot, setSelectedSlot] = useState<string>('09:00 AM - 11:00 AM');

  // Customer Location & Form State
  const [location, setLocation] = useState<LocationData>({
    fullAddress: '',
    city: '',
    pincode: '',
    lat: null,
    lng: null
  });

  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');

  // Hourly duration
  const [selectedDuration, setSelectedDuration] = useState<number>(2);

  // Loyalty Program State
  const [isLoyalCustomer, setIsLoyalCustomer] = useState(false);
  const [loyaltyCouponCode, setLoyaltyCouponCode] = useState<string | null>(null);
  const [bookingCount, setBookingCount] = useState(0);

  // OTP and Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [devBookingOtp, setDevBookingOtp] = useState('');
  const [createdBookingId, setCreatedBookingId] = useState<string>('');

  // WhatsApp Share Modal
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const API_URL = getApiBaseUrl();

  // Prefill user details when authenticated
  useEffect(() => {
    if (user) {
      if (!customerName && user.username) setCustomerName(user.username);
      if (!customerPhone && user.mobile) setCustomerPhone(user.mobile);
    }
  }, [user, customerName, customerPhone]);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/booking?service=${encodeURIComponent(serviceIdParam)}`);
    }
  }, [authLoading, isAuthenticated, router, serviceIdParam]);

  // Fetch Service, Provider, and Availability from backend
  const fetchServiceDetails = async (dateStr?: string) => {
    setFetchingDetails(true);
    setFetchError('');
    try {
      const qDate = dateStr || selectedDate;
      const res = await fetch(`${API_URL}/public/service-details/${encodeURIComponent(serviceIdParam)}?date=${qDate}`);
      const data = await res.json();

      if (data.success && data.service) {
        setServiceData(data.service);
        setProviderData(data.provider || null);
        setAvailabilityData(data.availability || null);

        // Pick first available slot if current slot unavailable
        if (data.availability?.availableSlots) {
          const firstOpen = data.availability.availableSlots.find((s: any) => s.available);
          if (firstOpen) {
            setSelectedSlot(firstOpen.time);
          }
        }

        if (data.service.minDurationHours) {
          setSelectedDuration(data.service.minDurationHours);
        }
      } else {
        setFetchError(data.message || 'Service or provider information could not be retrieved.');
      }
    } catch (err: any) {
      setFetchError('Unable to connect to service backend. Please try again.');
    } finally {
      setFetchingDetails(false);
    }
  };

  useEffect(() => {
    void fetchServiceDetails(selectedDate);
  }, [serviceIdParam, selectedDate]);

  // Check Loyalty discount
  useEffect(() => {
    const checkLoyalty = async () => {
      if (!isAuthenticated) return;
      try {
        const token = localStorage.getItem('token');
        const [bookingsRes, couponRes] = await Promise.all([
          fetch(`${API_URL}/bookings/my-bookings`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/loyalty/coupons/me`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const bData = await bookingsRes.json();
        const cData = await couponRes.json();

        if (bData.success && bData.bookings) {
          const completed = bData.bookings.filter((b: any) => b.status === 'completed').length;
          setBookingCount(completed);
        }

        if (cData.success && Array.isArray(cData.availableCoupons) && cData.availableCoupons.length > 0) {
          setLoyaltyCouponCode(cData.availableCoupons[0].code);
          setIsLoyalCustomer(true);
        }
      } catch {
        // quiet ignore
      }
    };

    if (isAuthenticated && !authLoading) {
      void checkLoyalty();
    }
  }, [API_URL, isAuthenticated, authLoading]);

  // Pricing Calculations
  const isHourly = serviceData?.pricingUnit === 'per_hour' || serviceData?.priceUnit === 'hour';
  const hourlyRate = Number(serviceData?.hourlyRate) || Number(serviceData?.basePrice) || 300;
  const minDuration = Number(serviceData?.minDurationHours) || 1;
  const effectiveDuration = Math.max(minDuration, selectedDuration || minDuration);

  const labourTotal = isHourly
    ? hourlyRate * effectiveDuration
    : (Number(serviceData?.basePrice) || 499);

  const visitingFee = Number(serviceData?.visitingCharges) || 0;
  const materialFee = Number(serviceData?.materialCharges) || 0;
  const originalBookingAmount = labourTotal + visitingFee + materialFee;

  const finalPayableAmount = isLoyalCustomer
    ? Math.round(originalBookingAmount * 0.5)
    : originalBookingAmount;

  // Handle Booking Creation Form Submission
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!location.fullAddress.trim()) {
      setErrorMessage('Please enter or detect your service address.');
      return;
    }
    if (!location.city.trim()) {
      setErrorMessage('Please specify your city or town in Kashmir.');
      return;
    }
    if (!location.pincode.trim() || location.pincode.length < 6) {
      setErrorMessage('Please enter a valid 6-digit postal pincode.');
      return;
    }
    if (!jobDescription.trim()) {
      setErrorMessage('Please describe the service work or repair needed.');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.replace(/\D/g, '').slice(-10),
        serviceType: serviceData?.id || serviceIdParam,
        providerId: providerData?._id || undefined,
        preferredDate: selectedDate,
        preferredTime: selectedSlot,
        amount: finalPayableAmount,
        originalAmount: originalBookingAmount,
        couponCode: loyaltyCouponCode || null,
        description: jobDescription.trim(),
        address: {
          fullAddress: location.fullAddress.trim(),
          city: location.city.trim(),
          pincode: location.pincode.trim(),
          location: location.lat && location.lng ? { lat: location.lat, lng: location.lng } : undefined
        }
      };

      const res = await fetch(`${API_URL}/bookings/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setDevBookingOtp(data.devOtp || '');
        setShowOTP(true);
      } else {
        setErrorMessage(data.message || 'Unable to place booking request. Please try another time slot.');
      }
    } catch (err: any) {
      setErrorMessage('Booking network request failed. Please verify your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/bookings/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ otp, bookingMode: 'system' })
      });

      const data = await res.json();
      if (data.success) {
        setDevBookingOtp('');
        setShowOTP(false);
        if (data.booking?._id) {
          setCreatedBookingId(data.booking._id);
        }
        router.push('/history');
      } else {
        setErrorMessage(data.message || 'Verification code failed. Please check and re-enter.');
      }
    } catch {
      setErrorMessage('Verification request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (authLoading || (fetchingDetails && !serviceData)) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-slate-600 dark:text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
        <p className="text-sm font-bold">Connecting to QuickServices Kashmir booking engine...</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Retrieving verified specialist and real-time slots</p>
      </div>
    );
  }

  if (fetchError && !serviceData) {
    return (
      <div className="min-h-[70vh] max-w-xl mx-auto flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Service Not Found</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{fetchError}</p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/services"
            className="rounded-2xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
          >
            Browse All Services
          </Link>
          <Link
            href="/"
            className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 transition-colors">
      <div className="mx-auto max-w-6xl mb-4">
        <Breadcrumbs
          items={[
            { name: 'Services', href: '/services' },
            { name: serviceData?.name || 'Service Booking' }
          ]}
        />
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] items-start">
        {/* Left Column: Service Details & Provider Card */}
        <div className="space-y-6">
          {/* Main Service Overview Card */}
          <section className="rounded-[30px] border border-slate-800 bg-slate-950 p-7 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl shadow-inner border border-white/10">
                {serviceData?.icon || '🔧'}
              </div>
              <span className="rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-blue-300">
                {serviceData?.category || 'Doorstep Service'}
              </span>
            </div>

            <p className="mt-5 text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">
              QuickServices Kashmir Booking
            </p>
            <h1 className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {serviceData?.name}
            </h1>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-300">
              {serviceData?.description}
            </p>

            {/* Quick Metrics Grid */}
            <div className="mt-6 grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center sm:text-left">
                <Star className="h-4 w-4 fill-amber-300 text-amber-300 mx-auto sm:mx-0" />
                <p className="mt-1.5 text-base font-black">{serviceData?.rating?.toFixed(1) || '4.8'}</p>
                <p className="text-[10px] text-slate-400">Verified Rating</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center sm:text-left">
                <IndianRupee className="h-4 w-4 text-emerald-300 mx-auto sm:mx-0" />
                <p className="mt-1.5 text-base font-black font-mono">
                  ₹{isHourly ? hourlyRate : (serviceData?.basePrice || 499)}
                </p>
                <p className="text-[10px] text-slate-400">
                  {isHourly ? `per hr (min ${minDuration}h)` : `per ${serviceData?.priceUnit || 'visit'}`}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center sm:text-left">
                <Clock3 className="h-4 w-4 text-blue-300 mx-auto sm:mx-0" />
                <p className="mt-1.5 text-xs font-black truncate">
                  {availabilityData?.estimatedArrival || '30 - 45 min'}
                </p>
                <p className="text-[10px] text-slate-400">Estimated Dispatch</p>
              </div>
            </div>

            {/* Service Scope Tags */}
            {Array.isArray(serviceData?.details) && serviceData.details.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {serviceData.details.map((detail: string) => (
                  <span
                    key={detail}
                    className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/90 border border-white/10"
                  >
                    ✓ {detail}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Real Provider Details & Availability Status Card */}
          <ProviderCard
            provider={providerData}
            availability={availabilityData}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onOpenWhatsAppShare={() => setIsWhatsAppModalOpen(true)}
            onScrollToForm={scrollToForm}
          />
        </div>

        {/* Right Column: Customer Details, Location Picker, and Checkout Form */}
        <div>
          <section className="rounded-[30px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-7 sm:p-8 shadow-xl shadow-slate-100 dark:shadow-black/50 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Book Your Doorstep Specialist
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Confirm your location and service requirements. Payment is made post-job completion via Cash or UPI.
              </p>
            </div>

            {/* 50% Loyalty Discount Notification Banner */}
            {isLoyalCustomer && (
              <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <h4 className="text-sm font-black text-amber-900 dark:text-amber-200">
                    50% Loyalty Reward Applied!
                  </h4>
                </div>
                <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                  You have completed {bookingCount} previous bookings. Coupon code <strong>{loyaltyCouponCode}</strong> automatically deducts 50% from this job!
                </p>
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmitBooking} className="space-y-5">
              {/* Customer Contact Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. War Muzamil"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition focus:border-blue-500 dark:focus:border-blue-400 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition focus:border-blue-500 dark:focus:border-blue-400 shadow-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Location Picker with Geolocation & Draggable Leaflet Marker */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Doorstep Service Location
                </h3>
                <CustomerLocationPicker
                  value={location}
                  onChange={setLocation}
                  disabled={submitting}
                />
              </div>

              {/* Job Description */}
              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  3. Describe The Issue / Requirements <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={`Describe what needs fixing or installation for this ${serviceData?.name?.toLowerCase() || 'service'}...`}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition focus:border-blue-500 dark:focus:border-blue-400 shadow-sm"
                />
              </div>

              {/* If Hourly Service, duration buttons */}
              {isHourly && (
                <div className="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">Required Hours:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">Min: {minDuration} hrs</span>
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
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {hrs}h
                        </button>
                      ))}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Rate: ₹{hourlyRate}/hour · Billed per {serviceData?.additionalTimeBilling || '1 hour'}.
                  </p>
                </div>
              )}

              {/* Transparent Price Summary Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Price Breakdown
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    No Upfront Deposit
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>
                      Labour Charges {isHourly ? `(${effectiveDuration}h @ ₹${hourlyRate}/hr)` : ''}:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      ₹{labourTotal}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Visiting / Inspection Fee:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {visitingFee > 0 ? `+₹${visitingFee}` : '₹0 (Free Visit)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Material / Parts:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {materialFee > 0 ? `+₹${materialFee}` : '₹0 (As actuals / none)'}
                    </span>
                  </div>

                  {isLoyalCustomer && (
                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>50% Loyalty Discount:</span>
                      <span className="font-mono">-₹{Math.round(originalBookingAmount * 0.5)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-2.5">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Total Estimated Amount:
                  </span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹{finalPayableAmount}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-4 py-3 text-xs font-bold text-rose-700 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-950 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white py-3.5 px-6 text-sm font-extrabold shadow-xl shadow-slate-900/10 dark:shadow-blue-600/20 transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Booking...</span>
                  </>
                ) : (
                  <span>Confirm Booking · ₹{finalPayableAmount}</span>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
                🔒 Your booking is verified securely via email OTP. No credit card required.
              </p>
            </form>
          </section>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Verify Booking Request
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter the 6-digit code sent to your registered email.
                </p>
              </div>
            </div>

            {devBookingOtp && (
              <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-3.5 text-center">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Instant Verification Code:
                </p>
                <p className="mt-1 text-2xl font-black tracking-[0.35em] text-amber-700 dark:text-amber-400 font-mono">
                  {devBookingOtp}
                </p>
              </div>
            )}

            <div>
              <input
                type="text"
                autoFocus
                placeholder="• • • • • •"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-3 text-center text-2xl font-black tracking-[0.35em] text-slate-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-blue-400 font-mono shadow-sm"
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-center font-bold text-rose-600 dark:text-rose-400">
                {errorMessage}
              </p>
            )}

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={submitting || otp.length < 6}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 px-4 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Verify & Confirm</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowOTP(false)}
                className="rounded-2xl border border-slate-300 dark:border-slate-700 py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Location Sharing Modal */}
      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        serviceName={serviceData?.name || 'Home Service'}
        customerName={customerName}
        customerAddress={location.fullAddress}
        lat={location.lat}
        lng={location.lng}
        bookingDate={selectedDate}
        bookingTime={selectedSlot}
        providerWhatsapp={providerData?.whatsappNumber || providerData?.phone}
      />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-slate-500">
          Loading QuickServices booking engine...
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
