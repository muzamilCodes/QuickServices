'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, BadgeCheck, Clock3, Headphones, ShieldCheck, Sparkles } from 'lucide-react';

const stats = [
  { label: 'Service categories', value: '38+' },
  { label: 'Average rating', value: '4.8' },
  { label: 'Booking flow', value: 'OTP' },
  { label: 'Support mode', value: 'Same-day' },
];

const values = [
  { icon: Clock3, title: 'Fast by default', text: 'The flow is built around quick service selection, short forms, and clear confirmation.' },
  { icon: ShieldCheck, title: 'Verified requests', text: 'OTP confirmation keeps bookings cleaner and helps reduce accidental requests.' },
  { icon: BadgeCheck, title: 'Clear pricing', text: 'Every service shows starting price, unit, details, and rating before the user books.' },
  { icon: Headphones, title: 'Simple follow-up', text: 'History keeps previous bookings easy to track and repeat when the same job comes back.' },
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-10 rounded-[32px] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-200 md:p-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80">
              <Sparkles className="h-4 w-4 text-orange-300" />
              About QuickServices
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              Local home services with a booking flow that stays simple.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              QuickServices helps customers book trusted local support for repairs, cleaning, care, moving, appliance work,
              and everyday home needs without repeated calls or unclear pricing.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => router.push('/services')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950"
              >
                Browse services
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.push('/contact')}
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white"
              >
                Contact support
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                <p className="text-3xl font-semibold">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {values.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-[26px] border border-black/5 bg-white/90 p-6 shadow-lg shadow-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
