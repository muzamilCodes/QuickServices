'use client';

import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Headphones,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  CheckCircle2,
  Zap,
} from 'lucide-react';

const stats = [
  { label: 'Service Categories', value: '38+', icon: Zap, color: 'text-blue-600' },
  { label: 'Average Rating', value: '4.8★', icon: Star, color: 'text-amber-500' },
  { label: 'Booking Verified', value: 'OTP', icon: ShieldCheck, color: 'text-green-600' },
  { label: 'Support Mode', value: 'Same-Day', icon: Clock3, color: 'text-orange-500' },
];

const values = [
  {
    icon: Clock3,
    title: 'Fast by Default',
    text: 'Built around quick service selection, short forms, and instant confirmation.',
    color: 'bg-blue-50 text-blue-700',
  },
  {
    icon: ShieldCheck,
    title: 'OTP Verified',
    text: 'OTP confirmation keeps bookings secure and reduces accidental requests.',
    color: 'bg-green-50 text-green-700',
  },
  {
    icon: BadgeCheck,
    title: 'Transparent Pricing',
    text: 'Every service shows starting price, unit, and rating before you book.',
    color: 'bg-purple-50 text-purple-700',
  },
  {
    icon: Headphones,
    title: 'Easy Follow-up',
    text: 'History keeps previous bookings easy to track and repeat when needed.',
    color: 'bg-orange-50 text-orange-600',
  },
];

const timeline = [
  { year: '2023', title: 'Founded in Handwara', desc: 'QuickServices started with just 5 services and a vision to serve local Kashmir households.' },
  { year: '2024', title: 'Expanded to 38+ Services', desc: 'Grew our provider network across Kupwara, Sopore, and surrounding areas of J&K.' },
  { year: '2025', title: 'OTP Verification Launch', desc: 'Introduced secure OTP-based bookings to protect every customer and provider.' },
  { year: '2026', title: 'Going Digital-First', desc: 'Full platform launch with real-time tracking, reviews, and dashboard management.' },
];

const teamValues = [
  'Local community first',
  'Transparent pricing always',
  'Verified providers only',
  'Privacy of every user protected',
  'Responsive same-day support',
  'Continuous service improvement',
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Breadcrumb ── */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ name: 'About Us', href: '/about' }]} />
      </div>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm text-orange-300 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                About QuickServices
              </div>
              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Doorstep Services,{' '}
                <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                  Kashmir&apos;s Way
                </span>
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-300 sm:text-lg">
                QuickServices helps customers book trusted local support for repairs, cleaning, care, moving, appliance work, and everyday home needs — without repeated calls or unclear pricing.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => router.push('/services')}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
                >
                  Browse Services
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => router.push('/contact')}
                  className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-medium text-white/90 backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10"
                >
                  Contact Support
                </button>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:bg-white/10"
                >
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  <p className="mt-3 text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Story / Timeline ── */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">Our Journey</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">How QuickServices Grew</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">From a small idea in Handwara to a trusted platform serving families across Kashmir.</p>
          </div>
          <div className="relative">
            <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-blue-600 to-orange-500 md:left-1/2 md:-translate-x-px" />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <div key={item.year} className={`relative flex gap-6 md:gap-10 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="flex flex-col items-center md:w-1/2 md:items-end">
                    {i % 2 === 0 ? (
                      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:ml-auto md:max-w-sm">
                        <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{item.year}</span>
                        <h3 className="mt-3 text-lg font-bold text-slate-900">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
                      </div>
                    ) : null}
                  </div>
                  <div className="relative mt-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-white bg-blue-700 shadow-md md:absolute md:left-1/2 md:mt-0 md:-translate-x-1/2">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                  <div className="flex flex-col md:w-1/2">
                    {i % 2 !== 0 ? (
                      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:max-w-sm">
                        <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">{item.year}</span>
                        <h3 className="mt-3 text-lg font-bold text-slate-900">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Our Values</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">What Drives Us</h2>
            <p className="mt-3 text-slate-500">The principles behind every booking, every provider, every interaction.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {values.map(({ icon: Icon, title, text, color }) => (
              <div key={title} className="group rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team Values + Offer CTA ── */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Our Commitments</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                Built on trust,{' '}
                <span className="text-orange-400">delivered with care</span>
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Our team is rooted in the same community we serve — Handwara, Kashmir. We understand local needs and build every feature with that in mind.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => router.push('/offers')}
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
                >
                  See Offers
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => router.push('/contact?topic=Offer%20proposal')}
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/90 transition hover:border-white/40 hover:bg-white/10"
                >
                  Propose an Offer
                </button>
              </div>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {teamValues.map((v) => (
                <li key={v} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                  {v}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Founder / Contact Info ── */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Address */}
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900">Our Office</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">QuickServices Kashmir</p>
                <p>Handwara Qalamabad</p>
                <p>Kupwara District, Jammu &amp; Kashmir — 193221</p>
                <div className="mt-4 flex flex-col gap-2">
                  <a href="tel:+919682645127" className="inline-flex items-center gap-2 font-medium text-blue-700 hover:underline">
                    <Phone className="h-4 w-4" />
                    +91 96826 45127
                  </a>
                  <a href="mailto:Quickservices114@gmail.com" className="inline-flex items-center gap-2 font-medium text-blue-700 hover:underline">
                    <Mail className="h-4 w-4" />
                    Quickservices114@gmail.com
                  </a>
                </div>
                <p className="mt-2 text-slate-400">Mon–Sat · 09:00 AM – 06:00 PM</p>
              </div>
            </div>

            {/* Map */}
            <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm">
              <iframe
                title="QuickServices location"
                src="https://maps.google.com/maps?q=Handwara+Qalamabad&output=embed"
                className="h-full min-h-[300px] w-full"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Handwara+Qalamabad"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline"
            >
              Open in Google Maps
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Founder card ── */}
      <section className="bg-slate-50 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-700 to-indigo-800 text-3xl font-bold text-white">
                W
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Founder &amp; CEO</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">War Muzamil</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Passionate about building technology that solves real problems for people in Kashmir. QuickServices is a vision to digitize doorstep home services across Jammu &amp; Kashmir.
                </p>
              </div>
              <div className="sm:ml-auto">
                <button
                  onClick={() => router.push('/contact')}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
                >
                  <Users className="h-4 w-4" />
                  Get in touch
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
