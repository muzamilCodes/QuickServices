'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, X } from 'lucide-react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('quickservices_cookie_consent');
      if (!consent) {
        // Small delay so it doesn't pop up instantly on first paint
        const timer = setTimeout(() => setShowBanner(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore in environments without localStorage
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('quickservices_cookie_consent', 'accepted');
    } catch {}
    setShowBanner(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem('quickservices_cookie_consent', 'essential_only');
    } catch {}
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      role="region"
      aria-label="Cookie Consent Banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-2xl shadow-slate-900/15 backdrop-blur-md">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0f62c9] to-[#ff8a3d] text-white shadow-md shadow-blue-500/20">
            <Cookie className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                Cookie Preferences
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </h3>
              <button
                onClick={handleEssentialOnly}
                aria-label="Dismiss cookie notice"
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              We use essential cookies and anonymous analytics to provide fast service booking, live GPS technician radar, and secure OTP logins. Read our{' '}
              <Link href="/privacy" className="font-semibold text-blue-600 hover:underline">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            onClick={handleEssentialOnly}
            className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Essential Only
          </button>
          <button
            onClick={handleAccept}
            className="rounded-full bg-slate-950 px-5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
