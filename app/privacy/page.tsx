import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, FileText, Smartphone, Mail, MapPin } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy | QuickServices Kashmir',
  description:
    'Learn how QuickServices collects, uses, and safeguards your personal data, phone number, and live GPS location when ordering verified home services.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Breadcrumbs items={[{ name: 'Privacy Policy', href: '/privacy' }]} />

        {/* Header */}
        <div className="mt-6 rounded-3xl bg-white p-8 sm:p-10 shadow-sm border border-slate-200">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 mb-4">
            <ShieldCheck className="h-4 w-4" />
            Your Privacy & Data Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Last Updated: October 17, 2026 • Effective for all QuickServices users across Jammu & Kashmir
          </p>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            QuickServices (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy and personal data. This Privacy Policy outlines how we collect, store, process, and protect your information when you visit our website, register an account, book a home service specialist, or register as a service provider.
          </p>
        </div>

        {/* Content Sections */}
        <div className="mt-8 space-y-8">
          
          {/* Section 1 */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">1. Information We Collect</h2>
            </div>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>We collect information required to provide doorstep home services safely and reliably:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li><strong>Personal Identity:</strong> Your full name, email address, and 10-digit mobile phone number.</li>
                <li><strong>Service Address:</strong> Street address, city, district, and pincode where the service is requested.</li>
                <li><strong>Live Location & GPS:</strong> Real-time device coordinates during active bookings to provide accurate dispatch estimates and live radar tracking between customer and assigned technician.</li>
                <li><strong>Provider Profile Data:</strong> For service providers, we collect professional credentials, categories, hourly rates, service areas, and verification documents.</li>
                <li><strong>Technical Information:</strong> Browser type, IP address, device type, and session cookies for security and authentication.</li>
              </ul>
            </div>
          </div>

          {/* Section 2 */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Eye className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">2. How We Use Your Information</h2>
            </div>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>Your data is used strictly for legitimate operational purposes:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li>To dispatch verified specialists to your requested home address within our 30-minute target window.</li>
                <li>To send single-use OTP codes to authenticate bookings and prevent fraudulent service orders.</li>
                <li>To facilitate in-app live location updates during active service delivery.</li>
                <li>To provide customer support, dispute resolution, and booking status notifications via SMS and email.</li>
                <li>To comply with statutory legal requirements and maintain platform security.</li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">3. Data Security & Storage</h2>
            </div>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                We enforce industry-standard security safeguards to protect your personal information:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li><strong>Encryption:</strong> All network traffic is encrypted via HTTPS with TLS 1.3 protocol.</li>
                <li><strong>Password Protection:</strong> Passwords are cryptographically salted and hashed using bcrypt (12 rounds). Plaintext passwords are never stored.</li>
                <li><strong>Access Control:</strong> Only authorized platform administrators can view provider verification documentation.</li>
                <li><strong>No Third-Party Sale:</strong> We never sell, rent, or trade your personal information to third-party advertisers.</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <Smartphone className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">4. Cookies & Tracking Technologies</h2>
            </div>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                QuickServices uses essential session cookies and localStorage to keep you securely logged in, remember your user preferences, and maintain CSRF protection. We also use privacy-focused analytics to gauge page performance without logging identifiable personal data. You can manage or disable cookies via our Cookie Consent banner or your browser settings.
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Mail className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">5. Contact Our Privacy Office</h2>
            </div>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                If you have questions, feedback, or data deletion requests under applicable privacy laws, please contact our team:
              </p>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-2 text-slate-800 text-xs sm:text-sm">
                <p><strong>QuickServices Data Privacy Lead:</strong> Muzamil War</p>
                <p><strong>Email:</strong> <a href="mailto:Quickservices@gmail.com" className="text-blue-600 hover:underline">Quickservices@gmail.com</a></p>
                <p><strong>Helpline:</strong> <a href="tel:+919682645127" className="text-blue-600 hover:underline">+91 9682645127</a></p>
                <p><strong>Registered Operating Hub:</strong> Handwara Qalamabad Road, Kupwara, Jammu & Kashmir 193221</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-200">
          <Link href="/terms" className="font-semibold text-blue-600 hover:underline">
            Read Terms & Conditions →
          </Link>
          <p>© {new Date().getFullYear()} QuickServices. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}
