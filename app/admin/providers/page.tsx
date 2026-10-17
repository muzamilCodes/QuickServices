'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Loader2, 
  Phone, 
  MapPin, 
  Star, 
  Mail, 
  Briefcase, 
  IndianRupee, 
  Clock, 
  Images, 
  FileText, 
  ShieldCheck, 
  AlertTriangle 
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getApiBaseUrl } from "@/lib/apiBase";

interface Provider {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  category?: string;
  services: string[];
  serviceArea?: string;
  location?: { city?: string; address?: string };
  pricePerHour?: number;
  pricingDetails?: string;
  experience?: number;
  description?: string;
  profilePicture?: string;
  portfolio?: string[];
  documents?: { name?: string; url?: string }[];
  isApproved: boolean;
  isAvailable: boolean;
  rating?: number;
  completedBookings?: number;
  createdAt?: string;
}

export default function AdminProvidersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [filterApproved, setFilterApproved] = useState("all");

  const API_URL = getApiBaseUrl();

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const fetchProviders = useCallback(async () => {
    try {
      let queryParam = "";
      if (filterApproved === "true") queryParam = "?isApproved=true";
      if (filterApproved === "false") queryParam = "?isApproved=false";

      const res = await fetch(`${API_URL}/admin/providers${queryParam}`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setProviders(data.providers || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filterApproved, API_URL]);

  const approveProvider = async (id: string, approved: boolean) => {
    setActionLoading(id);
    try {
      const endpoint = approved ? 'approve' : 'reject';
      const res = await fetch(`${API_URL}/admin/providers/${id}/${endpoint}`, {
        method: "PUT",
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(approved ? "✅ Provider approved! Notification email sent." : "Provider unapproved/rejected.");
        await fetchProviders();
      } else {
        setMessage(data.message || "Action failed");
      }
    } catch (error) {
      setMessage("Update failed");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteProvider = async (id: string) => {
    if (!confirm("Are you sure you want to delete this provider account?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${API_URL}/admin/providers/${id}`, { method: "DELETE", headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setMessage("Provider deleted successfully!");
        await fetchProviders();
      }
    } catch (error) {
      setMessage("Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchProviders();
  }, [isAuthenticated, fetchProviders]);

  const pendingCount = providers.filter(p => !p.isApproved).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin')} 
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm transition"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                Service Providers & Verification
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Review submitted provider applications, verify documents & portfolio images, and approve accounts.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-sm self-start">
            <button
              onClick={() => setFilterApproved("all")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                filterApproved === "all" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-950"
              }`}
            >
              All ({providers.length})
            </button>
            <button
              onClick={() => setFilterApproved("false")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                filterApproved === "false" ? "bg-amber-500 text-white shadow-sm" : "text-amber-700 hover:bg-amber-50"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Pending Review ({pendingCount})</span>
            </button>
            <button
              onClick={() => setFilterApproved("true")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                filterApproved === "true" ? "bg-emerald-600 text-white shadow-sm" : "text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              Approved
            </button>
          </div>
        </div>

        {/* Status Message Alert */}
        {message && (
          <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 animate-in fade-in flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="text-emerald-600 hover:text-emerald-800">✕</button>
          </div>
        )}

        {/* Providers Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {providers.map((provider) => (
            <div 
              key={provider._id} 
              className={`rounded-3xl border bg-white p-6 shadow-md hover:shadow-xl transition-all space-y-5 ${
                !provider.isApproved ? "border-amber-300 ring-2 ring-amber-100" : "border-slate-200"
              }`}
            >
              
              {/* Top Row: Profile Pic, Name, Status */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img 
                      src={provider.profilePicture || "/hero-user.jpg"} 
                      alt={provider.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/hero-user.jpg";
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-950">{provider.name}</h3>
                      {provider.isApproved && (
                        <span title="Verified Provider">
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-orange-600">{provider.category || "General Maintenance"}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <a href={`tel:${provider.phone}`} className="hover:underline">{provider.phone}</a>
                      </span>
                      {provider.email && (
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <a href={`mailto:${provider.email}`} className="hover:underline truncate max-w-[140px]">{provider.email}</a>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Approval Badge */}
                <span className={`px-3 py-1 text-xs font-extrabold rounded-full shrink-0 ${
                  provider.isApproved 
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                    : "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                }`}>
                  {provider.isApproved ? "Approved / Active" : "Pending Verification"}
                </span>
              </div>

              {/* Description */}
              {provider.description && (
                <p className="text-xs text-slate-600 bg-slate-50 rounded-2xl p-3 border border-slate-100 leading-relaxed">
                  {provider.description}
                </p>
              )}

              {/* Details Grid: Experience, Pricing, Location */}
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50/70 p-3 text-center border border-slate-100">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Experience</p>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5">{provider.experience || 1} Years</p>
                </div>
                <div className="border-x border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Rate / Fee</p>
                  <p className="text-xs font-extrabold text-emerald-700 mt-0.5">₹{provider.pricePerHour || 499}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Location</p>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5 truncate px-1">
                    {provider.location?.city || provider.serviceArea || "Kashmir"}
                  </p>
                </div>
              </div>

              {/* Services Offered */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Services Offered:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {provider.services?.map((svc, i) => (
                    <span key={i} className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-800">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Portfolio Images (if available) */}
              {provider.portfolio && provider.portfolio.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <Images className="h-3.5 w-3.5 text-slate-500" /> Submitted Portfolio Images ({provider.portfolio.length}):
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {provider.portfolio.map((imgUrl, idx) => (
                      <a 
                        key={idx} 
                        href={imgUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="relative h-16 rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 transition group"
                      >
                        <img 
                          src={imgUrl} 
                          alt={`Portfolio ${idx}`} 
                          className="h-full w-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/hero-user.jpg";
                          }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Approve / Reject / Delete */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {!provider.isApproved ? (
                    <button
                      disabled={actionLoading === provider._id}
                      onClick={() => approveProvider(provider._id, true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Verify & Approve Provider</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-300 px-3.5 py-2 text-xs font-extrabold text-emerald-800">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span>Verified & Approved</span>
                      </div>
                      <button
                        disabled={actionLoading === provider._id}
                        onClick={() => approveProvider(provider._id, true)}
                        className="inline-flex items-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition disabled:opacity-50"
                        title="Resend approval notification email to provider"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span>Resend Email</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  disabled={actionLoading === provider._id}
                  onClick={() => deleteProvider(provider._id)}
                  className="inline-flex items-center gap-1 rounded-xl p-2 text-xs font-bold text-rose-500 hover:bg-rose-50 transition"
                  title="Delete Provider Account"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>

            </div>
          ))}
        </div>

        {providers.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            No service providers registered under this filter.
          </div>
        )}

      </div>
    </div>
  );
}
