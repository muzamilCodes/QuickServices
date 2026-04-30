'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, MapPin, Calendar, Phone, User, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface BookingDetail {
  _id: string;
  user: { username: string; email: string };
  provider?: { name: string; phone: string };
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  address: { fullAddress: string; city: string; pincode: string };
  status: string;
  description: string;
  createdAt: string;
}

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:4000";

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const fetchBooking = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setBooking(data.booking);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (isAuthenticated) fetchBooking();
  }, [isAuthenticated, fetchBooking]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "accepted": return "bg-blue-100 text-blue-800";
      case "in-progress": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  if (!booking) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Booking not found</h2>
        <button onClick={() => router.push("/dashboard")} className="mt-4 text-blue-600">Go to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <button 
          onClick={() => router.back()} 
          className="mb-6 inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-[28px] bg-white p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-slate-950">Booking Details</h1>
            <span className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-slate-900">{booking.serviceType}</h3>
              <p className="text-sm text-slate-500">Service Type</p>
            </div>

<div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Date & Time</p>
                  <p className="font-medium">{booking.preferredDate ? new Date(booking.preferredDate).toLocaleDateString() : 'Not specified'} at {booking.preferredTime || 'Any time'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Address</p>
                  <p className="font-medium">{booking.address?.fullAddress}, {booking.address?.city} - {booking.address?.pincode}</p>
                </div>
              </div>
            </div>

            {booking.description && (
              <div>
                <p className="text-sm text-slate-500 mb-1">Description</p>
                <p className="text-slate-900">{booking.description}</p>
              </div>
            )}

            <div className="border-t pt-6">
              <h4 className="font-medium mb-3">Customer Details</h4>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium">{booking.user?.username}</p>
                  <p className="text-sm text-slate-500">{booking.user?.email}</p>
                </div>
              </div>
            </div>

            {booking.provider && (
              <div className="border-t pt-6">
                <h4 className="font-medium mb-3">Provider Details</h4>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium">{booking.provider.name}</p>
                    <p className="text-sm text-slate-500">{booking.provider.phone}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-slate-500">
              Booked on: {new Date(booking.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
