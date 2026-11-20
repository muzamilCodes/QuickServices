'use client';

import { useEffect, useState } from 'react';
import {
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
  CheckCircle2,
  Clock,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiBaseUrl } from '@/lib/apiBase';
import Breadcrumbs from '@/components/Breadcrumbs';

const contactCards = [
  {
    icon: Phone,
    title: 'Call Us',
    value: '+91 96826 45127',
    text: 'For urgent booking or provider support.',
    href: 'tel:+919682645127',
    color: 'bg-blue-50 text-blue-700',
    iconBg: 'bg-blue-100',
  },
  {
    icon: Mail,
    title: 'Email Us',
    value: 'Quickservices114@gmail.com',
    text: 'For account, offer, and booking questions.',
    href: 'mailto:Quickservices114@gmail.com',
    color: 'bg-orange-50 text-orange-600',
    iconBg: 'bg-orange-100',
  },
  {
    icon: MapPin,
    title: 'Location',
    value: 'Handwara Qalamabad',
    text: 'Kupwara District, J&K — 193221.',
    href: 'https://www.google.com/maps/search/?api=1&query=Handwara+Qalamabad',
    color: 'bg-green-50 text-green-700',
    iconBg: 'bg-green-100',
  },
  {
    icon: Clock,
    title: 'Office Hours',
    value: 'Mon–Sat 9AM–6PM',
    text: 'We respond within 24 hours on weekdays.',
    href: null,
    color: 'bg-purple-50 text-purple-700',
    iconBg: 'bg-purple-100',
  },
];

const topics = [
  'Booking support',
  'Provider signup',
  'Offer proposal',
  'Account issue',
  'General support',
];

function ContactPageInner() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    topic: 'Booking support',
    message: '',
    website: '', // honeypot
  });

  useEffect(() => {
    const topic = new URLSearchParams(window.location.search).get('topic');
    if (topic) setForm((f) => ({ ...f, topic }));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Spam honeypot trap
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
        setSubmitted(true);
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
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-6 px-0">
            <Breadcrumbs items={[{ name: 'Contact Us', href: '/contact' }]} />
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm text-orange-300 backdrop-blur-sm">
              <MessageSquareText className="h-4 w-4" />
              Contact QuickServices
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
              We&apos;re here to{' '}
              <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                help you
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300">
              Booking issue, provider question, or just want to say hello? Send us a message and our support team will get back to you quickly.
            </p>
          </div>
        </div>
      </section>

      {/* ── Contact Cards ── */}
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {contactCards.map(({ icon: Icon, title, value, text, href, color, iconBg }) => {
              const Wrapper = href ? 'a' : 'div';
              const wrapperProps = href
                ? { href, target: href.startsWith('http') ? '_blank' : undefined, rel: href.startsWith('http') ? 'noopener noreferrer' : undefined }
                : {};

              return (
                <Wrapper
                  key={title}
                  {...wrapperProps}
                  className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconBg} ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{text}</p>
                </Wrapper>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Main Form + Info ── */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">

            {/* Left info panel */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-blue-950 p-8 text-white shadow-2xl md:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-orange-300">
                <Sparkles className="h-4 w-4" />
                Quick Response Guaranteed
              </div>

              <h2 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl">
                Need help with a booking, service, or provider profile?
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Send the details once and the support team will follow up with booking help, service questions, or account support.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-orange-300" />
                  <div>
                    <p className="text-sm font-semibold">Call directly</p>
                    <a href="tel:+919682645127" className="text-sm text-slate-300 hover:text-white hover:underline">+91 96826 45127</a>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-orange-300" />
                  <div>
                    <p className="text-sm font-semibold">Email us</p>
                    <a href="mailto:Quickservices114@gmail.com" className="text-sm text-slate-300 hover:text-white hover:underline">Quickservices114@gmail.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-orange-300" />
                  <div>
                    <p className="text-sm font-semibold">Visit us</p>
                    <p className="text-sm text-slate-300">Handwara Qalamabad, J&amp;K — 193221</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/919682645127?text=Hello%20QuickServices%2C%20I%20need%20help%20with..."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition hover:bg-green-600"
              >
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
              </a>
            </div>

            {/* Right form panel */}
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm md:p-10">
              {submitted ? (
                /* Success state */
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-slate-900">Message Sent!</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Thank you for reaching out. Our support team will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 rounded-full bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Send a Message</h2>
                    <p className="mt-2 text-sm text-slate-500">Fill in the form below and we&apos;ll get back to you shortly.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                    {/* Honeypot */}
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
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name *</label>
                        <input
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                          placeholder="e.g. Amir Khan"
                          type="text"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Phone Number *</label>
                        <input
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                          placeholder="10-digit mobile number"
                          type="tel"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email Address *</label>
                      <input
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        placeholder="yourname@email.com"
                        type="email"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Topic</label>
                      <select
                        value={form.topic}
                        onChange={(e) => setForm({ ...form, topic: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      >
                        {topics.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      {form.topic === 'Offer proposal' && (
                        <p className="mt-2 text-xs text-slate-400">
                          Include: offer code, title, discount type/value, applicable services, expiry, and brief terms.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Message *</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        placeholder="Describe your issue or question in detail..."
                        rows={5}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-800 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:from-blue-800 hover:to-blue-900 disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-slate-400">
                      We typically respond within 24 hours on weekdays.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ContactPage() {
  return <ContactPageInner />;
}
