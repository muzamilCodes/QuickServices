'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, BadgePercent, Clock3, Sparkles, Star, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface Offer {
  _id: string;
  title: string;
  code: string;
  text: string;
  discount: number;
  discountType: string;
  service: string;
  href: string;
  isActive: boolean;
  expiryDate: string | null;
}

const defaultOffers: Offer[] = [
  { _id: '1', title: 'First Booking Saver', code: 'QUICK100', text: 'Get ₹100 off on your first confirmed service booking.', discount: 100, discountType: 'fixed', service: 'Any service', href: '/services', isActive: true, expiryDate: null },
  { _id: '2', title: 'Deep Cleaning Combo', code: 'CLEAN15', text: 'Save 15% when you book bathroom and kitchen cleaning together.', discount: 15, discountType: 'percent', service: 'Cleaning', href: '/booking?service=cleaner', isActive: true, expiryDate: null },
  { _id: '3', title: 'AC Service Deal', code: 'COOL10', text: 'Flat 10% off on AC service, gas check, and installation visits.', discount: 10, discountType: 'percent', service: 'AC', href: '/booking?service=ac', isActive: true, expiryDate: null },
  { _id: '4', title: 'Moving Day Support', code: 'MOVE200', text: 'Get ₹200 off on local house shifting and packing support.', discount: 200, discountType: 'fixed', service: 'Mover', href: '/booking?service=moving', isActive: true, expiryDate: null },
  { _id: '5', title: 'Care Visit Offer', code: 'CARE50', text: 'Save on elder care, nurse visit, or babysitter hourly bookings.', discount: 50, discountType: 'fixed', service: 'Care services', href: '/booking?service=eldercare', isActive: true, expiryDate: null },
  { _id: '6', title: 'Device Repair Pack', code: 'FIX75', text: 'Use on computer, TV, WiFi, appliance, or water purifier repair.', discount: 75, discountType: 'fixed', service: 'Repairs', href: '/booking?service=computer', isActive: true, expiryDate: null },
];

