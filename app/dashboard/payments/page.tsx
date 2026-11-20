'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  IndianRupee,
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Wrench,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Building,
  User,
  X
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getApiBaseUrl } from '@/lib/apiBase';

interface Booking {
  _id: string;
  serviceType: string;
  status: string;
  createdAt: string;
  amount?: number;
  originalAmount?: number;
  discountAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  customerName?: string;
  customerPhone?: string;
  provider?: { name: string; phone: string };
  address?: { fullAddress?: string; city?: string };
}

export default function PaymentsPage() {
  const router = useRouter();
  const API = getApiBaseUrl();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Booking | null>(null);

  const fetchPayments = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
    if (isAuthenticated) void fetchPayments();
  }, [isAuthenticated, authLoading, fetchPayments, router]);

  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const totalPaid = completedBookings.reduce((sum, b) => sum + (b.amount || 499), 0);
  const pendingPayments = bookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 flex items-center gap-2.5">
            <CreditCard className="h-7 w-7 text-emerald-600" /> Payments & Invoices
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View completed service transactions, cash receipts, and download official GST/tax invoices.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <IndianRupee className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount Spent</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settled Invoices</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{completedBookings.length}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pay-After-Service</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{pendingPayments.length} Active</p>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" /> Service Invoice History
          </h2>
          <span className="text-xs text-slate-500 font-semibold">{bookings.length} Total Bookings</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No invoices generated yet. Your service bills will appear here once booked.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.map((b) => (
              <div key={b._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 capitalize">
                      {b.serviceType.replace('-', ' ')} Service
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>Invoice #{b._id.slice(-6).toUpperCase()}</span>
                      <span>•</span>
                      <span>{new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>•</span>
                      <span className="capitalize">{b.paymentMethod || 'Cash on Delivery'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <p className="font-black text-base text-slate-950">₹{b.amount || 499}</p>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : b.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {b.status === 'completed' ? 'Paid' : b.status === 'cancelled' ? 'Void' : 'Pending Payment'}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedInvoice(b)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-sm"
                  >
                    <FileText className="h-3.5 w-3.5" /> View Bill
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── INVOICE VIEW MODAL ──────────────────────────────────────────────── */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">QuickServices Kashmir</span>
                <h3 className="text-xl font-black text-slate-950">Service Invoice Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <p className="text-slate-400 font-semibold">Invoice No:</p>
                <p className="font-mono font-bold text-slate-900">QS-INV-{selectedInvoice._id.slice(-8).toUpperCase()}</p>
                <p className="text-slate-400 font-semibold mt-2">Billed To:</p>
                <p className="font-bold text-slate-900">{selectedInvoice.customerName || user?.username || 'Customer'}</p>
                <p className="text-slate-500">{selectedInvoice.customerPhone || user?.mobile || ''}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-semibold">Date of Service:</p>
                <p className="font-bold text-slate-900">{new Date(selectedInvoice.createdAt).toLocaleDateString('en-IN')}</p>
                <p className="text-slate-400 font-semibold mt-2">Payment Status:</p>
                <p className={`font-bold uppercase ${selectedInvoice.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedInvoice.status === 'completed' ? 'Paid / Settled' : 'Pay After Delivery'}
                </p>
                <p className="text-slate-500">{selectedInvoice.paymentMethod || 'Cash on Delivery'}</p>
              </div>
            </div>

            {/* Line Item */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 capitalize">
                      {selectedInvoice.serviceType.replace('-', ' ')} Doorstep Service
                      <span className="block text-[11px] text-slate-400 font-normal">
                        Verified technician inspection & doorstep labor
                      </span>
                    </td>
                    <td className="p-3 text-center">1</td>
                    <td className="p-3 text-right font-mono">₹{selectedInvoice.amount || 499}</td>
                    <td className="p-3 text-right font-mono font-bold">₹{selectedInvoice.amount || 499}</td>
                  </tr>
                </tbody>
              </table>

              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{selectedInvoice.amount || 499}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Taxes (Included):</span>
                  <span className="font-mono">₹0.00</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span className="font-mono text-emerald-600">₹{selectedInvoice.amount || 499}</span>
                </div>
              </div>
            </div>

            {/* Security Guarantee Note */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl text-[11px] text-blue-900 font-medium">
              <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Covered by QuickServices 48-Hour Doorstep Quality Warranty & Support Helpline.</span>
            </div>

            {/* Print and Close Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handlePrint}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition shadow-md"
              >
                <Printer className="h-4 w-4" /> Print / Save PDF
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="flex-1 rounded-xl border border-slate-300 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
