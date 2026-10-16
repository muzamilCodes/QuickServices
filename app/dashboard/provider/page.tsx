'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BriefcaseBusiness, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Navigation, 
  Phone, 
  Radio, 
  ShieldCheck, 
  Star, 
  User, 
  Wrench, 
  XCircle,
  LocateFixed,
  Save,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { getApiBaseUrl } from '@/lib/apiBase';
import { servicesById } from '@/lib/services';

interface ProviderProfile {
  _id: string;
  name: string;
  phone: string;
  email: string;
  category: string;
  services: string[];
  experience: number;
  skills: string[];
  qualifications: string;
  serviceArea: string;
  location?: { city?: string; address?: string; lat?: number; lng?: number };
  pricePerHour: number;
  pricingDetails: string;
  availability?: { days?: string[]; hours?: string };
  description: string;
  profilePicture: string;
  isApproved: boolean;
  isAvailable: boolean;
  rating: number;
  totalRatings: number;
  completedBookings: number;
}

interface BookingItem {
  _id: string;
  serviceType: string;
  customerName: string;
  customerPhone: string;
  address?: { fullAddress?: string; city?: string; pincode?: string };
  description?: string;
  preferredDate?: string;
  preferredTime?: string;
  status: string;
  amount?: number;
  createdAt: string;
}

