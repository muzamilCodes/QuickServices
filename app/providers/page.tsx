'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Clock3, IndianRupee, ShieldCheck } from 'lucide-react';

const steps = [
  { title: 'Create your profile', text: 'Share your name, contact, city, services, and work experience.' },
  { title: 'Get verified', text: 'Admin approval keeps the marketplace cleaner for both customers and providers.' },
  { title: 'Receive bookings', text: 'Accept service requests and keep work organized around customer needs.' },
];

const benefits = [
  { icon: IndianRupee, title: 'More local jobs', text: 'Show up where customers already search for home service support.' },
  { icon: Clock3, title: 'Flexible schedule', text: 'Work across visits, hourly requests, daily jobs, or fixed service tasks.' },
  { icon: ShieldCheck, title: 'Cleaner requests', text: 'OTP-confirmed bookings reduce incomplete and accidental requests.' },
  { icon: BadgeCheck, title: 'Trusted profile', text: 'Build credibility with service category, availability, and approval status.' },
];

export default function ProvidersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-10 rounded-[32px] bg-white/90 p-8 shadow-2xl shadow-slate-100 md:p-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm text-white">
              <BriefcaseBusiness className="h-4 w-4 text-orange-300" />
              Become a provider
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              Join QuickServices and get discovered by nearby customers.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Providers can offer repair, cleaning, moving, care, tutoring, installation, and everyday home support services.
              This page gives the business side of the website a clear destination.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => router.push('/register')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-700 px-6 py-3 text-sm font-medium text-white"
              >
                Start provider signup
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.push('/contact')}
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700"
              >
                Talk to support
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-4 rounded-[24px] border border-black/5 bg-slate-50 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white font-semibold text-slate-950 shadow-sm">
                  {index + 1}
                </div>
                <div>
                  <h2 className="font-semibold text-slate-950">{step.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-[26px] border border-black/5 bg-white/90 p-6 shadow-lg shadow-slate-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
