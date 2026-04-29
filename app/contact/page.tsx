'use client';

import { Mail, MapPin, MessageSquareText, Phone, Send } from 'lucide-react';

const contactCards = [
  { icon: Phone, title: 'Call', value: '+91 9682645127', text: 'For urgent booking or provider support.' },
  { icon: Mail, title: 'Email', value: 'Quickservices@gmail.com', text: 'For account, offer, and booking questions.' },
  { icon: MapPin, title: 'Location', value: 'Handwara Qalamabad', text: 'Built for local service requests around your area.' },
];

export default function ContactPage() {
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

          <form className="mt-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" placeholder="Full name" type="text" />
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" placeholder="Phone number" type="tel" />
            </div>
            <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" placeholder="Email address" type="email" />
            <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-600 outline-none transition focus:border-blue-500">
              <option>Booking support</option>
              <option>Provider signup</option>
              <option>Offer question</option>
              <option>General support</option>
            </select>
            <textarea className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500" placeholder="Write your message" rows={6} />
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Send message
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