export default function ProviderDashboardPage() {
  const router = useRouter();
  const API_URL = getApiBaseUrl();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>('bookings');
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [assignedBookings, setAssignedBookings] = useState<BookingItem[]>([]);
  const [availableBookings, setAvailableBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Edit profile state
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    category: '',
    experience: 2,
    qualifications: '',
    serviceArea: '',
    city: '',
    address: '',
    pricePerHour: 499,
    pricingDetails: '',
    workingHours: '',
    description: '',
    profilePicture: '',
    isAvailable: true
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchProviderData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [profRes, bookRes] = await Promise.all([
        fetch(`${API_URL}/providers/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/providers/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const profData = await profRes.json();
      const bookData = await bookRes.json();

      if (profData.success && profData.provider) {
        setProvider(profData.provider);
        setEditForm({
          name: profData.provider.name || '',
          phone: profData.provider.phone || '',
          category: profData.provider.category || '',
          experience: profData.provider.experience || 2,
          qualifications: profData.provider.qualifications || '',
          serviceArea: profData.provider.serviceArea || '',
          city: profData.provider.location?.city || '',
          address: profData.provider.location?.address || '',
          pricePerHour: profData.provider.pricePerHour || 499,
          pricingDetails: profData.provider.pricingDetails || '',
          workingHours: profData.provider.availability?.hours || '08:00 AM - 08:00 PM',
          description: profData.provider.description || '',
          profilePicture: profData.provider.profilePicture || '/hero-user.jpg',
          isAvailable: profData.provider.isAvailable !== false
        });
      }

      if (bookData.success) {
        setAssignedBookings(bookData.assignedBookings || []);
        setAvailableBookings(bookData.availableBookings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      void fetchProviderData();
    }
  }, [authLoading, fetchProviderData, isAuthenticated, router]);

  // Handle Accept or Reject
  const handleBookingAction = async (bookingId: string, action: 'accept' | 'reject') => {
    setActionLoadingId(bookingId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/providers/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(action === 'accept' ? 'Booking Accepted!' : 'Booking Declined');
        void fetchProviderData();
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Provider Status Updates (on-the-way, in-progress, completed)
  const updateStatus = async (bookingId: string, newStatus: string) => {
    setActionLoadingId(bookingId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Booking status changed to: ${newStatus}`);
        void fetchProviderData();
      } else {
        toast.error(data.message || 'Status update failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Save profile edits
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/providers/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editForm.name,
          phone: editForm.phone,
          category: editForm.category,
          experience: Number(editForm.experience),
          qualifications: editForm.qualifications,
          serviceArea: editForm.serviceArea,
          pricePerHour: Number(editForm.pricePerHour),
          pricingDetails: editForm.pricingDetails,
          availability: { hours: editForm.workingHours },
          description: editForm.description,
          profilePicture: editForm.profilePicture,
          isAvailable: editForm.isAvailable,
          location: { city: editForm.city, address: editForm.address }
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Professional profile updated successfully!');
        setProvider(data.provider);
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch {
      toast.error('Error saving profile');
    } finally {
      setSavingProfile(false);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 font-semibold">Loading Provider Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Provider Hero Bar */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-2xl font-black text-white shadow-lg">
                {provider?.name ? provider.name.charAt(0) : 'P'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {provider?.name || user?.username}
                  </h1>
                  {provider?.isApproved ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified Pro
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30">
                      Pending Approval
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                  <span>{provider?.category || 'Service Specialist'}</span>
                  <span>•</span>
                  <span>📞 {provider?.phone || user?.mobile}</span>
                  <span>•</span>
                  <span>📍 {provider?.location?.city || 'Kashmir'}</span>
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 backdrop-blur text-center text-xs">
              <div className="px-3">
                <p className="text-slate-400 font-semibold">Active Jobs</p>
                <p className="text-xl font-black text-white">{assignedBookings.length}</p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="px-3">
                <p className="text-slate-400 font-semibold">Rating</p>
                <p className="text-xl font-black text-amber-300">★ {provider?.rating || '4.8'}</p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="px-3">
                <p className="text-slate-400 font-semibold">Experience</p>
                <p className="text-xl font-black text-emerald-300">{provider?.experience || 2} yrs</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-4">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`rounded-full px-5 py-2 text-xs font-bold transition ${
                activeTab === 'bookings'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              My Bookings & Incoming Jobs ({assignedBookings.length + availableBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`rounded-full px-5 py-2 text-xs font-bold transition ${
                activeTab === 'profile'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Edit Professional Profile
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* ==================== TAB 1: BOOKINGS ==================== */}
        {activeTab === 'bookings' && (
          <div className="space-y-8">
            
            {/* 1. Assigned Jobs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-600" /> My Assigned Service Requests
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  {assignedBookings.length} bookings
                </span>
              </div>

              {assignedBookings.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                  No active assigned bookings yet. Check incoming job requests below!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {assignedBookings.map((b) => (
                    <div key={b._id} className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md hover:shadow-lg transition space-y-4">
                      
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                            {servicesById[b.serviceType]?.icon || '🔧'}
                          </span>
                          <div>
                            <h3 className="font-extrabold text-base text-slate-950">
                              {servicesById[b.serviceType]?.name || b.serviceType}
                            </h3>
                            <p className="text-xs font-mono text-slate-500">
                              ID: #{b._id.slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </div>

                        <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${
                          b.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                          b.status === 'on-the-way' ? 'bg-blue-50 text-blue-700 animate-pulse' :
                          b.status === 'in-progress' ? 'bg-purple-50 text-purple-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {b.status}
                        </span>
                      </div>

                      {/* Customer contact & address */}
                      <div className="rounded-2xl bg-slate-50 p-4 space-y-2 text-xs text-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">Customer: {b.customerName}</span>
                          <a
                            href={`tel:${b.customerPhone}`}
                            className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline"
                          >
                            <Phone className="h-3.5 w-3.5" /> {b.customerPhone}
                          </a>
                        </div>
                        <div className="flex items-start gap-1.5 text-slate-600">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
                          <span>{b.address?.fullAddress}, {b.address?.city}</span>
                        </div>
                        {b.description && (
                          <p className="text-slate-500 italic pt-1 border-t border-slate-200/60">
                            &quot;{b.description}&quot;
                          </p>
                        )}
                      </div>

                      {/* Provider Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => router.push(`/dashboard/booking/${b._id}`)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                        >
                          <Navigation className="h-3.5 w-3.5 text-orange-400" />
                          Open Live GPS Radar
                        </button>

                        {b.status === 'accepted' && (
                          <button
                            onClick={() => void updateStatus(b._id, 'on-the-way')}
                            disabled={actionLoadingId === b._id}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                          >
                            <LocateFixed className="h-3.5 w-3.5" />
                            I am On The Way
                          </button>
                        )}

                        {b.status === 'on-the-way' && (
                          <button
                            onClick={() => void updateStatus(b._id, 'in-progress')}
                            disabled={actionLoadingId === b._id}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700"
                          >
                            <Wrench className="h-3.5 w-3.5" />
                            Start Job Now
                          </button>
                        )}

                        {b.status === 'in-progress' && (
                          <button
                            onClick={() => void updateStatus(b._id, 'completed')}
                            disabled={actionLoadingId === b._id}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Mark Completed
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Incoming Available Jobs (Unassigned) */}
            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
                  <Radio className="h-5 w-5 text-orange-600 animate-pulse" /> Available Service Jobs Nearby
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  {availableBookings.length} requests
                </span>
              </div>

              {availableBookings.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 text-xs">
                  No new unassigned requests in your category right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableBookings.map((req) => (
                    <div key={req._id} className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">
                          {servicesById[req.serviceType]?.name || req.serviceType}
                        </span>
                        <span className="font-mono font-bold text-emerald-700 text-sm">
                          ₹{req.amount || 499}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        📍 {req.address?.fullAddress}, {req.address?.city}
                      </p>
                      {req.description && (
                        <p className="text-xs text-slate-500 italic bg-white p-2.5 rounded-xl border border-amber-100">
                          &quot;{req.description}&quot;
                        </p>
                      )}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => void handleBookingAction(req._id, 'accept')}
                          disabled={actionLoadingId === req._id}
                          className="flex-1 rounded-xl bg-slate-950 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                        >
                          Accept Booking
                        </button>
                        <button
                          onClick={() => void handleBookingAction(req._id, 'reject')}
                          disabled={actionLoadingId === req._id}
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                        >
                          Ignore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================== TAB 2: PROFILE MANAGEMENT ==================== */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSave} className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-950">Edit Professional Profile</h2>
                <p className="text-xs text-slate-500">Update your trade skills, pricing, and operational coverage.</p>
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trade Category</label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
                <input
                  type="number"
                  value={editForm.experience}
                  onChange={(e) => setEditForm({ ...editForm, experience: Number(e.target.value) })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Starting Visit Price (₹)</label>
                <input
                  type="number"
                  value={editForm.pricePerHour}
                  onChange={(e) => setEditForm({ ...editForm, pricePerHour: Number(e.target.value) })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Working Hours</label>
                <input
                  type="text"
                  value={editForm.workingHours}
                  onChange={(e) => setEditForm({ ...editForm, workingHours: e.target.value })}
                  placeholder="08:00 AM - 08:00 PM"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Base City</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Coverage Area</label>
                <input
                  type="text"
                  value={editForm.serviceArea}
                  onChange={(e) => setEditForm({ ...editForm, serviceArea: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications & Certifications</label>
                <input
                  type="text"
                  value={editForm.qualifications}
                  onChange={(e) => setEditForm({ ...editForm, qualifications: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Profile Picture URL</label>
                <input
                  type="text"
                  value={editForm.profilePicture}
                  onChange={(e) => setEditForm({ ...editForm, profilePicture: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Professional Bio Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 p-3.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-slate-800 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
