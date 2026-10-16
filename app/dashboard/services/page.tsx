'use client';

import ServicesCatalog from '@/components/ServicesCatalog';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Sparkles, ShieldCheck, Clock3 } from 'lucide-react';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Catalog Header Banner */}
      <section className="bg-gradient-to-b from-blue-50/50 via-white to-slate-50 py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs items={[{ name: 'All Services', href: '/services' }]} />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pt-2">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                All Home & Maintenance Services
              </h1>
              <p className="text-sm text-slate-600 max-w-xl">
                Choose from verified plumbers, electricians, appliance technicians, and home cleaners across Kashmir with upfront pricing.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 rounded-2xl bg-white p-3 border border-slate-200 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold">OTP Verified Booking</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl bg-white p-3 border border-slate-200 shadow-sm">
                <Clock3 className="h-4 w-4 text-blue-600" />
                <span className="font-semibold">30-min Express Dispatch</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Handypal Style Filter & Service Cards Catalog */}
      <ServicesCatalog title="Reliable home repair and maintenance services" />
    </div>
  );
}
