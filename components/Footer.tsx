'use client';

import Link from 'next/link';
import { Mail, MapPin, Phone, Wrench } from 'lucide-react';

const quickLinks = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Book Now', href: '/dashboard/booking' },
  { name: 'Highlights', href: '/offers' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Become a Provider', href: '/providers' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms', href: '/terms' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/8" style={{ background: '#080c12' }}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Top row: Brand + Links */}
        <div className="flex flex-col md:flex-row md:items-start gap-8">

          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0f62c9,#ff8a3d)]">
              <Wrench className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">QuickServices</p>
              <p className="text-[11px] text-slate-500">Reliable help at your doorstep</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 flex-1">
            {quickLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs text-slate-500 hover:text-white transition whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom divider + copyright */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-white/6 pt-5 text-[11px] text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-slate-500" />
              +91 9682645127
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-slate-500" />
              Quickservices@gmail.com
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-slate-500" />
              Handwara, Qalamabad
            </span>
          </div>
          <p className="text-slate-600">© 2026 QuickServices · Founded by Muzamil War</p>
        </div>

      </div>
    </footer>
  );
}
