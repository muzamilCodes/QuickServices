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
  AlertCircle,
  Plus,
  Trash2,
  Layers,
  IndianRupee,
  Images,
  Upload,
  Timer,
  Calculator,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { getApiBaseUrl } from '@/lib/apiBase';
import { servicesById } from '@/lib/services';
import AccountDeletionSection from '@/components/AccountDeletionSection';

interface CustomService {
  name: string;
  category?: string;
  image?: string;
  price: number;
  priceUnit?: string;
  pricingUnit?: 'per_hour' | 'per_visit' | 'per_day' | 'per_job' | string;
  hourlyRate?: number;
  minDurationHours?: number;
  additionalTimeBilling?: '30 minutes' | '1 hour' | string;
  visitingCharges?: number;
  materialCharges?: number;
  estimatedLabourCost?: number;
  totalEstimatedPrice?: number;
  description?: string;
  details?: string[];
  status?: 'pending' | 'approved' | 'rejected';
  isApproved?: boolean;
  submissionId?: string;
}

interface ProviderProfile {
  _id: string;
  name: string;
  phone: string;
  email: string;
  category: string;
  services: string[];
  customServices?: CustomService[];
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

const CATEGORY_OPTIONS = [
  'Plumbing',
  'Electrical works',
  'House section',
  'Appliances',
  'Carpentry',
  'Painting',
  'General Maintenance',
  'Landscaping',
  'Personal Care',
  'Water Purifier & RO',
  'Pest Control'
];

export default function ProviderDashboardPage() {
  const router = useRouter();
  const API_URL = getApiBaseUrl();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'profile'>('bookings');
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [assignedBookings, setAssignedBookings] = useState<BookingItem[]>([]);
  const [availableBookings, setAvailableBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // New Service Form State with Dynamic Pricing Units
  const [newService, setNewService] = useState({
    name: '',
    category: 'Plumbing',
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
    pricingUnit: 'per_hour' as 'per_hour' | 'per_visit' | 'per_day' | 'per_job',
    hourlyRate: 300,
    minDurationHours: 2,
    additionalTimeBilling: '1 hour' as '30 minutes' | '1 hour',
    visitingCharges: 0,
    materialCharges: 0,
    basePrice: 499,
    description: '',
    details: ''
  });
  const [addingService, setAddingService] = useState(false);

  // Automatic labour and total cost calculation
  const calculatedLabourCost = newService.pricingUnit === 'per_hour'
    ? (Math.max(0, Number(newService.hourlyRate) || 0) * Math.max(1, Number(newService.minDurationHours) || 1))
    : Math.max(0, Number(newService.basePrice) || 0);

  const calculatedTotalEstimatedPrice = calculatedLabourCost +
    Math.max(0, Number(newService.visitingCharges) || 0) +
    Math.max(0, Number(newService.materialCharges) || 0);

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

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    // Try server multipart upload first
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_URL}/providers/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        const fullUrl = data.url.startsWith('http') ? data.url : `${API_URL}${data.url}`;
        setEditForm((prev) => ({ ...prev, profilePicture: fullUrl }));
        toast.success('Profile photo uploaded!');
        return;
      }
    } catch {
      // fallback to FileReader
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditForm((prev) => ({ ...prev, profilePicture: reader.result as string }));
      toast.success('Profile photo loaded from device!');
    };
    reader.readAsDataURL(file);
  };

  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    // Immediate local preview for responsive UI
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewService((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);

    // Upload to server endpoint to keep payload light
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_URL}/providers/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        const fullUrl = data.url.startsWith('http') ? data.url : `${API_URL}${data.url}`;
        setNewService((prev) => ({ ...prev, image: fullUrl }));
        toast.success('Service photo uploaded successfully!');
        return;
      }
    } catch {
      // already set base64 preview via reader
    }
  };

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
      if (user?.role !== 'provider' && !user?.isAdmin) {
        toast.error('Access Denied: Provider Workspace is reserved for verified Service Providers only.');
        router.push('/dashboard');
        return;
      }
      void fetchProviderData();
    }
  }, [authLoading, fetchProviderData, isAuthenticated, router, user]);

  // Handle Toggle Online / Offline
  const handleToggleOnline = async (newOnlineState: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/providers/me/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: newOnlineState })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(newOnlineState ? 'You are now ONLINE and ready for bookings!' : 'You are now OFFLINE.');
        void fetchProviderData();
      } else {
        toast.error(data.message || 'Failed to update availability');
      }
    } catch {
      toast.error('Network error');
    }
  };

  // Handle Accept or Reject
  const handleBookingAction = async (bookingId: string, action: 'accept' | 'reject') => {
    let reason = '';
    if (action === 'reject') {
      const inputReason = window.prompt('Please provide a reason for declining this booking request (optional):', 'Scheduling conflict or outside service area');
      if (inputReason === null) return; // User cancelled prompt
      reason = inputReason;
    }

    setActionLoadingId(bookingId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/providers/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, reason })
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

  // Handle Adding a New Custom Service
  const handleAddCustomService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name.trim()) {
      toast.error('Please enter service name');
      return;
    }

    if (newService.pricingUnit === 'per_hour') {
      if (!newService.hourlyRate || Number(newService.hourlyRate) <= 0) {
        toast.error('Please enter a valid Hourly Rate greater than ₹0');
        return;
      }
      if (!newService.minDurationHours || Number(newService.minDurationHours) < 1) {
        toast.error('Minimum booking duration must be at least 1 hour');
        return;
      }
    } else {
      if (!newService.basePrice || Number(newService.basePrice) <= 0) {
        toast.error('Please enter a valid Service Price greater than ₹0');
        return;
      }
    }

    setAddingService(true);
    try {
      const token = localStorage.getItem('token');
      const detailsList = newService.details
        ? newService.details.split(',').map(s => s.trim()).filter(Boolean)
        : [newService.description || newService.name];

      // Submit directly to Admin for approval
      const res = await fetch(`${API_URL}/providers/submit-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newService.name.trim(),
          category: newService.category || 'General Maintenance',
          image: newService.image || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
          pricingUnit: newService.pricingUnit,
          hourlyRate: Number(newService.hourlyRate) || 0,
          minDurationHours: Number(newService.minDurationHours) || 1,
          additionalTimeBilling: newService.additionalTimeBilling,
          visitingCharges: Number(newService.visitingCharges) || 0,
          materialCharges: Number(newService.materialCharges) || 0,
          price: calculatedTotalEstimatedPrice,
          priceUnit: newService.pricingUnit === 'per_hour' ? 'hour' : (newService.pricingUnit === 'per_day' ? 'day' : (newService.pricingUnit === 'per_job' ? 'job' : 'visit')),
          description: newService.description || newService.name.trim(),
          details: detailsList
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('🎉 Service submitted to Admin for approval! Once approved, it will go live on the website.');
        setNewService({
          name: '',
          category: 'Plumbing',
          image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
          pricingUnit: 'per_hour',
          hourlyRate: 300,
          minDurationHours: 2,
          additionalTimeBilling: '1 hour',
          visitingCharges: 0,
          materialCharges: 0,
          basePrice: 499,
          description: '',
          details: ''
        });
        void fetchProviderData();
      } else {
        toast.error(data.message || 'Failed to submit service');
      }
    } catch {
      toast.error('Network error submitting service');
    } finally {
      setAddingService(false);
    }
  };

  // Handle Deleting a Custom Service
  const handleDeleteCustomService = async (index: number) => {
    if (!confirm('Remove this service from your offerings?')) return;
    try {
      const token = localStorage.getItem('token');
      const existing = provider?.customServices || [];
      const updated = existing.filter((_, i) => i !== index);

      const res = await fetch(`${API_URL}/providers/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ customServices: updated })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Service removed');
        void fetchProviderData();
      }
    } catch {
      toast.error('Network error');
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
          location: {
            city: editForm.city,
            address: editForm.address
          },
          pricePerHour: Number(editForm.pricePerHour),
          pricingDetails: editForm.pricingDetails,
          availability: {
            hours: editForm.workingHours
          },
          description: editForm.description,
          profilePicture: editForm.profilePicture,
          isAvailable: editForm.isAvailable
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Profile updated successfully!');
        void fetchProviderData();
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch {
      toast.error('Network error saving profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Strict Role Guard: Only providers and admin can view this dashboard
  if (!authLoading && user && user.role !== 'provider' && !user.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full rounded-3xl bg-white p-8 text-center shadow-xl border border-slate-200 space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <BriefcaseBusiness className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Yeh workspace sirf registered <strong>Service Providers (Pro)</strong> ke liye hai. Customer accounts yahan access nahi kar sakte.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full rounded-2xl bg-slate-950 py-3 text-xs font-bold text-white hover:bg-slate-800 transition shadow-md"
          >
            Go to My Customer Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="text-xs font-bold text-slate-500">Loading Provider Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      
      {/* Top Banner / Pro Profile Summary */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white pt-10 pb-6 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            
            {/* Identity Info */}
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-3xl overflow-hidden border-2 border-white/20 bg-slate-800 shadow-xl shrink-0">
                <img
                  src={provider?.profilePicture || '/hero-user.jpg'}
                  alt={provider?.name || 'Provider'}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/hero-user.jpg';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-extrabold tracking-tight">
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

            {/* Availability Toggle & Quick Metrics */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Go Online / Go Offline Button */}
              <button
                type="button"
                onClick={() => handleToggleOnline(!provider?.isAvailable)}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-black transition border shadow-lg ${
                  provider?.isAvailable
                    ? 'bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600 shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${provider?.isAvailable ? 'bg-white animate-pulse' : 'bg-rose-500'}`} />
                <span>{provider?.isAvailable ? 'STATUS: ONLINE (Accepting Jobs)' : 'STATUS: OFFLINE (Paused)'}</span>
              </button>

              <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 backdrop-blur text-center text-xs">
                <div className="px-3">
                  <p className="text-slate-400 font-semibold">Active Jobs</p>
                  <p className="text-xl font-black text-white">{assignedBookings.length}</p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="px-3">
                  <p className="text-slate-400 font-semibold">Services</p>
                  <p className="text-xl font-black text-emerald-300">
                    {(provider?.services?.length || 0) + (provider?.customServices?.length || 0)}
                  </p>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div className="px-3">
                  <p className="text-slate-400 font-semibold">Rating</p>
                  <p className="text-xl font-black text-amber-300">★ {provider?.rating || '4.8'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex flex-wrap items-center gap-2 sm:gap-3 border-t border-white/10 pt-4">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`rounded-full px-5 py-2 text-xs font-bold transition ${
                activeTab === 'bookings'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              My Bookings & Jobs ({assignedBookings.length + availableBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`rounded-full px-5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'services'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>My Services & Add Service</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`rounded-full px-5 py-2 text-xs font-bold transition ${
                activeTab === 'profile'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Verification Status Notice */}
        {provider && !provider.isApproved && (
          <div className="mb-8 rounded-3xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shrink-0">
                <Clock className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-amber-950">
                    Application Under Admin Review / Verification Pending
                  </h3>
                  <span className="rounded-full bg-amber-200 text-amber-900 px-2.5 py-0.5 text-[10px] font-black uppercase">
                    Verification In Progress
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-amber-800 leading-relaxed">
                  Aapka Service Provider profile submit ho chuka hai aur Admin verification ke liye queued hai. Jaise hi Admin approve karega, aap direct bookings accept kar sakenge.
                </p>
              </div>
            </div>
          </div>
        )}

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
                            <p className="text-xs text-slate-500">Booking #{b._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>

                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                          b.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'on-the-way'
                            ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                            : b.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {b.status}
                        </span>
                      </div>

                      {/* Customer Details & Address */}
                      <div className="rounded-2xl bg-slate-50 p-3.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Customer:</span>
                          <span className="font-bold text-slate-900">{b.customerName || 'Customer'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Address:</span>
                          <span className="font-medium text-slate-800 text-right max-w-[220px]">
                            {b.address?.fullAddress || 'Address on file'}, {b.address?.city || ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Preferred Slot:</span>
                          <span className="font-medium text-slate-800">
                            {b.preferredDate || 'Express'} • {b.preferredTime || 'ASAP'}
                          </span>
                        </div>
                        {b.amount && (
                          <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                            <span className="font-bold text-slate-600">Earnings / Price:</span>
                            <span className="font-extrabold text-emerald-600 font-mono">₹{b.amount}</span>
                          </div>
                        )}
                      </div>

                      {/* Contact & Navigation Buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <a
                          href={`tel:${b.customerPhone}`}
                          className="flex items-center justify-center gap-1 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                        >
                          <Phone className="h-3.5 w-3.5" /> Call
                        </a>
                        <a
                          href={`https://wa.me/91${b.customerPhone?.replace(/\D/g, '').slice(-10)}?text=Hello%20${encodeURIComponent(b.customerName || 'Customer')},%20I%20am%20your%20QuickServices%20Technician%20for%20booking%20#${b._id.slice(-6)}.`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                        </a>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent((b.address?.fullAddress || '') + ' ' + (b.address?.city || ''))}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1 rounded-xl border border-slate-300 bg-slate-100 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-200 transition"
                        >
                          <MapPin className="h-3.5 w-3.5 text-red-600" /> Navigate
                        </a>
                      </div>

                      {/* If pending, provider must accept or reject */}
                      {b.status === 'pending' && (
                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleBookingAction(b._id, 'accept')}
                            disabled={actionLoadingId === b._id}
                            className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
                          >
                            Accept Booking
                          </button>
                          <button
                            onClick={() => handleBookingAction(b._id, 'reject')}
                            disabled={actionLoadingId === b._id}
                            className="flex-1 rounded-xl border border-rose-300 bg-rose-50 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                          >
                            Reject (Provide Reason)
                          </button>
                        </div>
                      )}

                      {/* Terminal State Banner: Completed */}
                      {b.status === 'completed' && (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            Job Completed Successfully (Status Locked)
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Final</span>
                        </div>
                      )}

                      {/* Terminal State Banner: Cancelled */}
                      {b.status === 'cancelled' && (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-rose-800 bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200">
                            <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                            Booking Cancelled (Status Locked)
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Final</span>
                        </div>
                      )}

                      {/* Status Stepper Actions (ONLY if accepted, on-the-way, or in-progress) */}
                      {['accepted', 'on-the-way', 'in-progress'].includes(b.status) && (
                        <div className="pt-2 border-t border-slate-100">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Update Job Progress:
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => updateStatus(b._id, 'on-the-way')}
                              disabled={actionLoadingId === b._id}
                              className={`rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1 ${
                                b.status === 'on-the-way'
                                  ? 'bg-indigo-600 text-white shadow-md'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              <Navigation className="h-3 w-3" /> On Way
                            </button>

                            <button
                              onClick={() => updateStatus(b._id, 'in-progress')}
                              disabled={actionLoadingId === b._id}
                              className={`rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1 ${
                                b.status === 'in-progress'
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              <Wrench className="h-3 w-3" /> In Progress
                            </button>

                            <button
                              onClick={() => updateStatus(b._id, 'completed')}
                              disabled={actionLoadingId === b._id}
                              className="rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1 bg-emerald-600 text-white shadow-md hover:bg-emerald-700"
                            >
                              <CheckCircle2 className="h-3 w-3" /> Complete
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Can no longer attend? Mark unavailable */}
                      {['accepted', 'on-the-way'].includes(b.status) && (
                        <button
                          type="button"
                          onClick={() => handleBookingAction(b._id, 'reject')}
                          className="w-full text-center text-[11px] font-bold text-rose-600 hover:underline pt-1"
                        >
                          Cannot attend this job? Mark unavailable & request reassignment
                        </button>
                      )}

                      {/* Live GPS Tracking Link */}
                      <button
                        onClick={() => router.push(`/dashboard/booking/${b._id}`)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95"
                      >
                        <LocateFixed className="h-3.5 w-3.5" /> Open Live GPS Tracking Map
                      </button>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Available Incoming Requests */}
            <div className="pt-8 border-t border-slate-200">
              <h2 className="text-xl font-extrabold text-slate-950 mb-4 flex items-center gap-2">
                <Radio className="h-5 w-5 text-amber-500" /> Unassigned Incoming Requests
              </h2>

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

        {/* ==================== TAB 2: MY SERVICES & ADD SERVICE ==================== */}
        {activeTab === 'services' && (
          <div className="space-y-8">
            
            {/* Add Service Card */}
            <div className="rounded-3xl border border-orange-200 bg-white p-6 sm:p-8 shadow-lg">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-950">Add a New Service Offering</h2>
                  <p className="text-xs text-slate-500">Apni nayi service add karein with image, description, and upfront pricing.</p>
                </div>
              </div>

              <form onSubmit={handleAddCustomService} className="space-y-6">
                {/* 1. Basic Service Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Service Name / Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bathroom Leak Repair & Tap Fixing"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Service Category *
                    </label>
                    <input
                      type="text"
                      required
                      list="provider-category-options"
                      value={newService.category}
                      onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                      placeholder="e.g. Plumbing, Electrician, Carpet Repair"
                      className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none font-semibold text-slate-900"
                    />
                    <datalist id="provider-category-options">
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* 2. PRICING UNITS (Per Hour, Per Visit, Per Day, Per Job) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Pricing Unit * (Choose how you bill customers)
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">Set your own custom rate</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'per_hour', label: 'Per Hour', icon: '⏱️', desc: 'Hourly labor rate' },
                      { id: 'per_visit', label: 'Per Visit', icon: '🚪', desc: 'Flat per visit' },
                      { id: 'per_day', label: 'Per Day', icon: '📅', desc: 'Full day rate' },
                      { id: 'per_job', label: 'Per Job', icon: '🛠️', desc: 'Fixed lump sum' },
                    ].map((unit) => {
                      const isSelected = newService.pricingUnit === unit.id;
                      return (
                        <button
                          key={unit.id}
                          type="button"
                          onClick={() => setNewService({ ...newService, pricingUnit: unit.id as any })}
                          className={`rounded-2xl p-3 text-left border transition relative flex flex-col justify-between ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50/70 text-orange-950 shadow-sm ring-2 ring-orange-400/40'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xl">{unit.icon}</span>
                            {isSelected && (
                              <span className="h-2 w-2 rounded-full bg-orange-600" />
                            )}
                          </div>
                          <span className="text-xs font-extrabold">{unit.label}</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">{unit.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. DYNAMIC PRICING FIELDS */}
                {newService.pricingUnit === 'per_hour' ? (
                  <div className="rounded-2xl border border-orange-200/80 bg-orange-50/40 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-orange-600" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-orange-900">
                        Hourly Rate Configuration
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {/* Hourly Rate */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Hourly Rate (₹) *
                        </label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                          <input
                            type="number"
                            required
                            min={50}
                            placeholder="300"
                            value={newService.hourlyRate || ''}
                            onChange={(e) => setNewService({ ...newService, hourlyRate: Number(e.target.value) })}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:border-orange-500 focus:outline-none font-bold text-slate-900"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">e.g. ₹300 per hour</span>
                      </div>

                      {/* Minimum Booking Duration */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Minimum Booking Duration *
                        </label>
                        <select
                          value={newService.minDurationHours}
                          onChange={(e) => setNewService({ ...newService, minDurationHours: Number(e.target.value) })}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-orange-500 focus:outline-none"
                        >
                          <option value={1}>1 hour</option>
                          <option value={2}>2 hours (Recommended)</option>
                          <option value={3}>3 hours</option>
                          <option value={4}>4 hours</option>
                          <option value={6}>6 hours</option>
                          <option value={8}>8 hours (Full shift)</option>
                        </select>
                        <span className="text-[10px] text-slate-500">Minimum time billed to customer</span>
                      </div>

                      {/* Additional Time Billing */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Additional Time Billing *
                        </label>
                        <select
                          value={newService.additionalTimeBilling}
                          onChange={(e) => setNewService({ ...newService, additionalTimeBilling: e.target.value as any })}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-orange-500 focus:outline-none"
                        >
                          <option value="30 minutes">Every 30 minutes</option>
                          <option value="1 hour">Every 1 hour</option>
                        </select>
                        <span className="text-[10px] text-slate-500">Billing step for extra time</span>
                      </div>
                    </div>

                    {/* Optional Surcharges for Hourly */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-orange-200/50">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Optional Visiting Charges (₹)
                        </label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                          <input
                            type="number"
                            min={0}
                            placeholder="0 (Free visit)"
                            value={newService.visitingCharges || ''}
                            onChange={(e) => setNewService({ ...newService, visitingCharges: Number(e.target.value) })}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">Inspection/doorstep visit fee (optional)</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Optional Material Charges (₹)
                        </label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                          <input
                            type="number"
                            min={0}
                            placeholder="0 (Parts/materials as actuals)"
                            value={newService.materialCharges || ''}
                            onChange={(e) => setNewService({ ...newService, materialCharges: Number(e.target.value) })}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">Initial basic consumable/spare cost</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Fixed / Flat rate configuration (Per Visit, Per Day, Per Job) */
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Base Service Price (₹) *
                        </label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                          <input
                            type="number"
                            required
                            min={50}
                            placeholder="499"
                            value={newService.basePrice || ''}
                            onChange={(e) => setNewService({ ...newService, basePrice: Number(e.target.value) })}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:border-orange-500 focus:outline-none font-bold text-slate-900"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">Flat price for this {newService.pricingUnit.replace('per_', '')}</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Optional Visiting Charges (₹)
                        </label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                          <input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={newService.visitingCharges || ''}
                            onChange={(e) => setNewService({ ...newService, visitingCharges: Number(e.target.value) })}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">Inspection fee (if applicable)</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Optional Material Charges (₹)
                        </label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                          <input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={newService.materialCharges || ''}
                            onChange={(e) => setNewService({ ...newService, materialCharges: Number(e.target.value) })}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">Base materials estimate</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. AUTOMATED LABOUR COST & ESTIMATED TOTAL BREAKDOWN CARD */}
                <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-4 sm:p-5 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                        <Calculator className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                          Automatic Price Calculation
                        </h4>
                        <p className="text-[11px] text-slate-500">Calculated automatically for transparent customer billing</p>
                      </div>
                    </div>
                    {newService.pricingUnit === 'per_hour' && (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-300">
                        Formula: ₹{newService.hourlyRate || 0}/hr × {newService.minDurationHours} hrs
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
                    <div className="rounded-xl bg-white p-3 border border-emerald-100 shadow-xs">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">
                        {newService.pricingUnit === 'per_hour' ? 'Labour Total' : 'Base Service'}
                      </span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        ₹{calculatedLabourCost}
                      </span>
                      {newService.pricingUnit === 'per_hour' && (
                        <span className="text-[10px] text-emerald-700 block">
                          ₹{newService.hourlyRate} × {newService.minDurationHours}h
                        </span>
                      )}
                    </div>

                    <div className="rounded-xl bg-white p-3 border border-emerald-100 shadow-xs">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Visiting Fee</span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        +₹{Number(newService.visitingCharges) || 0}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {(Number(newService.visitingCharges) || 0) === 0 ? 'Free' : 'Applicable'}
                      </span>
                    </div>

                    <div className="rounded-xl bg-white p-3 border border-emerald-100 shadow-xs">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Material Fee</span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        +₹{Number(newService.materialCharges) || 0}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {(Number(newService.materialCharges) || 0) === 0 ? 'None' : 'Included'}
                      </span>
                    </div>

                    <div className="rounded-xl bg-emerald-600 text-white p-3 shadow-md">
                      <span className="text-[10px] font-bold text-emerald-200 block uppercase tracking-wider">
                        Customer Total
                      </span>
                      <span className="text-lg font-black text-white font-mono">
                        ₹{calculatedTotalEstimatedPrice}
                      </span>
                      <span className="text-[10px] text-emerald-100 block">
                        {newService.pricingUnit === 'per_hour' ? `for ${newService.minDurationHours}h minimum` : `per ${newService.pricingUnit.replace('per_', '')}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Image & Description Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Service Image (Device se photo upload karein ya URL daalein)
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="relative h-16 w-24 rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 shrink-0">
                        <img
                          src={newService.image || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80'}
                          alt="Service Preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/hero-user.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-orange-300 bg-orange-50 px-3.5 py-2 text-xs font-bold text-orange-700 hover:bg-orange-100 transition shadow-sm">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Choose Photo from Device</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleServiceImageUpload}
                            />
                          </label>
                          <span className="text-xs text-slate-400 font-semibold">or paste URL:</span>
                        </div>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={newService.image}
                          onChange={(e) => setNewService({ ...newService, image: e.target.value })}
                          className="w-full rounded-2xl border border-slate-300 px-4 py-2 text-xs focus:border-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Short Description *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Complete leak detection, washer replacement, and pressure valve check."
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">What&apos;s Included (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Leak fixing, Tap replacement, 30-day warranty"
                      value={newService.details}
                      onChange={(e) => setNewService({ ...newService, details: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100 flex-wrap gap-3">
                  <div className="text-xs text-slate-500">
                    💡 This service will be sent to Admin with complete pricing details for verification.
                  </div>
                  <button
                    type="submit"
                    disabled={addingService}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-7 py-3 text-sm font-bold text-white shadow-md hover:opacity-95 transition disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{addingService ? 'Submitting to Admin...' : 'Submit Service Offering'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of Active Services */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-extrabold text-slate-950 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-orange-500" /> Active Service Offerings
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  {provider?.customServices?.length || 0} services configured
                </span>
              </div>

              {(!provider?.customServices || provider.customServices.length === 0) ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 text-xs">
                  Aapne abhi koi custom service add nahi ki hai. Upar wale form se apni service add karein!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {provider.customServices.map((svc, idx) => {
                    const isHourly = svc.pricingUnit === 'per_hour' || svc.priceUnit === 'hour';
                    const unitLabel = svc.pricingUnit === 'per_hour' ? 'Per Hour' :
                      svc.pricingUnit === 'per_day' ? 'Per Day' :
                      svc.pricingUnit === 'per_job' ? 'Per Job' : 'Per Visit';

                    return (
                      <div key={idx} className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-md hover:shadow-xl transition space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                            <img
                              src={svc.image || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80'}
                              alt={svc.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/hero-user.jpg';
                              }}
                            />
                            <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                              <span className="rounded-full bg-slate-950/85 backdrop-blur px-3 py-1 text-xs font-black text-white shadow-md">
                                {isHourly
                                  ? `₹${svc.hourlyRate || svc.price} / hr`
                                  : `₹${svc.price} / ${svc.priceUnit || 'visit'}`}
                              </span>
                              {isHourly && svc.minDurationHours && (
                                <span className="rounded-full bg-orange-600/90 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                  Min {svc.minDurationHours}h
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-5 pt-3 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 flex items-center gap-1">
                                <Tag className="h-3 w-3" /> {unitLabel} · {svc.category || 'General'}
                              </span>
                              {svc.isApproved || svc.status === 'approved' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-black">
                                  ✓ Approved & Live
                                </span>
                              ) : svc.status === 'rejected' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 px-2.5 py-0.5 text-[10px] font-black">
                                  ✕ Rejected
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-black">
                                  ⏳ Pending Admin Approval
                                </span>
                              )}
                            </div>

                            <h4 className="font-extrabold text-slate-950 text-base leading-snug">
                              {svc.name}
                            </h4>

                            {svc.description && (
                              <p className="text-xs text-slate-600 line-clamp-2">
                                {svc.description}
                              </p>
                            )}

                            {/* Pricing Breakdown Pills */}
                            <div className="pt-2 rounded-2xl bg-slate-50 p-2.5 border border-slate-100 text-[11px] space-y-1">
                              {isHourly ? (
                                <div className="flex items-center justify-between text-slate-700">
                                  <span>Labour ({svc.minDurationHours || 1} hrs min):</span>
                                  <span className="font-bold text-slate-900 font-mono">
                                    ₹{svc.estimatedLabourCost || (svc.hourlyRate || svc.price) * (svc.minDurationHours || 1)}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between text-slate-700">
                                  <span>Base Price:</span>
                                  <span className="font-bold text-slate-900 font-mono">₹{svc.price}</span>
                                </div>
                              )}

                              {(svc.visitingCharges || 0) > 0 && (
                                <div className="flex items-center justify-between text-slate-600 text-[10px]">
                                  <span>Visiting Fee:</span>
                                  <span className="font-semibold font-mono">+₹{svc.visitingCharges}</span>
                                </div>
                              )}
                              {(svc.materialCharges || 0) > 0 && (
                                <div className="flex items-center justify-between text-slate-600 text-[10px]">
                                  <span>Material Fee:</span>
                                  <span className="font-semibold font-mono">+₹{svc.materialCharges}</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between text-emerald-800 font-extrabold pt-1 border-t border-slate-200/60">
                                <span>Total Estimated:</span>
                                <span className="font-mono text-xs">₹{svc.totalEstimatedPrice || svc.price}</span>
                              </div>
                            </div>

                            {svc.details && svc.details.length > 0 && (
                              <div className="pt-1 flex flex-wrap gap-1">
                                {svc.details.map((d, dIdx) => (
                                  <span key={dIdx} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                    ✓ {d}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-5 pt-0 border-t border-slate-100 flex justify-end">
                          <button
                            onClick={() => handleDeleteCustomService(idx)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================== TAB 3: PROFILE MANAGEMENT ==================== */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
          <form onSubmit={handleProfileSave} className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-950">Edit Professional Profile</h2>
                <p className="text-xs text-slate-500">Update your contact details, service area, and working hours.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Availability:</span>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, isAvailable: !editForm.isAvailable })}
                  className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition ${
                    editForm.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {editForm.isAvailable ? 'Available for Jobs' : 'Unavailable'}
                </button>
              </div>
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
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Category * (Apna custom category likhein)
                </label>
                <input
                  type="text"
                  list="edit-profile-category-options"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  placeholder="e.g. Plumbing, Electrician, Carpet Cleaner"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none font-semibold text-slate-900"
                />
                <datalist id="edit-profile-category-options">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Base Price / Inspection Fee (₹)</label>
                <input
                  type="number"
                  value={editForm.pricePerHour}
                  onChange={(e) => setEditForm({ ...editForm, pricePerHour: Number(e.target.value) })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-600 focus:outline-none font-semibold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Working Hours</label>
                <input
                  type="text"
                  value={editForm.workingHours}
                  onChange={(e) => setEditForm({ ...editForm, workingHours: e.target.value })}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Profile Picture (Device se photo upload karein ya URL daalein)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative h-20 w-20 rounded-3xl overflow-hidden border-2 border-slate-200 bg-slate-100 shrink-0 shadow-sm">
                    <img
                      src={editForm.profilePicture || '/hero-user.jpg'}
                      alt="Profile Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/hero-user.jpg';
                      }}
                    />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-sm">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Choose Photo from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfileImageUpload}
                        />
                      </label>
                      <span className="text-xs text-slate-400 font-semibold">or paste URL:</span>
                    </div>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={editForm.profilePicture}
                      onChange={(e) => setEditForm({ ...editForm, profilePicture: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-2 text-xs focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
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
          <AccountDeletionSection />
          </div>
        )}

      </div>
    </div>
  );
}
