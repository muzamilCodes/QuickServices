'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Loader2, 
  MapPin, 
  Calendar, 
  Phone, 
  User, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  ShieldCheck, 
  MessageSquare, 
  Radio, 
  RotateCw, 
  AlertCircle,
  Truck,
  Wrench,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getApiBaseUrl } from "@/lib/apiBase";
import { servicesById } from "@/lib/services";
import LiveTrackingMap from "@/components/LiveTrackingMap";

interface BookingDetail {
  _id: string;
  user?: { username?: string; email?: string; mobile?: string };
  customerName?: string;
  customerPhone?: string;
  providerLiveLocation?: { lat: number; lng: number; heading?: number; speed?: number };
  customerLiveLocation?: { lat: number; lng: number };
  provider?: { 
    name: string; 
    phone: string; 
    whatsappNumber?: string;
  };
  serviceType: string;
  preferredDate?: string;
  preferredTime?: string;
  address?: { 
    fullAddress?: string; 
    city?: string; 
    pincode?: string; 
    landmark?: string; 
  };
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled' | string;
  description?: string;
  amount?: number;
  originalAmount?: number;
  discountAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  isEmergency?: boolean;
  createdAt: string;
}

const STEPS = [
  { key: 'placed', label: 'Request Placed', desc: 'Booking received and verified', icon: Clock },
  { key: 'assigned', label: 'Specialist Assigned', desc: 'Verified professional assigned', icon: ShieldCheck },
  { key: 'in-progress', label: 'On The Way / Working', desc: 'Specialist attending the service', icon: Wrench },
  { key: 'completed', label: 'Completed', desc: 'Job successfully finished', icon: CheckCircle2 },
];

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params?.id as string;
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const API_URL = getApiBaseUrl();

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const fetchBooking = useCallback(async (isSilent = false) => {
    if (!bookingId) return;
    if (isSilent) setRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success && data.booking) {
        setBooking(data.booking);
      }
    } catch (error) {
      console.error('Fetch booking error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_URL, bookingId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchBooking();
    }
  }, [isAuthenticated, authLoading, fetchBooking, router]);

  // Polling for live status updates every 15 seconds
  useEffect(() => {
    if (!isAuthenticated || !bookingId) return;
    const interval = setInterval(() => {
      fetchBooking(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchBooking, isAuthenticated, bookingId]);

  const copyPhoneNumber = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'accepted': return 1;
      case 'in-progress': return 2;
      case 'completed': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-600">Loading live tracking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">Booking Not Found</h2>
          <p className="mt-2 text-sm text-slate-600">We couldn&apos;t locate this booking under your account.</p>
          <button 
            onClick={() => router.push("/dashboard/history")} 
            className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Go to Booking History
          </button>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(booking.status);
  const serviceInfo = servicesById[booking.serviceType];
  const providerPhone = booking.provider?.phone || '';
  const cleanPhone = providerPhone.replace(/[^0-9]/g, '');
  const customerMobile = booking.customerPhone || booking.user?.mobile || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button 
            onClick={() => router.push('/dashboard/history')} 
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </button>

          <button
            onClick={() => fetchBooking(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
          >
            <RotateCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Live Status'}
          </button>
        </div>

        {/* Live Tracking Radar Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 sm:p-8 text-white shadow-2xl">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                Live Service Tracking
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
                {serviceInfo?.name || booking.serviceType} Specialist
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Booking ID: <span className="font-mono font-bold text-white">#{booking._id.slice(-8).toUpperCase()}</span>
                {booking.isEmergency && <span className="ml-2 inline-flex items-center rounded-md bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-300">🚨 Emergency Express</span>}
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end">
              <span className="text-xs uppercase tracking-wider text-slate-400">Current Status</span>
              <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold ${
                booking.status === 'completed' ? 'bg-emerald-500 text-white' :
                booking.status === 'in-progress' ? 'bg-purple-500 text-white' :
                booking.status === 'accepted' ? 'bg-blue-500 text-white' :
                booking.status === 'cancelled' ? 'bg-rose-500 text-white' :
                'bg-amber-400 text-slate-950'
              }`}>
                {booking.status === 'pending' ? 'Looking for Specialist' :
                 booking.status === 'accepted' ? 'Specialist Assigned' :
                 booking.status === 'in-progress' ? 'On The Way / Active' :
                 booking.status === 'completed' ? 'Service Completed' :
                 'Cancelled'}
              </span>
            </div>
          </div>

          {/* Step Progress Bar */}
          {booking.status !== 'cancelled' ? (
            <div className="relative mt-8 pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {STEPS.map((step, idx) => {
                  const isDone = currentStep > idx;
                  const isCurrent = currentStep === idx;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="flex flex-col items-start gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isDone 
                            ? 'bg-emerald-500 text-white' 
                            : isCurrent 
                            ? 'bg-blue-500 text-white ring-4 ring-blue-500/30 animate-pulse' 
                            : 'bg-white/10 text-slate-400'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-mono text-slate-400">Step {idx + 1}</span>
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isCurrent ? 'text-white font-bold' : isDone ? 'text-emerald-300' : 'text-slate-400'}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-slate-400 leading-tight mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-300 text-sm flex items-center gap-3">
              <XCircle className="h-5 w-5 shrink-0" />
              <span>This booking was cancelled. If you need service, please place a new booking.</span>
            </div>
          )}
        </div>

        {/* Live GPS Map & Real-time Location Tracking */}
        <LiveTrackingMap
          bookingId={booking._id}
          status={booking.status}
          userRole={user?.role || 'customer'}
          providerName={booking.provider?.name || 'Verified Specialist'}
          providerPhone={booking.provider?.phone}
          customerName={booking.customerName || booking.user?.username || 'Customer'}
          customerPhone={customerMobile}
          customerAddress={booking.address?.fullAddress}
          initialProviderLocation={
            booking.providerLiveLocation &&
            typeof booking.providerLiveLocation.lat === 'number' &&
            !isNaN(booking.providerLiveLocation.lat) &&
            typeof booking.providerLiveLocation.lng === 'number' &&
            !isNaN(booking.providerLiveLocation.lng)
              ? booking.providerLiveLocation
              : null
          }
          initialCustomerLocation={
            booking.customerLiveLocation &&
            typeof booking.customerLiveLocation.lat === 'number' &&
            !isNaN(booking.customerLiveLocation.lat) &&
            typeof booking.customerLiveLocation.lng === 'number' &&
            !isNaN(booking.customerLiveLocation.lng)
              ? booking.customerLiveLocation
              : (booking.address &&
                 typeof (booking.address as any).location?.lat === 'number' &&
                 !isNaN((booking.address as any).location.lat) &&
                 typeof (booking.address as any).location?.lng === 'number' &&
                 !isNaN((booking.address as any).location.lng)
                  ? { lat: (booking.address as any).location.lat, lng: (booking.address as any).location.lng }
                  : null)
          }
          onStatusChange={(newStatus) => {
            setBooking((prev) => prev ? { ...prev, status: newStatus } : null);
          }}
        />

        {/* Assigned Specialist Card (Direct Contact / Number) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Assigned Service Specialist</h2>
                <p className="text-xs text-slate-500">Contact your verified technician directly</p>
              </div>
            </div>
            {booking.provider && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle className="h-3.5 w-3.5" /> Verified
              </span>
            )}
          </div>

          {booking.provider ? (
            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl font-bold text-white shadow-lg shadow-blue-500/20">
                  {booking.provider.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-950">{booking.provider.name}</h3>
                  <p className="text-sm font-medium text-slate-600">QuickServices Verified Technician</p>
                  
                  {/* Phone Number Display */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-sm font-bold text-slate-800">
                      📞 {booking.provider.phone}
                    </span>
                    <button
                      onClick={() => copyPhoneNumber(booking.provider?.phone || '')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      {copiedPhone ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Direct Call & WhatsApp */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`tel:${booking.provider.phone}`}
                  className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 active:scale-95"
                >
                  <Phone className="h-4 w-4" />
                  Call Specialist Now
                </a>

                {booking.provider.whatsappNumber || cleanPhone ? (
                  <a
                    href={`https://wa.me/${booking.provider.whatsappNumber || cleanPhone}?text=Hi%20${encodeURIComponent(booking.provider.name)},%20I%20am%20contacting%20you%20regarding%20QuickServices%20Booking%20%23${booking._id.slice(-6)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-95"
                  >
                    <MessageSquare className="h-4 w-4" />
                    WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Radio className="h-5 w-5 animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Matching Nearest Professional Specialist...</h4>
                    <p className="mt-1 text-xs text-slate-600">
                      Our dispatch system is assigning the closest verified specialist in your area. You will receive an SMS and email notification with their contact details immediately.
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <a
                    href="tel:+919682645127"
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Support: +91 9682645127
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Booking & Customer Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer & Location */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" /> Service Location & Customer
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5">
                <User className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">{booking.customerName || booking.user?.username || 'Customer'}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    📱 Phone: {customerMobile || 'Not provided'}
                  </p>
                  <p className="text-xs text-slate-500">
                    ✉️ Email: {booking.user?.email || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5">
                <MapPin className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">{booking.address?.fullAddress || 'Address specified'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {booking.address?.city} - {booking.address?.pincode}
                    {booking.address?.landmark && ` (Near ${booking.address.landmark})`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule & Pricing */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-600" /> Schedule & Payment
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5">
                <Clock className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">
                    {booking.preferredDate ? new Date(booking.preferredDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) : 'Preferred date'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Slot: <span className="font-semibold text-slate-700">{booking.preferredTime || 'Standard Service Hours'}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Service Fee</span>
                  <span className="font-bold text-slate-900 font-mono">₹{booking.amount || booking.originalAmount || 499}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200/60 pt-2">
                  <span className="text-xs text-slate-500">Payment Method</span>
                  <span className="text-xs font-semibold uppercase bg-slate-200/70 px-2 py-0.5 rounded text-slate-800">
                    {booking.paymentMethod === 'cod' ? 'Cash on Delivery (Pay after service)' : booking.paymentMethod || 'Pay after service'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Description */}
        {booking.description && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Special Instructions / Issue Note</h4>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              &quot;{booking.description}&quot;
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
