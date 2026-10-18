'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-white/5 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 shadow-sm backdrop-blur">
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

          {/* Right Hero Column: USER'S OWN UPLOADED PHOTO */}
          <div className="flex justify-center">
            <div className="relative w-72 sm:w-80 lg:w-[380px]">
              
              {/* Decorative Glow */}
              <div className="absolute -inset-2 rounded-[36px] bg-gradient-to-tr from-[#0f62c9] to-[#ff8a3d] opacity-25 blur-xl" />

              <div className="relative overflow-hidden rounded-[32px] border-4 border-white dark:border-[#1c2333] bg-white dark:bg-[#161b22] shadow-2xl shadow-slate-300/60 dark:shadow-black/60">
                <div className="relative h-[420px] sm:h-[480px] w-full">
                  <Image
                    src="/hero-user.jpg"
                    alt="QuickServices Expert"
                    fill
                    priority
                    className="object-cover object-top hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  
                  {/* Floating Verified Badge on User Photo */}
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 dark:bg-[#0d1117]/90 p-3.5 shadow-xl backdrop-blur-md border border-slate-200 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-950 dark:text-white">Muzamil War</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Verified Services Lead</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-700">
                        ★ 4.9
                      </span>
                    </div>
                  </div>

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
          SECTION 3: HOW IT WORKS — PREMIUM REDESIGN
      ========================================================================= */}
      <section className="relative overflow-hidden bg-[#0a0f1e] py-24 px-4 sm:px-6 lg:px-8">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-[#0f62c9]/10 blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-[#ff8a3d]/10 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl">

          {/* Section Label */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-orange-400 mb-5">
              ⚡ HOW IT WORKS
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Book your service in{' '}
              <span className="bg-gradient-to-r from-[#4f9cff] to-[#ff8a3d] bg-clip-text text-transparent">
                3 simple steps
              </span>
            </h2>
            <p className="mt-4 text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
              From choosing your service to live tracking your technician — the entire experience is fast, transparent, and secure.
            </p>
          </div>

          {/* Steps */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">

            {/* Connector Line (desktop only) */}
            <div className="hidden md:block absolute top-[3.75rem] left-[20%] right-[20%] h-px bg-gradient-to-r from-[#0f62c9] via-[#ff8a3d] to-[#0f62c9] opacity-30 z-0" />

            {[
              {
                step: '01',
                emoji: '🔍',
                title: 'Choose Your Service',
                desc: 'Browse 20+ verified home repair and maintenance categories. Filter by price, location, rating, and availability — then pick the best match.',
                color: 'from-blue-500 to-blue-700',
                glowColor: 'shadow-blue-500/30',
                dotColor: 'bg-blue-500',
              },
              {
                step: '02',
                emoji: '📍',
                title: 'Share Your Location',
                desc: 'Enter your doorstep address, preferred date and time slot, and a brief note about the job. Review price before confirming.',
                color: 'from-orange-400 to-orange-600',
                glowColor: 'shadow-orange-500/30',
                dotColor: 'bg-orange-400',
              },
              {
                step: '03',
                emoji: '📲',
                title: 'Confirm OTP & Track Live',
                desc: 'Verify your booking via OTP sent to your inbox. Get your assigned technician\'s contact, and watch them arrive in real-time on the map.',
                color: 'from-emerald-400 to-teal-600',
                glowColor: 'shadow-emerald-500/30',
                dotColor: 'bg-emerald-400',
              },
            ].map((step, idx) => (
              <div
                key={step.step}
                className="relative z-10 group flex flex-col rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                {/* Step number + emoji */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg ${step.glowColor} text-2xl select-none`}>
                    {step.emoji}
                  </div>
                  <span className="text-5xl font-black text-white/5 select-none tabular-nums">{step.step}</span>
                </div>

                {/* Dot indicator */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`h-2 w-2 rounded-full ${step.dotColor} animate-pulse`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Step {idx + 1}</span>
                </div>

                <h3 className="text-lg font-extrabold text-white mb-3 leading-snug">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">
                  {step.desc}
                </p>

                {/* Bottom arrow */}
                {idx < 2 && (
                  <div className="md:hidden mt-6 flex justify-center">
                    <span className="text-slate-600 text-xl">↓</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Row */}
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/services')}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0f62c9] to-[#ff8a3d] px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-900/40 hover:opacity-95 transition active:scale-95"
            >
              🚀 Book a Service Now
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition"
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
              <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-2 border-orange-400 shadow-lg">
                <Image
                  src="/hero-user.jpg"
                  alt="Muzamil War - Founder and Operations Lead at QuickServices"
                  fill
                  className="object-cover object-top"
                />
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
