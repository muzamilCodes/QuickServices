'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Edit3, Trash2, Loader2, Save, Phone, MapPin, Star } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface Provider {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  services: string[];
  city?: string;
  isApproved: boolean;
  isAvailable: boolean;
  rating?: number;
  bio?: string;
}

export default function AdminProvidersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterApproved, setFilterApproved] = useState("all");

  const API_URL = "http://localhost:4000";

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const fetchProviders = useCallback(async () => {
    try {
      const params = new URLSearchParams({ approved: filterApproved === "all" ? "" : filterApproved });
      const res = await fetch(`${API_URL}/admin/providers?${params}`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setProviders(data.providers);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filterApproved]);

  const approveProvider = async (id: string, approved: boolean) => {
    try {
      const res = await fetch(`${API_URL}/admin/providers/${id}/approve`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ isApproved: approved }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(approved ? "Provider approved!" : "Provider rejected!");
        await fetchProviders();
      }
    } catch (error) {
      setMessage("Update failed");
    }
  };

  const deleteProvider = async (id: string) => {
    if (!confirm("Delete this provider?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/providers/${id}`, { method: "DELETE", headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setMessage("Provider deleted!");
        await fetchProviders();
      }
    } catch (error) {
      setMessage("Delete failed");
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchProviders();
  }, [isAuthenticated, fetchProviders]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

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
            <h1 className="text-3xl font-semibold text-slate-950 mb-4">Providers Management</h1>
            <p className="text-slate-600 mb-8">Approve, edit and manage service providers</p>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-emerald-800 mb-8">
            {message}
          </div>
        )}

        <div className="mb-8 flex items-center gap-4">
          <select
            value={filterApproved}
            onChange={(e) => setFilterApproved(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Providers</option>
            <option value="true">Approved</option>
            <option value="false">Pending/Rejected</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <div key={provider._id} className="group rounded-[24px] border border-slate-200 bg-white/90 p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">{provider.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {provider.phone}
                    </span>
                    {provider.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {provider.city}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  provider.isApproved 
                    ? "bg-emerald-50 text-emerald-700" 
                    : "bg-amber-50 text-amber-700"
                }`}>
                  {provider.isApproved ? "Approved" : "Pending"}
                </span>
              </div>
              {provider.bio && <p className="text-sm text-slate-600 mb-4 line-clamp-2">{provider.bio}</p>}
              <div className="mb-4">
                <p className="text-xs font-medium text-slate-500 mb-2">Services:</p>
                <div className="flex flex-wrap gap-1">
                  {provider.services.map((service, index) => (
                    <span key={index} className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  {provider.rating && <span>⭐ {provider.rating.toFixed(1)}</span>}
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    provider.isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  }`}>
                    {provider.isAvailable ? "Available" : "Busy"}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => approveProvider(provider._id, !provider.isApproved)}
                    className={`p-2 rounded-lg ${
                      provider.isApproved 
                        ? "text-rose-500 hover:bg-rose-50" 
                        : "text-emerald-500 hover:bg-emerald-50"
                    }`}
                    title={provider.isApproved ? "Reject" : "Approve"}
                  >
                    {provider.isApproved ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  </button>
                  <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteProvider(provider._id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {providers.length === 0 && (
          <div className="text-center py-20">
            <div className="mx-auto h-16 w-16 rounded-3xl bg-slate-100 p-4 text-2xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No providers found</h3>
            <p className="text-slate-600 mb-6">Providers will appear here once they sign up</p>
          </div>
        )}
      </div>
    </div>
  );
}

