'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit3, Trash2, Loader2, Save } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface Service {
  _id?: string;
  id: string;
  name: string;
  icon: string;
  description: string;
  details: string[];
  basePrice: number;
  priceUnit: string;
  rating: number;
}

export default function AdminServicesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newService, setNewService] = useState<Service>({
    id: "",
    name: "",
    icon: "",
    description: "",
    details: [""],
    basePrice: 0,
    priceUnit: "visit",
    rating: 4.5,
  });
  const [message, setMessage] = useState("");

  const API_URL = "http://localhost:4000";

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/services`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createService = async (service: Service) => {
    try {
      const res = await fetch(`${API_URL}/admin/services`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(service),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Service created!");
        setNewService({
          id: "",
          name: "",
          icon: "",
          description: "",
          details: [""],
          basePrice: 0,
          priceUnit: "visit",
          rating: 4.5,
        });
        await fetchServices();
      } else {
        setMessage(data.message || "Failed to create");
      }
    } catch (error) {
      setMessage("Failed to create service");
    }
  };

  const updateService = async (service: Service) => {
    if (!service._id) return;
    try {
      const res = await fetch(`${API_URL}/admin/services/${service._id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(service),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Service updated!");
        setEditingId(null);
        await fetchServices();
      }
    } catch (error) {
      setMessage("Update failed");
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/services/${id}`, { method: "DELETE", headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setMessage("Service deleted!");
        await fetchServices();
      }
    } catch (error) {
      setMessage("Delete failed");
    }
  };

  const addDetailField = () => {
    setNewService({ ...newService, details: [...newService.details, ""] });
  };

  useEffect(() => {
    if (isAuthenticated) fetchServices();
  }, [isAuthenticated, fetchServices]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const editingService = editingId ? services.find(s => s._id === editingId) : null;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950 mb-4">Services Management</h1>
            <p className="text-slate-600 mb-8">Add, edit and manage service categories</p>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
            {message}
          </div>
        )}

        {/* Add New Service Form */}
        <div className="rounded-[28px] bg-white/90 p-8 mb-8 shadow-xl">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Plus className="h-6 w-6" />
            {editingId ? "Edit Service" : "Add New Service"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              placeholder="Service ID (plumber, electrician)"
              value={editingId ? editingService?.id || "" : newService.id}
              onChange={(e) => editingId ? null : setNewService({...newService, id: e.target.value})}
              className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={!!editingId}
            />
            <input
              placeholder="Service Name"
              value={editingId ? editingService?.name || "" : newService.name}
              onChange={(e) => editingId ? null : setNewService({...newService, name: e.target.value})}
              className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <input
              placeholder="Emoji Icon (🔧)"
              value={editingId ? editingService?.icon || "" : newService.icon}
              onChange={(e) => editingId ? null : setNewService({...newService, icon: e.target.value})}
              className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <input
              placeholder="Base Price"
              type="number"
              value={editingId ? editingService?.basePrice || 0 : newService.basePrice}
              onChange={(e) => editingId ? null : setNewService({...newService, basePrice: parseInt(e.target.value) || 0})}
              className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <input
              placeholder="Price Unit (visit, hr, day)"
              value={editingId ? editingService?.priceUnit || "" : newService.priceUnit}
              onChange={(e) => editingId ? null : setNewService({...newService, priceUnit: e.target.value})}
              className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <input
              placeholder="Rating (4.5)"
              type="number"
              step="0.1"
              value={editingId ? editingService?.rating || 4.5 : newService.rating}
              onChange={(e) => editingId ? null : setNewService({...newService, rating: parseFloat(e.target.value) || 4.5})}
              className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <textarea
              placeholder="Description"
              value={editingId ? editingService?.description || "" : newService.description}
              onChange={(e) => editingId ? null : setNewService({...newService, description: e.target.value})}
              rows={3}
              className="md:col-span-2 w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Details (bullet points)</label>
              {newService.details.map((detail, index) => (
                <input
                  key={index}
                  placeholder={`Detail ${index + 1}`}
                  value={detail}
                  onChange={(e) => {
                    const newDetails = [...newService.details];
                    newDetails[index] = e.target.value;
                    setNewService({...newService, details: newDetails});
                  }}
                  className="w-full rounded-lg border border-slate-200 p-3 mb-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              ))}
              <button
                type="button"
                onClick={addDetailField}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                + Add detail
              </button>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                if (editingId) {
                  updateService({...editingService!, details: editingService!.details || []});
                } else {
                  createService(newService);
                }
              }}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              {editingId ? "Update Service" : "Create Service"}
            </button>
            {editingId && (
              <button
                onClick={() => setEditingId(null)}
                className="rounded-xl border border-slate-200 px-6 py-3 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            Services List ({services.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service._id || service.id} className="rounded-[24px] border border-slate-200 bg-white/90 p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{service.icon}</div>
                    <div>
                      <h3 className="font-semibold text-slate-950">{service.name}</h3>
                      <p className="text-sm text-slate-600">{service.description}</p>
                      <p className="text-sm font-mono text-slate-500 mt-1">ID: {service.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(service._id || "")}
                      className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteService(service._id!)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                    <span>₹{service.basePrice}/{service.priceUnit}</span>
                    <span>⭐ {service.rating.toFixed(1)}</span>
                  </div>
                  <div className="space-y-1">
                    {service.details.map((detail, index) => (
                      <p key={index} className="text-xs text-slate-500">• {detail}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

