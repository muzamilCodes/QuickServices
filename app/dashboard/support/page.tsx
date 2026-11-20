'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Headphones,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  ShieldCheck,
  ArrowLeft,
  ChevronDown,
  Send,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { getApiBaseUrl } from '@/lib/apiBase';
import { useAuthStore } from '@/store/authStore';

const FAQS = [
  {
    q: 'How quickly will a technician reach my doorstep in Kashmir?',
    a: 'For urgent emergencies (water pipe bursts, total power blackouts), dispatch arrives within 30–60 minutes in municipal centers like Handwara, Sopore, Baramulla, and Srinagar. Standard bookings arrive on your chosen date & slot.'
  },
  {
    q: 'Are your technicians background checked and verified?',
    a: 'Yes. Every service provider in our network undergoes physical identity verification, Aadhaar/Govt ID check, hands-on skill evaluation, and reference verification by our founder War Muzamil and team.'
  },
  {
    q: 'Can I pay after the service is done?',
    a: 'Absolutely! QuickServices operates primarily on Pay-After-Service (Cash on Delivery or UPI). You only pay after you inspect the technician’s work and are 100% satisfied.'
  },
  {
    q: 'What if I am unhappy with the repair quality?',
    a: 'We provide a 48-Hour Service Assurance Warranty. If an issue reoccurs or the job was inadequate, call our helpline (+91 9682645127) within 48 hours for a free corrective technician visit or full resolution.'
  }
];

export default function SupportPage() {
  const router = useRouter();
  const API = getApiBaseUrl();
  const { user } = useAuthStore();

  const [name, setName] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.mobile || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || user?.username || 'Customer',
          email: email || user?.email || 'customer@quickservices.com',
          phone: phone || user?.mobile || '',
          subject: subject || 'Support Query from Dashboard',
          message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSentSuccess(true);
        setMessage('');
        setSubject('');
      } else {
        alert(data.message || 'Could not send message');
      }
    } catch {
      alert('Network error. Please try calling our helpline directly.');
    } finally {
      setSubmitting(false);
    }
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
          <Headphones className="h-7 w-7 text-sky-600" /> Customer Support & Helpdesk
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Our dedicated Kashmir operations desk is ready to assist you 7 days a week.
        </p>
      </div>

      {/* 3 Channels Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Phone Helpline */}
        <a
          href="tel:+919682645127"
          className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition flex items-center gap-4 group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition">
            <Phone className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Emergency Helpline</p>
            <p className="text-sm sm:text-base font-black text-slate-900 mt-0.5">+91 9682645127</p>
            <p className="text-[11px] text-emerald-600 font-semibold">Available 8 AM - 10 PM</p>
          </div>
        </a>

        {/* WhatsApp Direct */}
        <a
          href="https://wa.me/919682645127?text=Hi%20QuickServices%2C%20I%20need%20assistance%20with%20my%20service%20booking"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition flex items-center gap-4 group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">WhatsApp Chat</p>
            <p className="text-sm sm:text-base font-black text-slate-900 mt-0.5">+91 9682645127</p>
            <p className="text-[11px] text-emerald-600 font-semibold">Instant reply on WhatsApp</p>
          </div>
        </a>

        {/* Email */}
        <a
          href="mailto:Quickservices114@gmail.com"
          className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm hover:border-purple-500 hover:shadow-md transition flex items-center gap-4 group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 group-hover:scale-110 transition">
            <Mail className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase">Official Email</p>
            <p className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 truncate">Quickservices114@gmail.com</p>
            <p className="text-[11px] text-purple-600 font-semibold">Admin Desk</p>
          </div>
        </a>
      </div>

      {/* Main Grid: Form (Left) & FAQs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-6 rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" /> Send a Support Request
          </h2>
          <p className="text-xs text-slate-500">
            Leave your message below and our support team will respond or call you back shortly.
          </p>

          {sentSuccess ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-extrabold text-emerald-950">Message Sent Successfully!</h3>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Thank you for reaching out. Our Kashmir support manager has received your ticket and will contact you promptly.
              </p>
              <button
                onClick={() => setSentSuccess(false)}
                className="mt-2 text-xs font-bold text-emerald-800 underline"
              >
                Send another query
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="War Muzamil"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9682645127"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Issue Topic</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Reschedule booking, Technician inquiry, Invoice copy"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Message</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain what help you need with your service or booking..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 transition shadow-md shadow-blue-500/20 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? 'Submitting Request...' : 'Submit Support Ticket'}
              </button>
            </form>
          )}
        </div>

        {/* FAQs */}
        <div className="lg:col-span-6 rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" /> Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">Quick answers about our Kashmir service guarantee.</p>

          <div className="divide-y divide-slate-100">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="py-3">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 transition gap-2"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
