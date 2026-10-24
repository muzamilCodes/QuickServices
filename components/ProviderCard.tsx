'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toLocalDateInput } from '@/lib/utils';
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  XCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export interface ProviderDetails {
  _id: string;
  name: string;
  profilePicture: string;
  phone: string;
  whatsappNumber?: string;
  rating: number;
  totalRatings: number;
  isApproved: boolean;
  isAvailable: boolean;
  serviceArea: string;
  category?: string;
  experience?: number;
  qualifications?: string;
  workingHours?: string;
  workingDays?: string[];
  location?: { city?: string; address?: string; lat?: number; lng?: number };
}

export interface AvailabilityInfo {
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'UNAVAILABLE' | 'BOOKED';
  reason: string;
  estimatedArrival: string;
  workingHours: string;
  workingDays: string[];
  availableSlots: Array<{ time: string; available: boolean }>;
}

interface ProviderCardProps {
  provider: ProviderDetails | null;
  availability: AvailabilityInfo | null;
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenWhatsAppShare: () => void;
  onScrollToForm: () => void;
}

export default function ProviderCard({
  provider,
  availability,
  selectedSlot,
  onSelectSlot,
  selectedDate,
  onSelectDate,
  onOpenWhatsAppShare,
  onScrollToForm
}: ProviderCardProps) {
  const status = availability?.status || (provider?.isAvailable ? 'AVAILABLE' : 'OFFLINE');
  const isAvailable = status === 'AVAILABLE';
  const isBusy = status === 'BUSY';
  const isOffline = status === 'OFFLINE';
  const isUnavailable = status === 'UNAVAILABLE';

  // Generate date choices: today + next 5 days
  const dateOptions = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = toLocalDateInput(d);
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return { iso, label };
  });

  return (
    <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-6 shadow-xl shadow-slate-100 dark:shadow-black/40 space-y-5 transition">
      {/* Header with Provider Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="relative h-14 w-14 overflow-hidden rounded-2xl border-2 border-white dark:border-slate-800 shadow-md bg-slate-100 dark:bg-slate-800">
            <Image
              src={provider?.profilePicture || '/hero-user.jpg'}
              alt={provider?.name || 'Service Provider'}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {provider?.name || 'Verified QuickServices Specialist'}
              </h3>
              {provider?.isApproved && (
                <span title="Verified Professional" className="inline-flex">
                  <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {provider?.qualifications || 'Doorstep Service Technician'} · {provider?.serviceArea || 'Kashmir'}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 font-bold text-amber-500 dark:text-amber-400">
                <Star className="h-3.5 w-3.5 fill-current" />
                {provider?.rating ? provider.rating.toFixed(1) : '4.8'}
              </span>
              <span className="text-slate-400 dark:text-slate-500">
                ({provider?.totalRatings || 12} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Live Availability Status Badge */}
        <div className="shrink-0">
          {isAvailable && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1 text-xs font-black text-emerald-700 dark:text-emerald-400 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Service Provider Available
            </span>
          )}
          {isBusy && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3.5 py-1 text-xs font-black text-amber-700 dark:text-amber-400 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Currently Busy on Job
            </span>
          )}
          {isOffline && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-400 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              Currently Offline
            </span>
          )}
          {isUnavailable && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-3.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-400 shadow-sm">
              <XCircle className="h-3.5 w-3.5" />
              Provider Unavailable
            </span>
          )}
        </div>
      </div>

      {/* CASE A: PROVIDER IS AVAILABLE */}
      {isAvailable && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-2.5">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Estimated Arrival</span>
              <span className="font-extrabold text-slate-900 dark:text-white mt-0.5 block">{availability?.estimatedArrival || '30 - 45 mins'}</span>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-2.5">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Operating Hours</span>
              <span className="font-extrabold text-slate-900 dark:text-white mt-0.5 block">{availability?.workingHours || '08:00 AM - 08:00 PM'}</span>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-2.5">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Service Area</span>
              <span className="font-extrabold text-slate-900 dark:text-white mt-0.5 block truncate">{provider?.serviceArea || 'Kashmir Doorstep'}</span>
            </div>
          </div>

          {/* Date Selector Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Booking Date
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {dateOptions.map(opt => (
                <button
                  key={opt.iso}
                  type="button"
                  onClick={() => onSelectDate(opt.iso)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                    selectedDate === opt.iso
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Available Slots Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Available Time Slot
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availability?.availableSlots?.map(slot => (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => onSelectSlot(slot.time)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition border ${
                    !slot.available
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400'
                      : selectedSlot === slot.time
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-600/30'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {slot.time}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {slot.available ? 'Available' : 'Booked'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons: Book Service, Contact Provider, Share Location */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onScrollToForm}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 text-center"
            >
              Book Service
            </button>

            {provider?.phone && (
              <a
                href={`tel:${provider.phone}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                <span>Call Provider</span>
              </a>
            )}

            <button
              type="button"
              onClick={onOpenWhatsAppShare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Share Location on WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* CASE B: PROVIDER IS BUSY, OFFLINE, OR UNAVAILABLE */}
      {!isAvailable && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Sorry, this service provider is not available at the moment.
                </h4>
                <p className="mt-1 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  {availability?.reason || 'The provider is currently attending another appointment or outside operating hours.'}
                </p>
              </div>
            </div>
          </div>

          {/* Future scheduling if busy or offline */}
          {(isBusy || isOffline) && (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>Schedule for an upcoming available time slot:</span>
              </div>

              {/* Date Selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {dateOptions.map(opt => (
                  <button
                    key={opt.iso}
                    type="button"
                    onClick={() => onSelectDate(opt.iso)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                      selectedDate === opt.iso
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Slot Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availability?.availableSlots?.map(slot => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => onSelectSlot(slot.time)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold transition border ${
                      !slot.available
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400'
                        : selectedSlot === slot.time
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{slot.time}</span>
                    <span className="text-[10px] uppercase">{slot.available ? 'Open' : 'Full'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Options: Find Another Provider, Notify Me, Contact Support */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <Link
              href="/services"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-2.5 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-center transition"
            >
              <span>Find Another Provider</span>
            </Link>

            <button
              type="button"
              onClick={() => alert(`We will notify you when ${provider?.name || 'this provider'} becomes available.`)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-center transition"
            >
              <span>Notify Me When Free</span>
            </button>

            <Link
              href="/contact"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-center transition"
            >
              <span>Contact Support</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
