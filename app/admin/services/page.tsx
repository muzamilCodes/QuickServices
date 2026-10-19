'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit3, Trash2, Loader2, Save, CheckCircle2, XCircle, Clock, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getApiBaseUrl } from "@/lib/apiBase";
import toast from "react-hot-toast";

interface Service {
  _id?: string;
  id: string;
  name: string;
  icon: string;
  description: string;
  details: string[];
  basePrice: number;
  priceUnit: string;
  pricingUnit?: string;
  hourlyRate?: number;
  minDurationHours?: number;
  additionalTimeBilling?: string;
  visitingCharges?: number;
  materialCharges?: number;
  estimatedLabourCost?: number;
  totalEstimatedPrice?: number;
  rating: number;
  category?: string;
  image?: string;
  isProviderSubmitted?: boolean;
  submittedBy?: string;
}

interface ProviderSubmission {
  _id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  details: string[];
  price: number;
  priceUnit: string;
  pricingUnit?: string;
  hourlyRate?: number;
  minDurationHours?: number;
  additionalTimeBilling?: string;
  visitingCharges?: number;
  materialCharges?: number;
  estimatedLabourCost?: number;
  totalEstimatedPrice?: number;
  image?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  providerName: string;
  providerEmail: string;
  providerId?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  createdAt: string;
}

type TabType = 'catalog' | 'submissions';

