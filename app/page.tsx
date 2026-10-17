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
    <div className="overflow-hidden bg-white">
      
      {/* =========================================================================
          HERO SECTION (ORIGINAL WARM BRAND PALETTE + USER'S OWN PHOTO)
      ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-slate-50/60 pb-16 pt-8 sm:pb-24 sm:pt-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(21,101,192,0.18),transparent_28%),radial-gradient(circle_at_78%_16%,rgba(255,138,61,0.22),transparent_24%)] pointer-events-none" />
        
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          
          {/* Left Hero Column */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/90 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-orange-500" />
              Trusted help for everyday home & office services
            </div>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl lg:text-6xl tracking-tight">
              Professional service bookings with a{' '}
              <span className="bg-gradient-to-r from-[#0f62c9] to-[#ff8a3d] bg-clip-text text-transparent">
                calmer, faster flow.
              </span>
            </h1>

            <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 mx-auto lg:mx-0">
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white/90 px-6 py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-400 active:scale-95"
                >
                  <span>Explore 16+ Categories</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              <p className="text-xs text-slate-500 font-medium text-center lg:text-left">
                ⚡ No advance payment required • Verified specialists • Same-day doorstep support
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs sm:text-sm font-medium text-slate-600">
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

              <div className="relative overflow-hidden rounded-[32px] border-4 border-white bg-white shadow-2xl shadow-slate-300/60">
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
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 p-3.5 shadow-xl backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-950">Muzamil War</p>
                          <p className="text-[10px] text-slate-500 font-medium">Verified Services Lead</p>
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
        <ServicesCatalog title="Reliable home repair and maintenance services" />
      </div>

      {/* =========================================================================
          SECTION 3: THREE EASY STEPS WORKFLOW
      ========================================================================= */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="mx-auto max-w-7xl">
          <div className="text-center space-y-2 mb-12">
            <p className="text-xs font-extrabold uppercase tracking-widest text-orange-600">
              HOW IT WORKS
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Book your service in 3 simple steps
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { count: '1', title: 'Choose your service', desc: 'Pick from 20+ verified home repair, cleaning and maintenance categories with clear prices.' },
              { count: '2', title: 'Share your location', desc: 'Enter your doorstep address, preferred date and time, and brief description of the job.' },
              { count: '3', title: 'Verify OTP & Track live', desc: 'Confirm your booking via inbox OTP, get assigned technician phone number, and track live.' },
            ].map((step) => (
              <div key={step.count} className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-8 text-center space-y-4 hover:shadow-lg transition">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f62c9,#ff8a3d)] text-xl font-black text-white shadow-md">
                  {step.count}
                </div>
                <h3 className="font-extrabold text-lg text-slate-900">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: TRUST SIGNALS
      ========================================================================= */}
      <section className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="mx-auto max-w-7xl grid gap-8 md:grid-cols-3">
          {trustSignals.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0f62c9]">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-950">{title}</h3>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: "PEOPLE ALSO ASK" (FAQ ACCORDION & TOPIC CLUSTER)
      ========================================================================= */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-100" id="faqs" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-4xl">
          <div className="text-center space-y-2 mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
              <HelpCircle className="h-3.5 w-3.5" />
              PEOPLE ALSO ASK
            </div>
            <h2 id="faq-heading" className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600">
              Immediate answers to common queries regarding doorstep technicians, pricing, and bookings in Kashmir.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-slate-200/90 bg-slate-50/60 overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left font-bold text-slate-900 transition hover:bg-slate-100/70"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg pr-4">{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-orange-600' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm sm:text-base leading-relaxed text-slate-700 border-t border-slate-200/60 bg-white">
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
