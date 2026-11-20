'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Star,
  TimerReset,
  Zap,
  Tag,
  Gift,
  Clock,
  CheckCircle2,
} from 'lucide-react';

const highlights = [
  {
    icon: TimerReset,
    title: 'Fast Booking',
    text: 'Book any service in under 2 minutes with our quick request flow.',
    color: 'bg-blue-50 text-blue-700',
  },
  {
    icon: ShieldCheck,
    title: 'OTP Verified',
    text: 'Every booking is secured with OTP verification for your safety.',
    color: 'bg-green-50 text-green-700',
  },
  {
    icon: BadgeCheck,
    title: 'Status Tracking',
    text: 'Track all your active and completed bookings from one dashboard.',
    color: 'bg-purple-50 text-purple-700',
  },
  {
    icon: HeartHandshake,
    title: 'Local Experts',
    text: 'Connect with trusted local home service providers near you.',
    color: 'bg-orange-50 text-orange-600',
  },
];

const featuredServices = [
  {
    emoji: '🔧',
    title: 'Plumber',
    detail: 'Leak repair, tap fitting, drain cleaning',
    badge: 'Most Booked',
    badgeColor: 'bg-blue-100 text-blue-700',
    href: '/booking?service=plumber',
  },
  {
    emoji: '⚡',
    title: 'Electrician',
    detail: 'Switchboard, wiring, fan and power fixes',
    badge: 'Popular',
    badgeColor: 'bg-yellow-100 text-yellow-700',
    href: '/booking?service=electrician',
  },
  {
    emoji: '❄️',
    title: 'AC Technician',
    detail: 'Service, gas refill, installation support',
    badge: 'Top Rated',
    badgeColor: 'bg-cyan-100 text-cyan-700',
    href: '/booking?service=ac',
  },
  {
    emoji: '🧹',
    title: 'Home Cleaner',
    detail: 'Deep cleaning, kitchen and bathroom care',
    badge: 'New',
    badgeColor: 'bg-green-100 text-green-700',
    href: '/booking?service=cleaner',
  },
  {
    emoji: '🎨',
    title: 'Painter',
    detail: 'Interior and exterior painting work',
    badge: 'Trending',
    badgeColor: 'bg-pink-100 text-pink-700',
    href: '/booking?service=painter',
  },
  {
    emoji: '🐛',
    title: 'Pest Control',
    detail: 'Cockroach, termite, and mosquito control',
    badge: 'Reliable',
    badgeColor: 'bg-orange-100 text-orange-700',
    href: '/booking?service=pest',
  },
];

const promoCards = [
  {
    icon: Gift,
    title: 'First Booking Free',
    desc: 'New users get a free home assessment on their first booking.',
    tag: 'New Users',
    tagColor: 'bg-green-500',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    icon: Zap,
    title: 'Same-Day Service',
    desc: 'Book before 11 AM and get service delivered the same day.',
    tag: 'Limited Slots',
    tagColor: 'bg-orange-500',
    gradient: 'from-orange-500 to-amber-600',
  },
  {
    icon: Tag,
    title: 'Refer & Earn',
    desc: 'Refer a friend and both of you get a discount on the next booking.',
    tag: 'Always On',
    tagColor: 'bg-blue-500',
    gradient: 'from-blue-600 to-indigo-700',
  },
];

const whyUs = [
  'No hidden charges or last-minute fees',
  'Verified providers with background checks',
  'Transparent pricing before you confirm',
  'Easy cancellation up to 1 hour before service',
  'Dedicated support team for every booking',
  'Service available across all of Kashmir',
];

export default function OffersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4 py-20 text-white sm:px-6 lg:px-8">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm text-orange-300 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Service Offers &amp; Highlights
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Best Services in{' '}
            <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
              Kashmir
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Discover trusted home services, exclusive deals, and special offers — all verified and available at your doorstep in Handwara &amp; surrounding areas.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => router.push('/services')}
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
            >
              Browse All Services
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => router.push('/contact?topic=Offer%20proposal')}
              className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-medium text-white/90 backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10"
            >
              Propose an Offer
            </button>
          </div>
        </div>
      </section>

      {/* ── Promo Cards ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">Current Promotions</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Special Offers for You</h2>
            <p className="mt-3 text-slate-500">Exclusive deals available for QuickServices users in Kashmir</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {promoCards.map((card) => (
              <div
                key={card.title}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${card.gradient} p-7 text-white shadow-xl`}
              >
                <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
                <div className="absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-white/5" />
                <span className={`relative inline-block rounded-full ${card.tagColor} px-3 py-1 text-xs font-semibold text-white`}>
                  {card.tag}
                </span>
                <div className="relative mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="relative mt-4 text-xl font-bold">{card.title}</h3>
                <p className="relative mt-2 text-sm leading-6 text-white/80">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Highlights ── */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">Why QuickServices</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Built for Local Kashmir Needs</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="group rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Services ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">Our Services</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Most Booked Services</h2>
              <p className="mt-2 text-slate-500">Tap a service to book directly — delivery at your doorstep.</p>
            </div>
            <button
              onClick={() => router.push('/services')}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              View all services
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredServices.map((service) => (
              <button
                key={service.title}
                onClick={() => router.push(service.href)}
                className="group relative rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-4xl">{service.emoji}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${service.badgeColor}`}>
                    {service.badge}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">{service.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">{service.detail}</p>
                <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-blue-700">
                  Book now
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Us List ── */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Our Promise</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                Every booking backed by our{' '}
                <span className="text-orange-400">quality guarantee</span>
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-300">
                We work only with verified, trained local providers so you always get reliable service with no surprises.
              </p>
              <button
                onClick={() => router.push('/contact')}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
              >
                Contact Support
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {whyUs.map((point) => (
                <li key={point} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Rating Strip ── */}
      <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-slate-100 bg-slate-50 p-8 shadow-sm sm:flex-row">
            <div className="text-center sm:text-left">
              <p className="text-3xl font-bold text-slate-900">4.8 ★</p>
              <p className="mt-1 text-sm text-slate-500">Average customer rating across all services</p>
            </div>
            <div className="h-px w-full bg-slate-200 sm:h-12 sm:w-px" />
            <div className="text-center sm:text-left">
              <p className="text-3xl font-bold text-slate-900">38+</p>
              <p className="mt-1 text-sm text-slate-500">Service categories available</p>
            </div>
            <div className="h-px w-full bg-slate-200 sm:h-12 sm:w-px" />
            <div className="text-center sm:text-left">
              <p className="text-3xl font-bold text-slate-900">OTP</p>
              <p className="mt-1 text-sm text-slate-500">Verified bookings for your security</p>
            </div>
            <div className="h-px w-full bg-slate-200 sm:h-12 sm:w-px hidden sm:block" />
            <button
              onClick={() => router.push('/services')}
              className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              Book a Service
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