export default function AdminServicesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const API_URL = getApiBaseUrl();

  const [tab, setTab] = useState<TabType>('catalog');
  const [services, setServices] = useState<Service[]>([]);
  const [submissions, setSubmissions] = useState<ProviderSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingServiceState, setEditingServiceState] = useState<Service | null>(null);
  const [newService, setNewService] = useState<Service>({
    id: "", name: "", icon: "", description: "", details: [""],
    basePrice: 0, priceUnit: "visit", rating: 4.5, category: "General Maintenance",
  });

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/services`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) setServices(data.services);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    setSubLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/provider-services`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) setSubmissions(data.submissions);
    } catch (e) { console.error(e); }
    finally { setSubLoading(false); }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchServices();
      fetchSubmissions();
    }
  }, [isAuthenticated, fetchServices, fetchSubmissions]);

  // ===================== CATALOG CRUD =====================
  const createService = async (service: Service) => {
    try {
      const res = await fetch(`${API_URL}/admin/services`, {
        method: "POST", headers: getHeaders(), body: JSON.stringify(service),
      });
      const data = await res.json();
      if (data.success) { toast.success("Service created!"); setNewService({ id: "", name: "", icon: "", description: "", details: [""], basePrice: 0, priceUnit: "visit", rating: 4.5, category: "General Maintenance" }); await fetchServices(); }
      else toast.error(data.message || "Failed to create");
    } catch { toast.error("Failed to create service"); }
  };

  const updateService = async (service: Service) => {
    if (!service._id) return;
    try {
      const res = await fetch(`${API_URL}/admin/services/${service._id}`, {
        method: "PUT", headers: getHeaders(), body: JSON.stringify(service),
      });
      const data = await res.json();
      if (data.success) { toast.success("Service updated!"); setEditingId(null); await fetchServices(); }
    } catch { toast.error("Update failed"); }
  };

  const deleteService = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/services/${id}`, { method: "DELETE", headers: getHeaders() });
      const data = await res.json();
      if (data.success) { toast.success("Service deleted!"); await fetchServices(); }
    } catch { toast.error("Delete failed"); }
  };

  // ===================== APPROVAL ACTIONS =====================
  const approveSubmission = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/provider-services/${id}/approve`, {
        method: "PUT", headers: getHeaders(), body: JSON.stringify({ adminNote: "Approved by admin" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("✅ Service approved and added to catalog!");
        await fetchSubmissions();
        await fetchServices();
      } else toast.error(data.message || "Failed to approve");
    } catch { toast.error("Approve failed"); }
  };

  const rejectSubmission = async (id: string) => {
    const note = prompt("Reason for rejection (optional):");
    try {
      const res = await fetch(`${API_URL}/admin/provider-services/${id}/reject`, {
        method: "PUT", headers: getHeaders(), body: JSON.stringify({ adminNote: note || "Not suitable at this time" }),
      });
      const data = await res.json();
      if (data.success) { toast.success("Service rejected."); await fetchSubmissions(); }
      else toast.error(data.message || "Failed to reject");
    } catch { toast.error("Reject failed"); }
  };

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => router.push('/admin')} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm">
            ←
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-950">Services Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your service catalog and approve provider submissions</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 rounded-2xl bg-white border border-slate-200 p-1.5 w-fit shadow-sm">
          <button
            onClick={() => setTab('catalog')}
            className={`rounded-xl px-5 py-2 text-sm font-bold transition ${tab === 'catalog' ? 'bg-[#0f62c9] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            📋 Service Catalog ({services.length})
          </button>
          <button
            onClick={() => setTab('submissions')}
            className={`rounded-xl px-5 py-2 text-sm font-bold transition flex items-center gap-2 ${tab === 'submissions' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            📨 Provider Submissions
            {pendingCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white px-1">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* ====== TAB: CATALOG ====== */}
        {tab === 'catalog' && (
          <>
            {/* Add / Edit Form */}
            <div className="rounded-3xl bg-white p-8 mb-8 shadow border border-slate-100">
              <h2 className="text-xl font-extrabold mb-6 flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#0f62c9]" />
                {editingId ? "Edit Service" : "Add New Service"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="Service ID (plumber, electrician)" value={editingId ? editingServiceState?.id || "" : newService.id}
                  onChange={(e) => editingId ? setEditingServiceState(p => p ? { ...p, id: e.target.value } : p) : setNewService({ ...newService, id: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" disabled={!!editingId} />
                <input placeholder="Service Name" value={editingId ? editingServiceState?.name || "" : newService.name}
                  onChange={(e) => editingId ? setEditingServiceState(p => p ? { ...p, name: e.target.value } : p) : setNewService({ ...newService, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                <input placeholder="Emoji Icon (🔧)" value={editingId ? editingServiceState?.icon || "" : newService.icon}
                  onChange={(e) => editingId ? setEditingServiceState(p => p ? { ...p, icon: e.target.value } : p) : setNewService({ ...newService, icon: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                <input placeholder="Category (Plumbing, Electrical...)" value={editingId ? editingServiceState?.category || "" : newService.category}
                  onChange={(e) => editingId ? setEditingServiceState(p => p ? { ...p, category: e.target.value } : p) : setNewService({ ...newService, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                <input placeholder="Base Price (₹)" type="number" value={editingId ? editingServiceState?.basePrice || 0 : newService.basePrice}
                  onChange={(e) => editingId ? setEditingServiceState(p => p ? { ...p, basePrice: parseInt(e.target.value) || 0 } : p) : setNewService({ ...newService, basePrice: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                <input placeholder="Price Unit (visit, hr, day, room)" value={editingId ? editingServiceState?.priceUnit || "" : newService.priceUnit}
                  onChange={(e) => editingId ? setEditingServiceState(p => p ? { ...p, priceUnit: e.target.value } : p) : setNewService({ ...newService, priceUnit: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                <textarea placeholder="Description" value={editingId ? editingServiceState?.description || "" : newService.description}
                  onChange={(e) => editingId ? setEditingServiceState(p => p ? { ...p, description: e.target.value } : p) : setNewService({ ...newService, description: e.target.value })}
                  rows={2} className="md:col-span-2 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                <input placeholder="Image URL (optional)" value={editingId ? editingServiceState?.image || "" : newService.image || ""}
                  onChange={(e) => editingId ? setEditingServiceState(p => p ? { ...p, image: e.target.value } : p) : setNewService({ ...newService, image: e.target.value })}
                  className="md:col-span-2 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => { if (editingId && editingServiceState) updateService(editingServiceState); else createService(newService); }}
                  className="flex items-center gap-2 rounded-xl bg-[#0f62c9] px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition"
                >
                  <Save className="h-4 w-4" />
                  {editingId ? "Update Service" : "Create Service"}
                </button>
                {editingId && (
                  <button onClick={() => { setEditingId(null); setEditingServiceState(null); }}
                    className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition">
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Services Grid */}
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 mb-4">All Services ({services.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.map((service) => (
                  <div key={service._id || service.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{service.icon}</span>
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900">{service.name}</h3>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {service.id}</p>
                          {service.isProviderSubmitted && (
                            <span className="text-[10px] text-orange-600 font-bold">by {service.submittedBy}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => { setEditingId(service._id || null); setEditingServiceState({ ...service }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteService(service._id!)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{service.description}</p>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700 border-t border-slate-100 pt-3">
                      <span className="text-[#0f62c9]">₹{service.basePrice}/{service.priceUnit}</span>
                      <span>⭐ {service.rating?.toFixed(1)}</span>
                      {service.category && <span className="text-slate-400">{service.category}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ====== TAB: PROVIDER SUBMISSIONS ====== */}
        {tab === 'submissions' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Provider Service Submissions</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Review services submitted by providers. Approve to add to the main catalog.
                </p>
              </div>
              {pendingCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-300 px-4 py-1.5 text-xs font-bold text-amber-800">
                  <Clock className="h-3.5 w-3.5" />
                  {pendingCount} pending review
                </span>
              )}
            </div>

            {subLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
            ) : submissions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">
                <div className="text-5xl mb-4">📨</div>
                <h3 className="text-lg font-bold text-slate-700">No submissions yet</h3>
                <p className="text-sm text-slate-400 mt-1">When providers submit services for approval, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => {
                  const isHourly = sub.pricingUnit === 'per_hour' || sub.priceUnit === 'hour';
                  const unitLabel = sub.pricingUnit === 'per_hour' ? 'Per Hour' :
                    sub.pricingUnit === 'per_day' ? 'Per Day' :
                    sub.pricingUnit === 'per_job' ? 'Per Job' : 'Per Visit';

                  return (
                    <div key={sub._id} className={`rounded-3xl border bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-start gap-5 ${
                      sub.status === 'pending' ? 'border-amber-200' : sub.status === 'approved' ? 'border-emerald-200' : 'border-rose-200'
                    }`}>
                      {/* Image Thumbnail if available */}
                      {sub.image && (
                        <div className="h-24 w-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img src={sub.image} alt={sub.name} className="h-full w-full object-cover" />
                        </div>
                      )}

                      {/* Service Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{sub.icon || '🔧'}</span>
                            <div>
                              <h3 className="font-extrabold text-base text-slate-900">{sub.name}</h3>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                                <span className="font-bold text-orange-600">{unitLabel}</span>
                                <span>·</span>
                                <span>{sub.category}</span>
                                <span>·</span>
                                <span>Submitted by: <strong>{sub.providerName}</strong> ({sub.providerEmail || (sub.providerId as any)?.phone || 'Verified Pro'})</span>
                              </div>
                            </div>
                          </div>

                          {/* Status badge */}
                          <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full shrink-0 ${
                            sub.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            sub.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {sub.status === 'pending' ? '⏳ Pending Review' : sub.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                          </span>
                        </div>

                        {/* Complete Pricing Breakdown Grid */}
                        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                          {isHourly ? (
                            <>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">Hourly Rate</span>
                                <span className="font-extrabold text-slate-900 font-mono">₹{sub.hourlyRate || sub.price} / hr</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">Min Duration</span>
                                <span className="font-extrabold text-slate-900">{sub.minDurationHours || 1} hrs min ({sub.additionalTimeBilling || '1 hr'} billing)</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">Labour Total</span>
                                <span className="font-extrabold text-slate-900 font-mono">
                                  ₹{sub.estimatedLabourCost || ((sub.hourlyRate || sub.price) * (sub.minDurationHours || 1))}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="col-span-2 sm:col-span-3">
                              <span className="text-[10px] text-slate-400 font-bold block uppercase">Base Price</span>
                              <span className="font-extrabold text-slate-900 font-mono">₹{sub.price} ({unitLabel})</span>
                            </div>
                          )}

                          <div className="rounded-xl bg-white p-2 border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Visiting / Materials</span>
                            <span className="text-[11px] font-semibold text-slate-700">
                              +₹{sub.visitingCharges || 0} visit / +₹{sub.materialCharges || 0} mat
                            </span>
                          </div>

                          <div className="col-span-2 sm:col-span-4 flex items-center justify-between pt-1 border-t border-slate-200/70 text-xs">
                            <span className="font-bold text-slate-600">Total Customer Estimated Price:</span>
                            <span className="font-extrabold text-emerald-700 text-sm font-mono">
                              ₹{sub.totalEstimatedPrice || sub.price}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2">{sub.description}</p>
                        {sub.details && sub.details.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {sub.details.filter(Boolean).map((d, i) => (
                              <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">• {d}</span>
                            ))}
                          </div>
                        )}
                        {sub.adminNote && (
                          <p className="text-[11px] italic text-slate-400">Admin note: {sub.adminNote}</p>
                        )}
                        <p className="text-[10px] text-slate-300">{new Date(sub.createdAt).toLocaleString()}</p>
                      </div>

                      {/* Actions */}
                      {sub.status === 'pending' && (
                        <div className="flex sm:flex-col gap-2 shrink-0 md:self-center">
                          <button
                            onClick={() => approveSubmission(sub._id)}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve & Go Live
                          </button>
                          <button
                            onClick={() => rejectSubmission(sub._id)}
                            className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-5 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition border border-rose-200"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      )}
                      {sub.status === 'approved' && (
                        <div className="shrink-0 flex items-center gap-1.5 text-emerald-600 text-xs font-bold md:self-center">
                          <ShieldCheck className="h-5 w-5" />
                          Live on Catalog
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
