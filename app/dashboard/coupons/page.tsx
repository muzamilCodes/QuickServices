'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Tag,
  Copy,
  Check,
  Sparkles,
  ArrowLeft,
  Percent,
  Gift,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';

const COUPONS = [
  {
    code: 'SAVE100',
    discount: '₹100 Flat OFF',
    desc: 'Valid on all doorstep repair and maintenance services across Kashmir.',
    minOrder: '₹399',
    expiry: '31 Dec 2026',
    tag: 'POPULAR'
  },
  {
    code: 'KASHMIR50',
    discount: '15% OFF (Up to ₹150)',
    desc: 'Exclusive discount for Handwara, Baramulla, Kupwara, and Srinagar residents.',
    minOrder: '₹499',
    expiry: '31 Dec 2026',
    tag: 'LOCAL FIRST'
  },
  {
    code: 'QUICKFIRST',
    discount: '₹50 OFF',
    desc: 'Welcome voucher for your first verified home booking.',
    minOrder: '₹299',
    expiry: 'No Expiry',
    tag: 'NEW USER'
  }
];

export default function CouponsPage() {
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 flex items-center gap-2.5">
          <Tag className="h-7 w-7 text-amber-500" /> Coupons & Offers
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Apply these verified discount codes at checkout to save on home repairs and technician visits.
        </p>
      </div>

      {/* Featured Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-md">
            <Gift className="h-3.5 w-3.5" /> Special Promotion
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-black">Save More with QuickServices</h2>
          <p className="mt-1 text-xs sm:text-sm text-blue-200 max-w-md">
            Get instant savings on verified plumbers, electricians, carpenters, and appliance experts.
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/20 text-center shrink-0">
          <p className="text-xs font-semibold text-blue-200">Use Promo Code</p>
          <p className="text-2xl font-black text-amber-300 tracking-widest mt-0.5">SAVE100</p>
          <button
            onClick={() => handleCopy('SAVE100')}
            className="mt-3 w-full rounded-xl bg-amber-400 py-2 px-4 text-xs font-extrabold text-slate-950 hover:bg-amber-300 transition"
          >
            {copiedCode === 'SAVE100' ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>

      {/* Available Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {COUPONS.map((c) => (
          <div
            key={c.code}
            className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-blue-700 uppercase tracking-wide">
                  {c.tag}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">Min. {c.minOrder}</span>
              </div>

              <h3 className="mt-3 text-lg font-black text-slate-900">{c.discount}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{c.desc}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="block text-[10px] text-slate-400 font-semibold uppercase">Coupon Code</span>
                <span className="font-mono font-extrabold text-sm text-blue-600 tracking-wider">{c.code}</span>
              </div>

              <button
                onClick={() => handleCopy(c.code)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  copiedCode === c.code
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {copiedCode === c.code ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
