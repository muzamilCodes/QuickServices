'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, BadgeCheck, ClipboardList, Crown, Sparkles, ShieldCheck, TimerReset } from 'lucide-react';

const benefits = [
  { icon: TimerReset, title: 'Fast booking flow', text: 'Pick a service, confirm details, and submit your request in a few clicks.' },
  { icon: ShieldCheck, title: 'Verified support', text: 'OTP verification and account checks keep the booking flow safer.' },
  { icon: ClipboardList, title: 'Clear request tracking', text: 'See your bookings, status updates, and details from one place.' },
  { icon: BadgeCheck, title: 'Trusted service details', text: 'Each service page shows pricing, highlights, and quick booking access.' },
  { icon: Sparkles, title: 'Special savings', text: 'Public deals and seasonal offers are shown in a simple, separate page.' },
  { icon: Crown, title: 'Premium experience', text: 'A clean, simple page focused on what matters after login.' },
];

export default function BenefitsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[32px] bg-[linear-gradient(135deg,#0f172a,#1d4ed8,#f97316)] p-8 text-white shadow-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">Why QuickServices</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">Everything that makes booking easier, in one clean page</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/80">
            This page is separate from offers. It explains the value of the platform in English and keeps the experience simple for logged-in users and guests.
          </p>
          <button
            onClick={() => router.push('/services')}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
          >
            Browse services
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {benefits.map((item) => (
            <div key={item.title} className="rounded-[28px] border border-black/5 bg-white/90 p-6 shadow-lg shadow-slate-100">
              <item.icon className="h-6 w-6 text-blue-700" />
              <h2 className="mt-4 text-xl font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
