'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, BadgeCheck, HeartHandshake, ShieldCheck, Sparkles, Star, TimerReset } from 'lucide-react';

const highlights = [
  {
    icon: TimerReset,
    title: 'Fast booking',
    text: 'Quick request flow for services, profile, and booking updates.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified support',
    text: 'OTP-based verification for accounts and booking confirmations.',
  },
  {
    icon: BadgeCheck,
    title: 'Simple status tracking',
    text: 'See your active requests and completed bookings in one place.',
  },
  {
    icon: HeartHandshake,
    title: 'Local service help',
    text: 'Connect with trusted home service providers without extra hassle.',
  },
];

const featuredServices = [
  { title: 'Plumber', detail: 'Leak repair, tap fitting, drain cleaning', href: '/booking?service=plumber' },
  { title: 'Electrician', detail: 'Switchboard, wiring, fan and power fixes', href: '/booking?service=electrician' },
  { title: 'AC Technician', detail: 'Service, gas refill, installation support', href: '/booking?service=ac' },
  { title: 'Home Cleaner', detail: 'Deep cleaning, kitchen and bathroom care', href: '/booking?service=cleaner' },
  { title: 'Painter', detail: 'Interior and exterior painting work', href: '/booking?service=painter' },
  { title: 'Pest Control', detail: 'Cockroach, termite, and mosquito control', href: '/booking?service=pest' },
];

export default function OffersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[32px] bg-[linear-gradient(135deg,#0f172a,#1d4ed8,#f97316)] p-8 text-white shadow-2xl shadow-slate-200 md:p-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80">
              <Sparkles className="h-4 w-4 text-orange-200" />
              Service highlights
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">A fresh page for the services people use most</h1>
            <p className="mt-4 text-base leading-7 text-white/80">
              This page replaces the old offers layout with a clean service-focused view. It is made for quick browsing and direct booking.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-[28px] border border-black/5 bg-white/90 p-6 shadow-lg shadow-slate-100">
              <item.icon className="h-6 w-6 text-blue-700" />
              <h2 className="mt-4 text-xl font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-100 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Featured services</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">Choose a service and continue</h2>
            </div>
            <button
              onClick={() => router.push('/services')}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
            >
              View all services
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredServices.map((service) => (
              <button
                key={service.title}
                onClick={() => router.push(service.href)}
                className="rounded-[24px] border border-black/5 bg-slate-50 p-5 text-left transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{service.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{service.detail}</p>
                  </div>
                  <Star className="h-5 w-5 text-amber-500" />
                </div>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-700">
                  Book now
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
