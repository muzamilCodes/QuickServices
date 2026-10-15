'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowRight, 
  CircleCheckBig, 
  Clock3, 
  ShieldCheck, 
  Sparkles, 
  Star 
} from 'lucide-react';
import ServicesCatalog from '@/components/ServicesCatalog';

const trustSignals = [
  { icon: Clock3, title: 'Quick dispatch', description: 'Fast confirmations with a booking flow built for same-day local help.' },
  { icon: ShieldCheck, title: 'Verified pros', description: 'Trusted specialists, OTP confirmation, and a clean booking record.' },
  { icon: CircleCheckBig, title: 'Simple follow-up', description: 'Live tracking on radar, rebooking, and direct specialist phone call.' },
];

export default function HomePage() {
  const router = useRouter();

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

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={() => {
                  const element = document.getElementById('catalog-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 active:scale-95"
              >
                Browse all services
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.push('/services')}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-400 active:scale-95"
              >
                Book a Specialist
              </button>
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
          SECTION 2: HANDYPAL SERVICE CATALOG & FILTERS (SCREENSHOT 2 LAYOUT)
      ========================================================================= */}
      <div id="catalog-section">
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

    </div>
  );
}
