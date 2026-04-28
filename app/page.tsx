'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, CircleCheckBig, Clock3, ShieldCheck, Sparkles, Star, Wrench } from 'lucide-react';

const featuredServices = [
  { id: 'plumber', name: 'Plumber', icon: '🔧', description: 'Leaks, fittings, blocked drains and urgent fixes.', price: 'Starts at ₹499' },
  { id: 'electrician', name: 'Electrician', icon: '⚡', description: 'Wiring, switchboards, fans, lights and repairs.', price: 'Starts at ₹499' },
  { id: 'driver', name: 'Driver', icon: '🚗', description: 'City rides, pickups, drops and event support.', price: 'Starts at ₹399/hr' },
  { id: 'cleaner', name: 'Cleaner', icon: '🧹', description: 'Routine, deep, move-in and office cleaning.', price: 'Starts at ₹399' },
];

const trustSignals = [
  { icon: Clock3, title: 'Quick dispatch', description: 'Fast confirmations with a booking flow built for same-day help.' },
  { icon: ShieldCheck, title: 'Verified pros', description: 'Trusted workers, OTP confirmation, and a cleaner booking record.' },
  { icon: CircleCheckBig, title: 'Simple follow-up', description: 'Track, rebook, and review your requests from one place.' },
];

export default function HomePage() {
  const router = useRouter();

  const startBooking = (serviceId?: string) => {
    router.push(serviceId ? `/booking?service=${serviceId}` : '/services');
  };

  return (
    <div className="overflow-hidden">
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(21,101,192,0.18),transparent_28%),radial-gradient(circle_at_78%_16%,rgba(255,138,61,0.22),transparent_24%)]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-orange-500" />
              Trusted help for everyday home services
            </div>

            <h1 className="mt-6 max-w-3xl text-5xl font-semibold leading-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Professional service bookings with a calmer, faster flow.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              QuickServices helps you book plumbers, electricians, drivers, cleaners and more without the messy
              back-and-forth. Pick a service, add your address, confirm the OTP, and keep the history in one account.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => router.push('/services')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-800"
              >
                Browse services
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.push('/register')}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/75 px-6 py-3 text-base font-medium text-slate-700 transition hover:border-slate-500 hover:bg-white"
              >
                Create account
              </button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 fill-current text-orange-400" /> 4.8 average rating</span>
              <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-blue-600" /> Same-day response</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> OTP-secured booking</span>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/60 bg-white/70 p-5 shadow-2xl shadow-slate-200/80 backdrop-blur">
            <div className="rounded-[24px] bg-slate-950 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Today&apos;s flow</p>
                  <h2 className="mt-2 text-2xl font-semibold">Book in three steady steps</h2>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <Wrench className="h-5 w-5 text-orange-300" />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  ['1', 'Choose your service', 'Pick from trusted everyday categories with upfront starting prices.'],
                  ['2', 'Add the job details', 'Tell us the address, city, issue, and phone number once.'],
                  ['3', 'Confirm with OTP', 'Verify the request and track it again later in booking history.'],
                ].map(([count, title, description]) => (
                  <div key={count} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950">
                      {count}
                    </div>
                    <div>
                      <h3 className="font-medium">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Popular picks</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">Services people book the most</h2>
          </div>
          <button
            onClick={() => router.push('/services')}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-700"
          >
            View full catalog
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredServices.map((service) => (
            <button
              key={service.id}
              onClick={() => startBooking(service.id)}
              className="rounded-[24px] border border-black/5 bg-white/85 p-6 text-left shadow-lg shadow-slate-100 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#e8f2ff,#fff1e6)] text-3xl">
                {service.icon}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-950">{service.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">{service.price}</span>
                <span className="text-sm font-medium text-blue-700">Book now</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section id="features" className="bg-white/75">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Why it feels better</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">A booking experience that stays clear all the way through.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              The project already had the core pieces. This version pulls them into a more complete user flow with clearer navigation,
              actual route coverage, and pages that feel connected instead of stitched together.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {trustSignals.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-[24px] border border-black/5 bg-slate-50 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