export default function OffersPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoyalCustomer, setIsLoyalCustomer] = useState(false);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch(`${API_URL}/public/offers`);
        const data = await res.json();
        if (data.success && data.offers?.length > 0) {
          const activeOffers = data.offers.filter((o: Offer) => {
            if (!o.isActive) return false;
            if (o.expiryDate && new Date(o.expiryDate) < new Date()) return false;
            return true;
          });
          setOffers(activeOffers);
        } else {
          setOffers(defaultOffers);
        }
      } catch {
        setOffers(defaultOffers);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [API_URL]);

  useEffect(() => {
    const fetchLoyaltyStatus = async () => {
      if (!isAuthenticated) {
        setIsLoyalCustomer(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/loyalty/status/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        if (data.success && data.stats?.totalCompletedBookings >= 5) {
          setIsLoyalCustomer(true);
        } else {
          setIsLoyalCustomer(false);
        }
      } catch {
        setIsLoyalCustomer(false);
      }
    };

    if (!authLoading) {
      void fetchLoyaltyStatus();
    }
  }, [API_URL, authLoading, isAuthenticated]);

  if (loading) return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[32px] bg-[linear-gradient(135deg,#0f172a,#0f766e,#f97316)] p-8 text-white shadow-2xl shadow-slate-200 md:p-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80">
              <BadgePercent className="h-4 w-4 text-orange-200" />
              Service offers
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">Useful savings for the jobs people book most.</h1>
            <p className="mt-4 text-base leading-7 text-white/80">
              Pick an offer, jump to booking, and mention the code in your request description while confirming the service.
            </p>
          </div>
        </section>

        {isAuthenticated && !authLoading && !isLoyalCustomer && (
          <section className="mt-10 rounded-[28px] border border-slate-300 bg-slate-50 p-6 shadow-sm shadow-slate-200">
            <h2 className="text-4xl font-bold text-slate-950">Loyalty reward in progress</h2>
            <p className="mt-4 text-lg leading-8 text-slate-700">
              You have not completed 5 bookings yet. The special 50% loyalty offer is not bookable until you finish 5 confirmed bookings.
            </p>
            <p className="mt-3 text-base text-slate-600">
              After 5 bookings, you will see the loyalty offer separately with the code <span className="font-semibold text-amber-700">LOYAL50</span> and a dedicated booking button. Until then, this offer remains locked.
            </p>
          </section>
        )}

        {!isAuthenticated && !authLoading && (
          <section className="mt-10 rounded-[28px] border border-blue-200 bg-blue-50 p-6 shadow-sm shadow-blue-100">
            <h2 className="text-xl font-semibold text-slate-950">Login karein apni loyalty check karne ke liye</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Jab aap is website par 5 booking complete karenge, aap ko 50% off loyalty offer milay ga. Yeh code <span className="font-semibold text-amber-700">LOYAL50</span> aapko alag section mein nazar ayega.
            </p>
          </section>
        )}

        {isLoyalCustomer && (
          <section className="mt-10 rounded-[28px] border border-amber-200 bg-amber-50 p-6 shadow-lg shadow-amber-100">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Loyalty offer</p>
                <h2 className="mt-3 text-4xl font-semibold text-slate-950">50% off for customers with 5+ bookings</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
                  Aap ne 5 bookings complete kar li hain. Ab aapko 50% off ka special discount code mil gaya hai.
                </p>
              </div>
              <div className="rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950 shadow-sm shadow-slate-200">
                Use code <span className="text-amber-700">LOYAL50</span>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText('LOYAL50');
                  alert('Code copied: LOYAL50');
                }}
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm shadow-slate-200"
              >
                Copy LOYAL50
              </button>
              <button
                onClick={() => router.push('/services')}
                className="rounded-full bg-amber-700 px-5 py-3 text-sm font-semibold text-white"
              >
                Book now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {offers.map((offer) => (
              <div key={offer.code} className="rounded-[28px] border border-black/5 bg-white/90 p-6 text-left shadow-lg shadow-slate-100 transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">{offer.code}</span>
                </div>
                <p className="mt-5 text-sm font-medium text-blue-700">{offer.service}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{offer.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{offer.text}</p>
                <div className="mt-6 flex items-center justify-between text-sm gap-3">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(offer.code);
                        alert(`Code copied: ${offer.code}`);
                      }}
                      className="rounded-full border px-4 py-2 text-sm font-medium text-slate-950"
                    >
                      Copy code
                    </button>
                    <button
                      onClick={() => router.push(offer.href)}
                      className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white"
                    >
                      Book now
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    Limited offer
                  </span>
                </div>
              </div>
            ))}
        </section>

          <section className="mt-8 rounded-[26px] border border-slate-200 bg-white/95 p-6 text-sm leading-6 text-slate-900">
            <h3 className="text-lg font-semibold">Propose an offer / Give an offer</h3>
            <p className="mt-2 text-sm text-slate-700">If you are a provider or admin and want to give an offer to customers, follow these simple steps:</p>
            <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
              <li>Choose a short code (e.g. QUICK100) and a clear title.</li>
              <li>Decide discount type: <strong>fixed</strong> (₹) or <strong>percent</strong> (%), and set the value.</li>
              <li>Limit by service (optional) and set an expiry date or usage limits.</li>
              <li>Provide brief terms (what's included/excluded) so the customer knows exactly what to expect.</li>
              <li>Use the button below to propose the offer — our team will review and publish it.</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <button onClick={() => router.push('/contact?topic=Offer%20proposal')} className="rounded-full bg-blue-600 px-4 py-2 text-base font-semibold text-white">Propose an offer</button>
            </div>
          </section>

            <section className="mt-8 rounded-[26px] border border-slate-100 bg-white/95 p-6 text-sm leading-6 text-slate-900">
              <h3 className="text-lg font-semibold">How to give offers to customers (for providers)</h3>
              <p className="mt-2 text-sm text-slate-700">Simple, effective offer types and how to present them to customers:</p>
              <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
                <li>First-time discount: a fixed amount or percent for a customer's first confirmed booking (e.g. QUICK100: ₹100 off).</li>
                <li>Bundle offers: combine two services (bathroom + kitchen) and give a percent discount.</li>
                <li>Loyalty / repeat: reward customers after N bookings (e.g. after 3rd booking give ₹150 credit).</li>
                <li>Referral: give both referrer and referee a small credit or discount.</li>
                <li>Service-specific rules: prefer percent discounts on higher-margin services, fixed amounts on low-margin services.</li>
                <li>Time-limited flash deals: short expiry offers for weekends or seasonal demand to increase bookings.</li>
                <li>Clear terms: always show minimum spend, eligible services, expiry, and per-user limits.</li>
                <li>Auto-apply vs code: for eligible users auto-apply discounts in checkout; otherwise show a copyable code.</li>
              </ul>
              <p className="mt-3 text-sm text-slate-700">Example: "First Booking Saver — QUICK100: ₹100 off on first confirmed booking. Valid once per user, expires 30 days from issue."</p>
            </section>

        <div className="mt-8 rounded-[26px] border border-blue-100 bg-blue-50 p-6 text-sm leading-6 text-blue-900">
          <Clock3 className="mb-3 h-5 w-5" />
          Offers are shown as booking prompts in this demo. Final discount validation can be connected to backend payment or admin rules later.
        </div>
      </div>
    </div>
  );
}
