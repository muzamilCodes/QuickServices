'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  Calendar,
  CheckCircle2,
  ChevronDown,
  CircleCheckBig, 
  Clock3, 
  HelpCircle,
  MapPin,
  Phone,
  ShieldCheck, 
  Sparkles, 
  Star,
  UserCheck,
  Search,
  LocateFixed,
  Zap,
  Check,
  Award,
  Navigation
} from 'lucide-react';
import ServicesCatalog from '@/components/ServicesCatalog';

const trustSignals = [
  { 
    icon: Clock3, 
    title: '30-Minute Dispatch', 
    description: 'Fast confirmations built for same-day urgent doorstep assistance across Srinagar and Kashmir Valley.' 
  },
  { 
    icon: ShieldCheck, 
    title: '100% Verified Specialists', 
    description: 'Every professional undergoes identity verification, background screening, and hands-on skill evaluation.' 
  },
  { 
    icon: CircleCheckBig, 
    title: 'Transparent Pricing & Follow-up', 
    description: 'Upfront rates starting from ₹249 with zero hidden visit charges. Pay only after you are 100% satisfied.' 
  },
];

const faqs = [
  {
    q: 'How quickly can a service specialist arrive at my doorstep in Kashmir?',
    a: 'Technician dispatch average is 30 minutes for urgent repair needs across Srinagar, Handwara, Kupwara, and Baramulla. Same-day appointments can also be scheduled at your preferred time slot.',
  },
  {
    q: 'How does the OTP verification work for home service bookings?',
    a: 'A secure 4-digit OTP is delivered instantly to your registered inbox to confirm identity and prevent unauthorized orders. The specialist verifies this code at your door before starting the task.',
  },
  {
    q: 'Are the repair prices fixed or will there be hidden charges?',
    a: 'QuickServices operates on 100% transparent pricing starting from ₹249 with zero surprise visit charges. If hardware parts are required, our specialist provides an upfront quote before installation.',
  },
  {
    q: 'Can I call the assigned technician directly before they arrive?',
    a: 'Yes. As soon as your booking is accepted, the assigned specialist’s verified direct phone number is unlocked on your radar and status dashboard.',
  },
  {
    q: 'What areas across Jammu & Kashmir are currently supported?',
    a: 'We actively provide doorstep service across Srinagar, Handwara, Kupwara, Sopore, Baramulla, and neighboring valley districts, with ongoing expansion to Jammu.',
  },
  {
    q: 'Who is behind QuickServices and how are pros vetted?',
    a: 'QuickServices was founded and is locally led by Muzamil War. Every professional passes strict background screening, identity verification, and hands-on skill evaluations.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedQuickService, setSelectedQuickService] = useState('plumbing');

  return (
    <div className="overflow-hidden bg-[var(--background)] transition-colors duration-200">
      
      {/* =========================================================================
          HERO SECTION (CLEAN, MODERN, PRODUCT-FOCUSED)
      ========================================================================= */}
      <section className="relative overflow-hidden pb-16 pt-8 sm:pb-24 sm:pt-14">
        {/* Soft background ambient gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,98,201,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(255,138,61,0.14),transparent_30%)] pointer-events-none" />
        
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:px-8">
          
          {/* Left Hero Column */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-50/80 px-4 py-2 text-xs sm:text-sm font-semibold text-blue-700 shadow-sm backdrop-blur dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-700/50">
              <Sparkles className="h-4 w-4 text-orange-500 shrink-0" />
              <span>Doorstep Home &amp; Office Services Across Kashmir</span>
            </div>

            <h1 className="max-w-3xl text-3xl sm:text-5xl lg:text-6xl font-black leading-tight sm:leading-tight text-slate-900 dark:text-white tracking-tight">
              Book verified local experts with a{' '}
              <span className="bg-gradient-to-r from-[#0f62c9] via-[#2563eb] to-[#ff8a3d] bg-clip-text text-transparent">
                calmer, faster flow.
              </span>
            </h1>

            <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300 mx-auto lg:mx-0">
              Connect directly with screened plumbers, electricians, cleaners, and appliance technicians. 1-click GPS location detection, instant OTP verification, and live technician arrival tracking.
            </p>

            {/* Hero CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/services')}
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#0f62c9] to-[#ff8a3d] px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-blue-500/25 transition hover:opacity-95 hover:scale-[1.01] active:scale-95"
                >
                  <span>Book a Verified Service</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const element = document.getElementById('popular-services');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#161b22] px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95"
                >
                  <span>Explore 20+ Categories</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center lg:text-left flex items-center justify-center lg:justify-start gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> No advance payment
                </span>
                <span>•</span>
                <span>Verified specialists</span>
                <span>•</span>
                <span>30-min dispatch</span>
              </p>
            </div>

            {/* Quick Proof Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-3 py-1.5 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>4.9 / 5 Average Rating</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500/10 px-3 py-1.5 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                <Clock3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>30-Min Fast Dispatch</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>OTP-Secured Booking</span>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Modern Interactive Booking Card */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#161b22]/90 p-6 sm:p-7 shadow-2xl shadow-slate-200/60 dark:shadow-black/60 backdrop-blur-md space-y-5">
              
              {/* Card Header with Live Pulse */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/8">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#ff8a3d]" />
                    <span>Instant Doorstep Help</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Available across Srinagar &amp; Kashmir Valley</p>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  <span>Active</span>
                </div>
              </div>

              {/* Service Quick Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Select Popular Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'plumbing', name: 'Plumber', icon: '🔧', price: 'From ₹299' },
                    { id: 'electrical-works', name: 'Electrician', icon: '⚡', price: 'From ₹349' },
                    { id: 'appliances', name: 'Appliance Repair', icon: '❄️', price: 'From ₹399' },
                    { id: 'house-section', name: 'Home Cleaning', icon: '🧹', price: 'From ₹499' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedQuickService(s.id)}
                      className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                        selectedQuickService === s.id
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50/50 dark:bg-white/4'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-lg">{s.icon}</span>
                        {selectedQuickService === s.id && (
                          <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">{s.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{s.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Feature Pill */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/8 bg-slate-50 dark:bg-white/4 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                    <LocateFixed className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">1-Click GPS Detect</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Doorstep coordinate mapping</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">⚡ Auto-fill</span>
              </div>

              {/* Direct Booking CTA */}
              <button
                type="button"
                onClick={() => router.push(`/booking?service=${selectedQuickService}`)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0f62c9] to-[#ff8a3d] py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-95 active:scale-95"
              >
                <span>Continue to Instant Booking</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Bottom stats summary */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-white/8 text-center text-[11px]">
                <div>
                  <p className="font-black text-slate-900 dark:text-white">20+</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px]">Trades</p>
                </div>
                <div>
                  <p className="font-black text-emerald-600 dark:text-emerald-400">30 Min</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px]">Avg Arrival</p>
                </div>
                <div>
                  <p className="font-black text-orange-500">100%</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px]">Satisfaction</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 2: FULL SERVICES CATALOG WITH FILTER (ON HOME PAGE)
      ========================================================================= */}
      <div id="popular-services">
        <ServicesCatalog title="Reliable home repair and maintenance services" limitCards={8} />
      </div>

      {/* =========================================================================
          SECTION 3: HOW IT WORKS — COHESIVE, USER-FRIENDLY & RESPONSIVE
      ========================================================================= */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-[#0c121e]">
        
        {/* Subtle decorative glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-blue-500/10 blur-[90px]" />
          <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-orange-500/10 blur-[90px]" />
        </div>

        <div className="relative mx-auto max-w-6xl">

          {/* Section Header */}
          <div className="text-center mb-14 sm:mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
              <Zap className="h-3.5 w-3.5" />
              <span>Simple 3-Step Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Book your service in{' '}
              <span className="bg-gradient-to-r from-[#0f62c9] via-[#2563eb] to-[#ff8a3d] bg-clip-text text-transparent">
                3 simple steps
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Transparent, fast, and secure — from picking your service to tracking your technician live on your doorstep.
            </p>
          </div>

          {/* 3 Steps Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">

            {/* Step 1 */}
            <div className="relative group rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161b22] p-6 sm:p-7 shadow-lg shadow-slate-200/40 dark:shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                    <Search className="h-7 w-7" />
                  </div>
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-black text-blue-700 dark:text-blue-300">
                    Step 01
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Browse &amp; Select
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    Choose Your Service
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Browse 20+ verified categories like Plumbing, Electrical, Cleaning, or Appliance repair. Compare clear upfront rates with zero surprise charges.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/8 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Upfront transparent prices</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Verified trades &amp; customer ratings</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161b22] p-6 sm:p-7 shadow-lg shadow-slate-200/40 dark:shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-orange-400 dark:hover:border-orange-500 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/25">
                    <MapPin className="h-7 w-7" />
                  </div>
                  <span className="rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 px-3 py-1 text-xs font-black text-orange-700 dark:text-orange-300">
                    Step 02
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    GPS Auto-Detect
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    Share Your Location
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Tap &ldquo;Detect My Location&rdquo; for automatic GPS doorstep detection, or type your address. Pick your convenient date and preferred arrival slot.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/8 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>1-click GPS doorstep auto-fill</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Interactive map pin refinement</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161b22] p-6 sm:p-7 shadow-lg shadow-slate-200/40 dark:shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-500 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
                    Step 03
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Safety &amp; Tracking
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    Confirm OTP &amp; Track
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Verify with the secure 4-digit code sent to your inbox. Get your assigned technician&apos;s direct phone number and watch them arrive in real time.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/8 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Instant inbox OTP security</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Direct phone call &amp; live radar map</span>
                </div>
              </div>
            </div>

          </div>

          {/* Trust Guarantees Bar */}
          <div className="mt-12 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161b22] p-4 sm:p-5 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">⚡</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Same-Day Dispatch</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Avg 30 mins arrival</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">🔐</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">OTP Verified</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Zero unauthorized orders</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">💬</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Direct Phone Call</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Call pro directly anytime</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">₹</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">No Advance Needed</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Pay after job completion</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/services')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0f62c9] to-[#ff8a3d] px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 hover:opacity-95 transition active:scale-95"
            >
              <span>Book a Verified Service Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => router.push('/contact')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#161b22] px-8 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition"
            >
              <Phone className="h-4 w-4 text-[#0f62c9]" />
              <span>Talk to Customer Support</span>
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4: TRUST SIGNALS
      ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-white/8 bg-slate-100/60 dark:bg-[#080c12]">
        <div className="mx-auto max-w-7xl grid gap-6 md:grid-cols-3">
          {trustSignals.map(({ icon: Icon, title, description }) => (
            <div 
              key={title} 
              className="rounded-3xl border border-slate-200 dark:border-white/8 p-6 sm:p-7 shadow-sm bg-white dark:bg-[#161b22] transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: "PEOPLE ALSO ASK" (FAQ ACCORDION)
      ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--background)]" id="faqs" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-4xl">
          <div className="text-center space-y-2 mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3.5 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 border border-orange-500/20">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>PEOPLE ALSO ASK</span>
            </div>
            <h2 id="faq-heading" className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              Immediate answers to common questions regarding doorstep technicians, pricing, and bookings in Kashmir.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden transition-all duration-200 bg-white dark:bg-[#161b22] shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left font-bold text-slate-900 dark:text-white transition hover:bg-slate-50 dark:hover:bg-white/5"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg pr-4 font-extrabold">{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-orange-500' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-white/8 bg-slate-50/70 dark:bg-[#0f1419]">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: E-E-A-T & LOCAL FOUNDER TRUST COMMITMENT
      ========================================================================= */}
      <section className="bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 text-white">
        <div className="mx-auto max-w-6xl rounded-3xl bg-slate-900 border border-white/10 p-7 sm:p-10 shadow-2xl">
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr] items-center">
            
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl border-2 border-orange-400 shadow-xl bg-gradient-to-br from-[#0f62c9] to-[#ff8a3d]">
                <span className="text-2xl sm:text-3xl font-black text-white select-none">MW</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                  <span>Muzamil War</span>
                  <Award className="h-4 w-4 text-orange-400" />
                </h3>
                <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mt-0.5">
                  Founder &amp; Verified Services Lead
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 justify-center sm:justify-start">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Handwara Qalamabad, Kashmir</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed border-t border-white/10 pt-6 lg:border-t-0 lg:pt-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                <UserCheck className="h-3.5 w-3.5" />
                <span>E-E-A-T Verified Local Expertise</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-white leading-snug">
                Our Promise: Transparent, Reliable Trades Across Every Valley Neighborhood.
              </h4>
              <p>
                QuickServices was created to eliminate unreliable tradesmen, unpredictable charges, and unverified work orders. Every plumber, electrician, cleaner, and technician is vetted for skill, punctuality, and background safety before taking their first booking.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs font-medium text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-orange-400" /> 100% In-House Screened
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-orange-400" /> Direct Specialist Call
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-orange-400" /> Verified 2026
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
