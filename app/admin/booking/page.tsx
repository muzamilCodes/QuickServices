'use client';

import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, MapPin, Search, Filter, User, Phone, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { servicesById } from "@/lib/services";

interface Booking {
  _id: string;
  serviceType: string;
  status: string;
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  address?: {
    fullAddress?: string;
    city?: string;
    pincode?: string;
  };
  user?: {
    username?: string;
    email?: string;
  };
  assignedProvider?: {
    _id: string;
    name: string;
  };
}

interface Provider {
  _id: string;
  name: string;
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const API_URL = "http://localhost:4000";

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const fetchBookings = useCallback(async () => {
    try {
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
  }, [page, searchTerm, statusFilter]);

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
  }, []);

  const updateStatus = async (bookingId: string, status: string, assignedProvider?: string) => {
    setUpdatingId(bookingId);
    try {
      const body = { status, provider: assignedProvider };
      const res = await fetch(`${API_URL}/admin/bookings/${bookingId}`, {
        method: "PUT",
        headers: { ...getHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Status updated successfully!");
        await fetchBookings();
      } else {
        setMessage(data.message || "Update failed");
      }
    } catch (error) {
      setMessage("Update failed. Check backend.");
    } finally {
      setUpdatingId("");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProviders();
      fetchBookings();
    }
  }, [isAuthenticated, fetchBookings, fetchProviders]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch = !searchTerm || 
        booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const statusColors = {
    pending: "bg-amber-50 text-amber-700",
    accepted: "bg-blue-50 text-blue-700",
    "in-progress": "bg-violet-50 text-violet-700",
    completed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-rose-50 text-rose-700",
  } as Record<string, string>;

  const getStatusClass = (status: string) => statusColors[status] || "bg-slate-100 text-slate-700";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">All Bookings</h1>
            <p className="mt-2 text-slate-600">Manage all service requests across all users</p>
          </div>
        </div>


        {message && (
          <div className={`mb-6 rounded-2xl p-4 ${message.includes("success") ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
            {message}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer, service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
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
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="rounded-[28px] bg-white/90 p-6 shadow-xl shadow-slate-100">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-20">
              <div className="mx-auto h-16 w-16 rounded-3xl bg-slate-100 p-4">📋</div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">No bookings match your filter</h3>
              <p className="mt-2 text-slate-600">Try adjusting your search or status filter</p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredBookings.map((booking) => (
                <div key={booking._id} className="rounded-2xl border border-black/5 bg-white p-6 shadow-lg">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex flex-1 gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                        {servicesById[booking.serviceType]?.icon || "🧰"}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-semibold text-slate-950">
                            {servicesById[booking.serviceType]?.name || booking.serviceType}
                          </h2>
                          <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusClass(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600">
                          <p><User className="inline h-4 w-4 mr-1" /> {booking.customerName || booking.user?.username || "N/A"}</p>
                          {booking.customerPhone && <p><Phone className="inline h-4 w-4 mr-1" /> {booking.customerPhone}</p>}
                          {booking.user?.email && <p>{booking.user.email}</p>}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.address?.fullAddress || "No address"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays className="h-4 w-4" />
                          <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 lg:items-end">
                      <div className="flex gap-2">
                        <select
                          disabled={updatingId === booking._id}
                          onChange={(e) => updateStatus(booking._id, e.target.value)}
                          defaultValue={booking.status}
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <select
                          onChange={(e) => updateStatus(booking._id, booking.status, e.target.value)}
                          defaultValue={booking.assignedProvider?._id || ""}
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">No Provider</option>
                          {providers.map((provider) => (
                            <option key={provider._id} value={provider._id}>
                              {provider.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => router.push(`/dashboard/booking/${booking._id}`)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {filteredBookings.length > 0 && (
            <div className="mt-8 flex items-center justify-center">
              <button
                disabled={loading}
                onClick={() => setPage(page + 1)}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

