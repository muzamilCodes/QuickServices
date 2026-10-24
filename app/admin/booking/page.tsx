'use client';

import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  CalendarDays, 
  MapPin, 
  Search, 
  Filter, 
  User, 
  Phone, 
  Loader2, 
  Trash2,
  Calendar,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Clock,
  ShieldAlert
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { servicesById } from "@/lib/services";
import { getApiBaseUrl } from "@/lib/apiBase";
import { toLocalDateInput } from "@/lib/utils";

interface Booking {
  _id: string;
  serviceType: string;
  status: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  preferredDate?: string;
  preferredTime?: string;
  amount?: number;
  address?: {
    fullAddress?: string;
    city?: string;
    pincode?: string;
  };
  user?: {
    _id: string;
    username?: string;
    email?: string;
  };
  provider?: {
    _id: string;
    name: string;
    phone?: string;
    whatsappNumber?: string;
    isAvailable?: boolean;
    isApproved?: boolean;
    category?: string;
  };
}

interface Provider {
  _id: string;
  name: string;
  isAvailable?: boolean;
  isApproved?: boolean;
  category?: string;
  services?: string[];
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // Reassign Modal State
  const [reassignModal, setReassignModal] = useState<{ open: boolean; booking: Booking | null }>({
    open: false,
    booking: null
  });
  const [targetProviderId, setTargetProviderId] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  // Reschedule Modal State
  const [rescheduleModal, setRescheduleModal] = useState<{ open: boolean; booking: Booking | null }>({
    open: false,
    booking: null
  });
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("09:00 AM - 11:00 AM");

