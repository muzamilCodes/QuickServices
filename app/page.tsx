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
  UserCheck
} from 'lucide-react';
import ServicesCatalog from '@/components/ServicesCatalog';

const trustSignals = [
  { icon: Clock3, title: 'Quick dispatch', description: 'Fast confirmations with a booking flow built for same-day local help.' },
  { icon: ShieldCheck, title: 'Verified pros', description: 'Trusted specialists, OTP confirmation, and a clean booking record.' },
  { icon: CircleCheckBig, title: 'Simple follow-up', description: 'Live tracking on radar, rebooking, and direct specialist phone call.' },
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

  return (
    <div className="overflow-hidden bg-[var(--background)]">
      
      {/* =========================================================================
          HERO SECTION (ORIGINAL WARM BRAND PALETTE + USER'S OWN PHOTO)
      ========================================================================= */}
      <section className="relative overflow-hidden pb-16 pt-8 sm:pb-24 sm:pt-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,98,201,0.22),transparent_28%),radial-gradient(circle_at_78%_16%,rgba(255,138,61,0.15),transparent_24%)] pointer-events-none" />
        
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          
          {/* Left Hero Column */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-50 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 shadow-sm backdrop-blur dark:bg-white/5 dark:text-slate-300">
              <Sparkles className="h-4 w-4 text-orange-500" />
              Trusted help for everyday home & office services
            </div>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl tracking-tight">
              Professional service bookings with a{' '}
              <span className="bg-gradient-to-r from-[#0f62c9] to-[#ff8a3d] bg-clip-text text-transparent">
                calmer, faster flow.
              </span>
            </h1>

            <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400 mx-auto lg:mx-0">
              QuickServices connects you directly with verified plumbers, electricians, drivers, cleaners, and appliance experts across Kashmir. Pick your service, confirm via secure OTP, and track your specialist live.
            </p>

            {/* Single Clear Primary CTA */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <button
                  onClick={() => router.push('/services')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-[linear-gradient(135deg,#0f62c9,#ff8a3d)] px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-blue-500/25 transition hover:opacity-95 hover:scale-[1.02] active:scale-95"
                >
                  <span>Book a Verified Service Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    const element = document.getElementById('popular-services');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-300 dark:border-white/15 bg-white dark:bg-white/6 px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95"
                >
                  <span>Explore 16+ Categories</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              <p className="text-xs text-slate-500 font-medium text-center lg:text-left">
                ⚡ No advance payment required • Verified specialists • Same-day doorstep support
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9 average rating
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-blue-600" /> 30-min dispatch
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> OTP-secured booking
              </span>
            </div>
          </div>

          {/* Right Hero Column: Stats & Feature Cards */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm space-y-4">

              {/* Decorative glow */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#0f62c9]/20 to-[#ff8a3d]/15 blur-2xl pointer-events-none" />

              {/* Top stat cards row */}
              <div className="relative grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161b22] shadow-lg p-5 flex flex-col gap-1">
                  <span className="text-3xl font-black text-[#0f62c9]">4.9★</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Avg Rating</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">From verified customers</span>
                </div>
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161b22] shadow-lg p-5 flex flex-col gap-1">
                  <span className="text-3xl font-black text-[#ff8a3d]">30m</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Avg Dispatch</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Same-day, doorstep</span>
                </div>
              </div>

              {/* Live booking status card */}
              <div className="relative rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-[#161b22] shadow-xl p-5 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15">
                  <span className="text-2xl">📲</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                    </span>
                    <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Live & Accepting Bookings</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Srinagar · Handwara · Kupwara</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">OTP confirmed · Zero advance payment</p>
                </div>
              </div>

              {/* Services count + trust row */}
              <div className="relative grid grid-cols-3 gap-3">
                {[
                  { emoji: '🔧', label: '20+', sub: 'Services' },
                  { emoji: '✅', label: '100%', sub: 'Verified Pros' },
                  { emoji: '🏠', label: '5+', sub: 'Cities' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161b22] shadow-sm p-3.5 flex flex-col items-center gap-1 text-center">
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">{item.label}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{item.sub}</span>
                  </div>
                ))}
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
          SECTION 3: HOW IT WORKS — MOBILE-FIRST REDESIGN
      ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#060b18] to-[#0d1424] py-20 px-4 sm:px-6 lg:px-8">

        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-600/10 blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-orange-500/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl">

          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-orange-400">
              ⚡ HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Book your service in{' '}
              <span className="bg-gradient-to-r from-[#4f9cff] to-[#ff8a3d] bg-clip-text text-transparent">
                3 simple steps
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
              Fast, transparent, and secure — from choosing a service to live-tracking your technician.
            </p>
          </div>

          {/* Steps — vertical on mobile, horizontal on desktop */}
          <div className="relative flex flex-col lg:flex-row items-stretch gap-4 lg:gap-0">

            {/* Step 1 */}
            <div className="group relative flex-1 flex flex-col lg:items-center">
              {/* Mobile: left line connector */}
              <div className="absolute left-7 top-20 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/40 to-transparent lg:hidden" />

              <div className="relative flex flex-row lg:flex-col items-start lg:items-center gap-5 lg:gap-0 rounded-2xl lg:rounded-none p-5 lg:p-0 bg-white/4 lg:bg-transparent border border-white/8 lg:border-0 hover:bg-white/8 transition lg:hover:bg-transparent">

                {/* Icon circle */}
                <div className="relative shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30 text-2xl z-10">
                  🔍
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-[10px] font-black text-white border-2 border-[#060b18]">1</span>
                </div>

                {/* Text */}
                <div className="flex-1 lg:text-center lg:mt-5 lg:px-4">
                  <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug mb-1.5">
                    Choose Your Service
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Browse 20+ categories — plumbing, electrical, cleaning, and more. Filter by rating or location and pick your expert.
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop connector arrow 1→2 */}
            <div className="hidden lg:flex items-center justify-center w-10 shrink-0 self-center">
              <div className="flex flex-col items-center gap-1">
                <div className="h-px w-8 bg-gradient-to-r from-blue-500 to-orange-400" />
                <span className="text-slate-500 text-xs">→</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group relative flex-1 flex flex-col lg:items-center">
              {/* Mobile: left line connector */}
              <div className="absolute left-7 top-20 bottom-0 w-0.5 bg-gradient-to-b from-orange-400/40 to-transparent lg:hidden" />

              <div className="relative flex flex-row lg:flex-col items-start lg:items-center gap-5 lg:gap-0 rounded-2xl lg:rounded-none p-5 lg:p-0 bg-white/4 lg:bg-transparent border border-white/8 lg:border-0 hover:bg-white/8 transition lg:hover:bg-transparent">

                {/* Icon circle */}
                <div className="relative shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30 text-2xl z-10">
                  📍
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white border-2 border-[#060b18]">2</span>
                </div>

                {/* Text */}
                <div className="flex-1 lg:text-center lg:mt-5 lg:px-4">
                  <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug mb-1.5">
                    Share Your Location
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Tap &ldquo;Detect My Location&rdquo; for instant GPS fill — or type your address. Pick a date, time slot, and describe the job.
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop connector arrow 2→3 */}
            <div className="hidden lg:flex items-center justify-center w-10 shrink-0 self-center">
              <div className="flex flex-col items-center gap-1">
                <div className="h-px w-8 bg-gradient-to-r from-orange-400 to-emerald-400" />
                <span className="text-slate-500 text-xs">→</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group relative flex-1 flex flex-col lg:items-center">
              <div className="relative flex flex-row lg:flex-col items-start lg:items-center gap-5 lg:gap-0 rounded-2xl lg:rounded-none p-5 lg:p-0 bg-white/4 lg:bg-transparent border border-white/8 lg:border-0 hover:bg-white/8 transition lg:hover:bg-transparent">

                {/* Icon circle */}
                <div className="relative shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30 text-2xl z-10">
                  📲
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white border-2 border-[#060b18]">3</span>
                </div>

                {/* Text */}
                <div className="flex-1 lg:text-center lg:mt-5 lg:px-4">
                  <h3 className="text-base sm:text-lg font-extrabold text-white leading-snug mb-1.5">
                    Confirm OTP &amp; Track Live
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Verify via OTP from your inbox. Get the technician&apos;s direct contact number and watch them arrive on a live map.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Quick proof strip */}
          <div className="mt-10 flex flex-wrap justify-center gap-3 sm:gap-6">
            {[
              { icon: '⚡', text: 'Same-day dispatch' },
              { icon: '🔐', text: 'OTP secured' },
              { icon: '💬', text: 'Direct specialist call' },
              { icon: '₹', text: 'No advance needed' },
            ].map((item) => (
              <span key={item.text} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-300">
                <span>{item.icon}</span>{item.text}
              </span>
            ))}
          </div>

          {/* CTA Row */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => router.push('/services')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0f62c9] to-[#ff8a3d] px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-900/40 hover:opacity-95 transition active:scale-95"
            >
              🚀 Book a Service Now
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition"
            >
              📞 Talk to us first
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4: TRUST SIGNALS
      ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-white/8 bg-slate-100/60 dark:bg-[#080c12]">
        <div className="mx-auto max-w-7xl grid gap-8 md:grid-cols-3">
          {trustSignals.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-slate-200 dark:border-white/8 p-6 shadow-sm bg-white dark:bg-[#161b22]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f62c9]/15 text-[#4f9cff]">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: "PEOPLE ALSO ASK" (FAQ ACCORDION & TOPIC CLUSTER)
      ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-white/8 bg-[var(--background)]" id="faqs" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-4xl">
          <div className="text-center space-y-2 mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-500">
              <HelpCircle className="h-3.5 w-3.5" />
              PEOPLE ALSO ASK
            </div>
            <h2 id="faq-heading" className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Immediate answers to common queries regarding doorstep technicians, pricing, and bookings in Kashmir.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-slate-200 dark:border-white/8 overflow-hidden transition-all duration-200 bg-white dark:bg-[#161b22]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left font-bold text-slate-900 dark:text-white transition hover:bg-slate-50 dark:hover:bg-white/5"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg pr-4">{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-orange-500' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-[#0f1419]">
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
      <section className="bg-slate-900 py-16 px-4 sm:px-6 lg:px-8 text-white">
        <div className="mx-auto max-w-7xl rounded-3xl bg-slate-950 border border-white/10 p-8 sm:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.8fr] items-center">
            
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-orange-400 shadow-lg bg-gradient-to-br from-[#0f62c9] to-[#ff8a3d]">
                <span className="text-3xl font-black text-white select-none">MW</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Muzamil War</h3>
                <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                  Founder & Verified Services Lead
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>Handwara Qalamabad, Kashmir</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-300 leading-relaxed border-t border-white/10 pt-6 lg:border-t-0 lg:pt-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                <UserCheck className="h-3.5 w-3.5" />
                E-E-A-T Verified Local Expertise
              </div>
              <h4 className="text-xl font-extrabold text-white">
                Our Promise: Transparent, Reliable Trades Across Every Valley Neighborhood.
              </h4>
              <p>
                QuickServices was born to eliminate unreliable tradesmen, unpredictable charges, and unverified work orders. Every plumber, electrician, cleaner, and technician is vetted for skill, punctuality, and background safety before taking their first booking.
              </p>
              
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-medium text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-orange-400" /> 100% In-House Verified
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-orange-400" /> Direct Specialist Call
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-orange-400" /> Last Updated: October 2026
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
