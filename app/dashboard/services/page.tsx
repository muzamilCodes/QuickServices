'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowRight, BadgeCheck, Clock3, Shield, Star, Loader2 } from 'lucide-react';

interface Service {
  _id: string;
  id: string;
  name: string;
  icon: string;
  description: string;
  details: string[];
  basePrice: number;
  priceUnit: string;
  rating: number;
}

const highlights = [
  { icon: Clock3, label: 'Fast arrival', text: 'Designed for same-day local requests.' },
  { icon: Shield, label: 'OTP verified', text: 'Every booking gets a confirmation step.' },
  { icon: BadgeCheck, label: 'Clear pricing', text: 'Starting prices are visible before you book.' },
];

const defaultServices: Service[] = [
  { _id: '1', id: 'plumber', name: 'Plumber', icon: '🔧', description: 'Leak repair, tap fitting, blocked drains and bathroom plumbing.', details: ['Leak repair', 'Tap fitting', 'Drain cleaning'], basePrice: 499, priceUnit: 'visit', rating: 4.8 },
  { _id: '2', id: 'carpenter', name: 'Carpenter', icon: '🪵', description: 'Furniture repair, wood polish, door fitting and custom woodwork.', details: ['Furniture repair', 'Polishing', 'Installation'], basePrice: 499, priceUnit: 'visit', rating: 4.7 },
  { _id: '3', id: 'electrician', name: 'Electrician', icon: '💡', description: 'Wiring, switchboard, fan repair and electrical installations.', details: ['Wiring', 'Switchboard', 'Fan repair'], basePrice: 449, priceUnit: 'visit', rating: 4.8 },
  { _id: '4', id: 'cleaner', name: 'Home Cleaner', icon: '🧹', description: 'Full home cleaning, sofa carpet wash and deep cleaning services.', details: ['Home cleaning', 'Sofa wash', 'Deep clean'], basePrice: 599, priceUnit: 'visit', rating: 4.6 },
  { _id: '5', id: 'ac', name: 'AC Service', icon: '❄️', description: 'AC repair, gas refill, installation and annual maintenance.', details: ['Gas refill', 'Repair', 'Service'], basePrice: 499, priceUnit: 'visit', rating: 4.7 },
  { _id: '6', id: 'painter', name: 'Painter', icon: '🎨', description: 'Interior/exterior painting, texture and waterproofing solutions.', details: ['Interior', 'Exterior', 'Texture'], basePrice: 699, priceUnit: 'visit', rating: 4.5 },
  { _id: '7', id: 'pest', name: 'Pest Control', icon: '🐛', description: 'Cockroach, mosquito, termite and general pest control.', details: ['Cockroach', 'Termite', 'Mosquito'], basePrice: 599, priceUnit: 'visit', rating: 4.6 },
  { _id: '8', id: 'salon', name: 'Salon at Home', icon: '💇', description: 'Haircut, grooming, facial, waxing and home salon appointments.', details: ['Haircut', 'Facial', 'Grooming'], basePrice: 399, priceUnit: 'session', rating: 4.8 },
];

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('http://localhost:4000/admin/services');
        const data = await res.json();
        if (data.success && data.services?.length > 0) {
          setServices(data.services.map((s: any) => ({
            _id: s._id,
            id: s.id || s._id,
            name: s.name,
            icon: s.icon || '🔧',
            description: s.description || '',
            details: s.details || [],
            basePrice: s.basePrice || 499,
            priceUnit: s.priceUnit || 'visit',
            rating: s.rating || 4.5,
          })));
        } else {
          setServices(defaultServices);
        }
      } catch {
        setServices(defaultServices);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <section className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => (
              <button
                key={service._id}
                onClick={() => router.push(`/booking?service=${service.id}`)}
                className="relative flex min-h-[360px] flex-col rounded-[28px] border border-black/5 bg-white/90 p-6 text-left shadow-lg shadow-slate-100 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-3xl shadow-lg shadow-slate-200/50">
                  {service.icon}
                </div>
                <h2 className="mt-5 text-xl font-semibold text-slate-950">{service.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(service.details || []).slice(0, 3).map((detail: string) => (
                    <span key={detail} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {detail}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between pt-6">
                  <div>
                    <span className="text-base font-semibold text-slate-900">₹{service.basePrice}</span>
                    <span className="text-xs text-slate-500">/{service.priceUnit}</span>
                    <span className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {service.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-700">
                    Book
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </button>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