  const API_URL = getApiBaseUrl();

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  });

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
        search: searchTerm,
        status: statusFilter === "all" ? "" : statusFilter,
      });
      const res = await fetch(`${API_URL}/admin/bookings?${params}`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, page, searchTerm, statusFilter]);

  const fetchProviders = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/providers`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success && data.providers) {
        setProviders(data.providers);
      }
    } catch (error) {
      console.error(error);
    }
  }, [API_URL]);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchProviders();
      void fetchBookings();
    }
  }, [isAuthenticated, fetchBookings, fetchProviders]);

  const updateStatus = async (bookingId: string, status: string) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`${API_URL}/admin/bookings/${bookingId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Booking status updated to ${status}`);
        void fetchBookings();
      } else {
        setMessage(data.message || "Update failed");
      }
    } catch (error) {
      setMessage("Update failed. Check backend.");
    } finally {
      setUpdatingId("");
    }
  };

  const handleReassign = async () => {
    if (!reassignModal.booking || !targetProviderId) return;
    setUpdatingId(reassignModal.booking._id);
    try {
      const res = await fetch(`${API_URL}/admin/bookings/${reassignModal.booking._id}/reassign`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          providerId: targetProviderId,
          overrideReason
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Booking successfully reassigned!`);
        setReassignModal({ open: false, booking: null });
        setTargetProviderId("");
        setOverrideReason("");
        void fetchBookings();
      } else {
        setMessage(data.message || "Reassign failed");
      }
    } catch {
      setMessage("Reassign failed.");
    } finally {
      setUpdatingId("");
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleModal.booking || !rescheduleDate || !rescheduleTime) return;
    setUpdatingId(rescheduleModal.booking._id);
    try {
      const res = await fetch(`${API_URL}/admin/bookings/${rescheduleModal.booking._id}/reschedule`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          preferredDate: rescheduleDate,
          preferredTime: rescheduleTime,
          reason: "Rescheduled by Admin"
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Booking successfully rescheduled!`);
        setRescheduleModal({ open: false, booking: null });
        void fetchBookings();
      } else {
        setMessage(data.message || "Reschedule failed");
      }
    } catch {
      setMessage("Reschedule failed.");
    } finally {
      setUpdatingId("");
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to permanently delete this booking record?')) return;
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`${API_URL}/admin/bookings/${bookingId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Booking deleted successfully!");
        void fetchBookings();
      } else {
        setMessage(data.message || "Delete failed");
      }
    } catch (error) {
      setMessage("Delete failed. Check backend.");
    } finally {
      setUpdatingId("");
    }
  };

  const statusColors = {
    pending: "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    accepted: "bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    "on-the-way": "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    "in-progress": "bg-violet-100 dark:bg-violet-950/50 text-violet-800 dark:text-violet-300 border-violet-200 dark:border-violet-800",
    completed: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    cancelled: "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  } as Record<string, string>;

  const getStatusClass = (status: string) => statusColors[status] || "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
                Bookings Management & Dispatch
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Monitor customer requests, verify provider availability, and manage reassignments
              </p>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`mb-6 rounded-2xl p-4 text-xs font-bold border ${
            message.includes("success") || message.includes("updated") || message.includes("reassigned")
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
          }`}>
            {message}
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Booking ID, Customer name, Mobile, Service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-8 py-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200 shadow-sm focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="on-the-way">On The Way</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Bookings List Card */}
        <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl shadow-slate-100 dark:shadow-black/50">
          {bookings.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto h-16 w-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl mb-3">📋</div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No bookings match criteria</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Try adjusting your search query or status filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const isProviderUnavailable = booking.provider && booking.provider.isAvailable === false;
                return (
                  <div 
                    key={booking._id} 
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 p-5 shadow-sm space-y-4 hover:border-blue-300 dark:hover:border-blue-800 transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Left: Service & Customer Info */}
                      <div className="flex flex-1 items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-2xl shadow-sm">
                          {servicesById[booking.serviceType]?.icon || "🧰"}
                        </div>

                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                              {servicesById[booking.serviceType]?.name || booking.serviceType}
                            </h2>
                            <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                              #{booking._id.slice(-6).toUpperCase()}
                            </span>
                            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider border ${getStatusClass(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <p className="flex items-center gap-1.5 truncate">
                              <User className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                              <strong className="text-slate-800 dark:text-slate-200">{booking.customerName || booking.user?.username || "N/A"}</strong>
                            </p>
                            {booking.customerPhone && (
                              <p className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                <span className="font-mono">{booking.customerPhone}</span>
                              </p>
                            )}
                            <p className="flex items-center gap-1.5 sm:col-span-2 truncate">
                              <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                              <span className="truncate">{booking.address?.fullAddress || "No address provided"}, {booking.address?.city}</span>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              <span>Date: {booking.preferredDate ? new Date(booking.preferredDate).toLocaleDateString() : new Date(booking.createdAt).toLocaleDateString()}</span>
                            </p>
                            {booking.preferredTime && (
                              <p className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                <span>Slot: {booking.preferredTime}</span>
                              </p>
                            )}
                          </div>

                          {/* Provider Info Pill */}
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-xs text-slate-400">Assigned Provider:</span>
                            {booking.provider ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {booking.provider.name}
                                </span>
                                {isProviderUnavailable ? (
                                  <span className="rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 px-2 py-0.5 text-[10px] font-black text-rose-700 dark:text-rose-400">
                                    Provider Unavailable (Offline)
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                    Online
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-2 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-400">
                                Unassigned
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Admin Action Controls */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                        {/* Status Dropdown */}
                        <div className="flex flex-col gap-1">
                          <select
                            disabled={updatingId === booking._id || ['completed', 'cancelled'].includes(booking.status)}
                            value={booking.status}
                            onChange={(e) => updateStatus(booking._id, e.target.value)}
                            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="on-the-way">On The Way</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {['completed', 'cancelled'].includes(booking.status) && (
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-1">
                              Status Locked ({booking.status})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Reassign Button */}
                          <button
                            type="button"
                            disabled={['completed', 'cancelled'].includes(booking.status)}
                            onClick={() => {
                              setReassignModal({ open: true, booking });
                              setTargetProviderId(booking.provider?._id || "");
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-3 py-2 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Reassign</span>
                          </button>

                          {/* Reschedule Button */}
                          <button
                            type="button"
                            disabled={['completed', 'cancelled'].includes(booking.status)}
                            onClick={() => {
                              setRescheduleModal({ open: true, booking });
                              setRescheduleDate(booking.preferredDate ? toLocalDateInput(new Date(booking.preferredDate)) : toLocalDateInput(new Date()));
                              setRescheduleTime(booking.preferredTime || "09:00 AM - 11:00 AM");
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Reschedule</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/booking/${booking._id}`)}
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                          >
                            <span>Live Tracking</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>

                          <button
                            onClick={() => deleteBooking(booking._id)}
                            disabled={updatingId === booking._id}
                            className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition disabled:opacity-50"
                            title="Delete Booking Record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reassign Provider Modal */}
      {reassignModal.open && reassignModal.booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Reassign Service Provider
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an approved provider for booking #{reassignModal.booking._id.slice(-6).toUpperCase()} ({reassignModal.booking.serviceType}).
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Eligible Provider
              </label>
              <select
                value={targetProviderId}
                onChange={(e) => setTargetProviderId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
              >
                <option value="">-- Choose a verified provider --</option>
                {providers.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.isAvailable !== false ? 'Online' : 'Offline'}{!p.isApproved ? ' - Unapproved' : ''})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Override Reason (Required if provider is offline)
              </label>
              <input
                type="text"
                placeholder="e.g. Urgent customer escalation or direct provider confirmation"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleReassign}
                disabled={!targetProviderId || updatingId === reassignModal.booking._id}
                className="flex-1 rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                Confirm Reassignment
              </button>
              <button
                type="button"
                onClick={() => setReassignModal({ open: false, booking: null })}
                className="rounded-2xl border border-slate-300 dark:border-slate-700 py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Booking Modal */}
      {rescheduleModal.open && rescheduleModal.booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Reschedule Booking Date & Slot
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update scheduled arrival for booking #{rescheduleModal.booking._id.slice(-6).toUpperCase()}.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Date
              </label>
              <input
                type="date"
                required
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Time Slot
              </label>
              <select
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
              >
                <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM</option>
              </select>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleReschedule}
                disabled={!rescheduleDate || updatingId === rescheduleModal.booking._id}
                className="flex-1 rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                Confirm Reschedule
              </button>
              <button
                type="button"
                onClick={() => setRescheduleModal({ open: false, booking: null })}
                className="rounded-2xl border border-slate-300 dark:border-slate-700 py-3 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
