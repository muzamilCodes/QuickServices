'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, BadgePercent, Clock3, Sparkles, Star, Loader2 } from 'lucide-react';

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
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
const res = await fetch('http://localhost:4000/public/offers');
        const data = await res.json();
        if (data.success && data.offers?.length > 0) {
          // Filter active offers and not expired
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
  }, []);

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

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {offers.map((offer) => (
<button
              key={offer.code}
              onClick={() => {
                navigator.clipboard.writeText(offer.code);
                alert(`Code copied: ${offer.code}`);
              }}
              className="rounded-[28px] border border-black/5 bg-white/90 p-6 text-left shadow-lg shadow-slate-100 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">{offer.code}</span>
              </div>
              <p className="mt-5 text-sm font-medium text-blue-700">{offer.service}</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">{offer.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{offer.text}</p>
              <div className="mt-6 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  Limited offer
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-blue-700">
                  Book now
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          ))}
        </section>

        <div className="mt-8 rounded-[26px] border border-blue-100 bg-blue-50 p-6 text-sm leading-6 text-blue-900">
          <Clock3 className="mb-3 h-5 w-5" />
          Offers are shown as booking prompts in this demo. Final discount validation can be connected to backend payment or admin rules later.
        </div>
      </div>
    </div>
  );
}
