import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ShieldAlert, CheckCircle2, IndianRupee, Ban, Scale, Mail } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Terms & Conditions | QuickServices Kashmir',
  description:
    'Review the official terms of service, customer responsibilities, service warranties, and provider standards for QuickServices platform.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Breadcrumbs items={[{ name: 'Terms of Service', href: '/terms' }]} />

        {/* Header */}
        <div className="mt-6 rounded-3xl bg-white p-8 sm:p-10 shadow-sm border border-slate-200">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 mb-4">
            <Scale className="h-4 w-4" />
            Terms of Service & User Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Last Updated: October 17, 2026 • Effective across Jammu & Kashmir
          </p>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            Welcome to QuickServices. By accessing or using our website, booking verified technicians, or registering as a service provider, you agree to comply with and be bound by the following terms and conditions.
          </p>
        </div>

        {/* Terms Sections */}
        <div className="mt-8 space-y-8">
          
          {/* Section 1 */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">1. Platform Services & Booking Rules</h2>
            </div>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                QuickServices operates an on-demand digital platform connecting residential and commercial customers with screened, independent tradesmen (plumbers, electricians, appliance technicians, cleaners, and carpenters).
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li><strong>OTP Verification:</strong> Every service booking must be confirmed using a valid single-use code to guarantee booking authenticity.</li>
                <li><strong>Arrival Estimates:</strong> Our target dispatch window is 30 minutes for urgent city repairs; however, exact transit times may vary depending on local weather, road closures, and traffic conditions.</li>
                <li><strong>Inspection & Estimates:</strong> A base inspection visit fee applies for diagnostic calls. If parts or complex replacements are needed, the specialist must present an upfront estimate prior to commencing work.</li>
              </ul>
            </div>
          </div>

          {/* Section 2 */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <IndianRupee className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">2. Pricing, Payments & Invoicing</h2>
            </div>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li>All rates displayed in the QuickServices catalog are inclusive of standard local taxes.</li>
                <li>Payments can be made directly upon service completion via Cash, UPI, or in-app payment methods.</li>
                <li>Any promotional discount or loyalty coupon must be applied at the time of booking checkout and cannot be applied retroactively after work completion.</li>
                <li>Customers are entitled to an itemized digital booking summary available in their account dashboard.</li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">3. Service Provider Obligations</h2>
            </div>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>Registered Service Providers (Pros) agree to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li>Undergo mandatory identity verification and Admin profile review before receiving customer requests.</li>
                <li>Maintain punctual attendance, respectful customer communication, and professional safety standards.</li>
                <li>Keep GPS location enabled during active transit to provide transparent arrival tracking to the waiting customer.</li>
                <li>Honor the agreed-upon rates without imposing arbitrary post-service surcharges.</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Ban className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">4. Cancellations & Re-scheduling</h2>
            </div>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                Customers can cancel or reschedule an order at zero cost before a specialist has departed. If cancellation occurs after the technician is already on-the-way, a nominal travel compensation fee may be applied to support the specialist.
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Mail className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">5. Dispute Resolution & Support</h2>
            </div>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                In the rare event of service dissatisfaction, property damage, or billing disputes, customers must notify our resolution desk within 48 hours via our contact helpline (+91 9682645127) or email (Quickservices@gmail.com). QuickServices will arrange a complimentary inspection visit or corrective service.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-200">
          <Link href="/privacy" className="font-semibold text-blue-600 hover:underline">
            ← Read Privacy Policy
          </Link>
          <p>© {new Date().getFullYear()} QuickServices. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}
