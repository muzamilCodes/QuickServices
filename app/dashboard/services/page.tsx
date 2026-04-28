'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, BadgeCheck, Clock3, Shield } from 'lucide-react';

const allServices = [
  { id: 'plumber', name: 'Plumber', icon: '🔧', description: 'Leaks, fittings, blocked drains, bathroom repairs.', price: '₹499', color: 'from-sky-500 to-blue-700', popular: true },
  { id: 'electrician', name: 'Electrician', icon: '⚡', description: 'Switchboards, fans, wiring, lights and faults.', price: '₹499', color: 'from-amber-400 to-orange-500', popular: true },
  { id: 'driver', name: 'Driver', icon: '🚗', description: 'Local trips, pickups, drops and event transport.', price: '₹399/hr', color: 'from-emerald-500 to-green-700', popular: false },
  { id: 'cleaner', name: 'Cleaner', icon: '🧹', description: 'Homes, rentals, offices and deep cleaning visits.', price: '₹399', color: 'from-cyan-500 to-teal-600', popular: true },
  { id: 'carpenter', name: 'Carpenter', icon: '🔨', description: 'Furniture fixes, wall mounts, shelves and fittings.', price: '₹599', color: 'from-orange-500 to-amber-700', popular: false },
  { id: 'painter', name: 'Painter', icon: '🎨', description: 'Touch-ups, feature walls and complete room refresh.', price: '₹699', color: 'from-rose-500 to-pink-700', popular: false },
  { id: 'mechanic', name: 'Mechanic', icon: '🛠️', description: 'Basic car and bike diagnosis with doorstep support.', price: '₹499', color: 'from-slate-600 to-slate-800', popular: false },
  { id: 'gardener', name: 'Gardener', icon: '🌿', description: 'Pruning, cleaning, watering and seasonal upkeep.', price: '₹399', color: 'from-lime-500 to-emerald-700', popular: false },
];

const highlights = [
  { icon: Clock3, label: 'Fast arrival', text: 'Designed for same-day local requests.' },
  { icon: Shield, label: 'OTP verified', text: 'Every booking gets a confirmation step.' },
  { icon: BadgeCheck, label: 'Clear pricing', text: 'Starting prices are visible before you book.' },
];

export default function ServicesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[32px] bg-[linear-gradient(135deg,#0f172a,#1d4ed8,#f97316)] px-6 py-12 text-white shadow-2xl shadow-slate-200/80 sm:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/70">Service catalog</p>
              <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
                Book trusted local help without leaving the same flow.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">
                Browse the categories, choose the problem you need solved, and jump straight into the booking page with the service pre-selected.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {highlights.map(({ icon: Icon, label, text }) => (
                <div key={label} className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <Icon className="h-5 w-5 text-orange-200" />
                  <h2 className="mt-4 text-lg font-medium">{label}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/75">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {allServices.map((service) => (
            <button
              key={service.id}
              onClick={() => router.push(`/booking?service=${service.id}`)}
              className="relative rounded-[28px] border border-black/5 bg-white/90 p-6 text-left shadow-lg shadow-slate-100 transition hover:-translate-y-1 hover:shadow-xl"
            >
              {service.popular && (
                <span className="absolute right-5 top-5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Popular
                </span>
              )}
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${service.color} text-3xl shadow-lg shadow-slate-200/50`}>
                {service.icon}
              </div>
              <h2 className="mt-5 text-xl font-semibold text-slate-950">{service.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-base font-semibold text-slate-900">{service.price}</span>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-700">
                  Book
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          ))}
        </section>
      </div>
    </div>
  );
}
