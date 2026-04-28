'use client';

import Link from 'next/link';
import { Headphones, Mail, MapPin, Phone, ShieldCheck, TimerReset, Wrench } from 'lucide-react';

const footerGroups = [
  {
    title: 'Explore',
    links: [
      { name: 'Home', href: '/' },
      { name: 'Services', href: '/services' },
      { name: 'Bookings', href: '/history' },
      { name: 'Profile', href: '/profile' },
    ],
  },
  {
    title: 'Top Services',
    links: [
      { name: 'Plumber', href: '/booking?service=plumber' },
      { name: 'Electrician', href: '/booking?service=electrician' },
      { name: 'Driver', href: '/booking?service=driver' },
      { name: 'Cleaner', href: '/booking?service=cleaner' },
    ],
  },
];

const trustPoints = [
  { icon: TimerReset, text: 'Fast dispatch across major cities' },
  { icon: ShieldCheck, text: 'Verified professionals and OTP confirmation' },
  { icon: Headphones, text: 'Real support before and after the booking' },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/5 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f62c9,#ff8a3d)]">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold">QuickServices</p>
                <p className="text-sm text-slate-400">Reliable help at your doorstep</p>
              </div>
            </div>

            <p className="max-w-md text-sm leading-6 text-slate-400">
              Book everyday services without the usual phone-tag. Choose the job, confirm the details,
              verify the OTP, and track the request in one place.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              {trustPoints.map(({ icon: Icon, text }) => (
                <div key={text} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <Icon className="mb-3 h-5 w-5 text-orange-300" />
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">{group.title}</h3>
              <div className="space-y-3">
                {group.links.map((link) => (
                  <Link key={link.name} href={link.href} className="block text-sm text-slate-400 transition hover:text-white">
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
            <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> +91 12345 67890</span>
            <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> support@quickservices.com</span>
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> India</span>
          </div>
          <p>© 2026 QuickServices. Built for easier local bookings.</p>
        </div>
      </div>
    </footer>
  );
}
