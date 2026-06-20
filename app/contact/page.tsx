'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, MapPin, MessageSquareText, Phone, Send } from 'lucide-react';
import toast from 'react-hot-toast';

import { Suspense } from 'react';

const contactCards = [
  { icon: Phone, title: 'Call', value: '+91 9682645127', text: 'For urgent booking or provider support.' },
  { icon: Mail, title: 'Email', value: 'Quickservices@gmail.com', text: 'For account, offer, and booking questions.' },
  { icon: MapPin, title: 'Location', value: 'Handwara Qalamabad', text: 'Built for local service requests around your area.' },
];


function ContactPageInner() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    topic: 'Booking support',
    message: '',
  });

  useEffect(() => {
    const topic = searchParams?.get('topic');
    if (topic) {
      setForm((f) => ({ ...f, topic }));
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };

      if (data.success) {
        toast.success('Message sent successfully');
        setForm({ name: '', phone: '', email: '', topic: 'Booking support', message: '' });
      } else {
        toast.error(data.message || 'Message send failed');
      }
    } catch {
      toast.error('Message send failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[32px] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-200 md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80">
            <MessageSquareText className="h-4 w-4 text-orange-300" />
            Contact QuickServices
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">Need help with a booking, service, or provider profile?</h1>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Send the details once and the support team can follow up with booking help, service questions, or account support.
          </p>

          <div className="mt-8 space-y-4">
            {contactCards.map(({ icon: Icon, title, value, text }) => (
              <div key={title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <Icon className="h-5 w-5 text-orange-300" />
                <h2 className="mt-3 font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-white">{value}</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] bg-white/90 p-8 shadow-2xl shadow-slate-100 md:p-10">
          <h2 className="text-3xl font-semibold text-slate-950">Send a message</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">This form is ready for UI flow and can be connected to the backend mail service later.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" placeholder="Full name" type="text" required />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" placeholder="Phone number" type="tel" required />
            </div>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" placeholder="Email address" type="email" required />
            <select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-600 outline-none transition focus:border-blue-500">
              <option value="Booking support">Booking support</option>
              <option value="Provider signup">Provider signup</option>
              <option value="Offer proposal">Offer proposal</option>
              <option value="Offer question">Offer question</option>
              <option value="General support">General support</option>
            </select>
            {form.topic === 'Offer proposal' && (
              <p className="mt-2 text-sm text-slate-500">Propose your offer: include code, title, discount type/value, applicable services, expiry, and brief terms.</p>
            )}
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" placeholder="Write your message" rows={6} required />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send message'}
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactPageInner />
    </Suspense>
  );
}

