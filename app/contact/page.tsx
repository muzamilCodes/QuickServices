'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Mail, MapPin, MessageSquareText, Phone, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiBaseUrl } from '@/lib/apiBase';
import Breadcrumbs from '@/components/Breadcrumbs';

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
    website: '', // honeypot spam protection trap
  });

  useEffect(() => {
    const topic = searchParams?.get('topic');
    if (topic) {
      setForm((f) => ({ ...f, topic }));
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Spam honeypot trap: bots fill in hidden fields
    if (form.website) {
      toast.success('Message sent successfully');
      setForm({ name: '', phone: '', email: '', topic: 'Booking support', message: '', website: '' });
      return;
    }

    if (!form.name.trim() || !form.phone.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const cleanPhone = form.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (form.message.trim().length < 10) {
      toast.error('Message must be at least 10 characters long');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = getApiBaseUrl();
      const res = await fetch(`${apiUrl}/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: cleanPhone,
          email: form.email.trim().toLowerCase(),
          topic: form.topic,
          message: form.message.trim(),
          website: form.website,
        }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };

      if (data.success) {
        toast.success('Message sent successfully! Our support desk will reach out.');
        setForm({ name: '', phone: '', email: '', topic: 'Booking support', message: '', website: '' });
      } else {
        toast.error(data.message || 'Message send failed');
      }
    } catch {
      toast.error('Message send failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs items={[{ name: 'Contact Us', href: '/contact' }]} />
      </div>
      <div className="mx-auto mt-4 grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
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
            {/* Honeypot field - hidden from real human users, traps spam bots */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Leave this field empty</label>
              <input
                id="website"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>

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
