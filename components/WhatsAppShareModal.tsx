'use client';

import React, { useState } from 'react';
import { MessageSquare, MapPin, X, ExternalLink, ShieldCheck, Check } from 'lucide-react';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  customerName: string;
  customerAddress: string;
  lat: number | null;
  lng: number | null;
  bookingTime?: string;
  bookingDate?: string;
  providerWhatsapp?: string;
  bookingRef?: string;
}

export default function WhatsAppShareModal({
  isOpen,
  onClose,
  serviceName,
  customerName,
  customerAddress,
  lat,
  lng,
  bookingTime,
  bookingDate,
  providerWhatsapp,
  bookingRef
}: WhatsAppShareModalProps) {
  const [includeLocationLink, setIncludeLocationLink] = useState(true);

  if (!isOpen) return null;

  const mapsLink = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : '';
  const refCode = bookingRef || `QS-${Date.now().toString().slice(-6)}`;

  let messageText = `*QuickServices Kashmir - Service Request*\n`;
  messageText += `━━━━━━━━━━━━━━━━━━━━━\n`;
  messageText += `*Booking Ref:* #${refCode}\n`;
  messageText += `*Service:* ${serviceName}\n`;
  if (bookingDate) messageText += `*Date:* ${bookingDate}\n`;
  if (bookingTime) messageText += `*Time Slot:* ${bookingTime}\n`;
  if (customerName) messageText += `*Customer:* ${customerName}\n`;
  if (customerAddress) messageText += `*Address:* ${customerAddress}\n`;
  if (includeLocationLink && mapsLink) {
    messageText += `*Location Map:* ${mapsLink}\n`;
  }
  messageText += `━━━━━━━━━━━━━━━━━━━━━\n`;
  messageText += `_Doorstep Service requested via QuickServices Kashmir._`;

  const cleanWhatsappNumber = providerWhatsapp ? providerWhatsapp.replace(/\D/g, '') : '';
  const targetNumber = cleanWhatsappNumber.length === 10 ? `91${cleanWhatsappNumber}` : cleanWhatsappNumber;
  const whatsappUrl = targetNumber
    ? `https://wa.me/${targetNumber}?text=${encodeURIComponent(messageText)}`
    : `https://wa.me/?text=${encodeURIComponent(messageText)}`;

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Share Details on WhatsApp
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review your message before opening WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Location Consent Checkbox */}
        {mapsLink && (
          <label className="flex items-start gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 cursor-pointer">
            <input
              type="checkbox"
              checked={includeLocationLink}
              onChange={(e) => setIncludeLocationLink(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <div className="text-xs">
              <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
                Include Google Maps link for your selected location
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 text-[11px] block mt-0.5">
                {mapsLink}
              </span>
            </div>
          </label>
        )}

        {/* Message Preview Box */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Message Preview (Click-to-Chat)
          </label>
          <pre className="whitespace-pre-wrap font-sans text-xs p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 leading-relaxed max-h-56 overflow-y-auto">
            {messageText}
          </pre>
        </div>

        {/* Notice */}
        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
          ℹ️ Opening WhatsApp will pre-fill the text. The message will not be sent automatically; you can review and tap Send yourself in WhatsApp.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open in WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-300 dark:border-slate-700 px-5 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
