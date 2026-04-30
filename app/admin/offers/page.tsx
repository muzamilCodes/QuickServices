'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit3, Trash2, Loader2, Save, BadgePercent } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface Offer {
  _id?: string;
  title: string;
  code: string;
  text: string;
  discount: number;
  discountType: string;
  service: string;
  href: string;
  isActive: boolean;
  expiryDate: string | null;
}

export default function AdminOffersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newOffer, setNewOffer] = useState<Offer>({
    title: "",
    code: "",
    text: "",
    discount: 0,
    discountType: "percent",
    service: "Any service",
    href: "/services",
    isActive: true,
    expiryDate: null,
  });
  const [message, setMessage] = useState("");

  const API_URL = "http://localhost:4000";

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const fetchOffers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/offers`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setOffers(data.offers);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createOffer = async (offer: Offer) => {
    try {
      const res = await fetch(`${API_URL}/admin/offers`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(offer),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Offer created!");
        setNewOffer({
          title: "",
          code: "",
          text: "",
          discount: 0,
          discountType: "percent",
          service: "Any service",
          href: "/services",
          isActive: true,
          expiryDate: null,
        });
        await fetchOffers();
      } else {
        setMessage(data.message || "Failed to create");
      }
    } catch (error) {
      setMessage("Failed to create offer");
    }
  };

  const updateOffer = async (offer: Offer) => {
    if (!offer._id) return;
    try {
      const res = await fetch(`${API_URL}/admin/offers/${offer._id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(offer),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Offer updated!");
        setEditingId(null);
        await fetchOffers();
      }
    } catch (error) {
      setMessage("Update failed");
    }
  };

  const deleteOffer = async (id: string) => {
    if (!confirm("Delete this offer?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/offers/${id}`, { method: "DELETE", headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setMessage("Offer deleted!");
        await fetchOffers();
      }
    } catch (error) {
      setMessage("Delete failed");
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchOffers();
  }, [isAuthenticated, fetchOffers]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const editingOffer = editingId ? offers.find(o => o._id === editingId) : null;

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
            <h1 className="text-3xl font-semibold text-slate-950 mb-4">Offers Management</h1>
            <p className="text-slate-600 mb-8">Add, edit and manage promotional offers</p>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
            {message}
          </div>
        )}

        {/* Add New Offer Form */}
        <div className="rounded-[28px] bg-white/90 p-8 mb-8 shadow-xl">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Plus className="h-6 w-6" />
            {editingId ? "Edit Offer" : "Add New Offer"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<input
              placeholder="Offer Title (e.g., First Booking Saver)"
              value={editingId ? editingOffer?.title || "" : newOffer.title}
              onChange={(e) => editingId ? setEditingId(null) && setNewOffer({...newOffer, title: e.target.value}) : setNewOffer({...newOffer, title: e.target.value})}
              className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <input
              placeholder="Offer Code (e.g., QUICK100)"
              value={editingId ? editingOffer?.code || "" : newOffer.code}
              onChange={(e) => setNewOffer({...newOffer, code: e.target.value.toUpperCase()})}
              className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <input
              placeholder="Discount (e.g., 100 or 15)"
              type="number"
              value={editingId ? editingOffer?.discount || 0 : newOffer.discount}
              onChange={(e) => setNewOffer({...newOffer, discount: parseInt(e.target.value) || 0})}
              className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <select
              value={editingId ? editingOffer?.discountType || "percent" : newOffer.discountType}
              onChange={(e) => setNewOffer({...newOffer, discountType: e.target.value})}
              className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
            <input
              placeholder="Service (e.g., Any service, Plumber, Cleaner)"
              value={editingId ? editingOffer?.service || "" : newOffer.service}
              onChange={(e) => setNewOffer({...newOffer, service: e.target.value})}
              className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <input
              placeholder="Booking URL (e.g., /booking?service=plumber)"
              value={editingId ? editingOffer?.href || "" : newOffer.href}
              onChange={(e) => setNewOffer({...newOffer, href: e.target.value})}
              className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="date"
              value={editingId ? editingOffer?.expiryDate ? editingOffer.expiryDate.split('T')[0] : "" : newOffer.expiryDate ? newOffer.expiryDate.split('T')[0] : ""}
              onChange={(e) => setNewOffer({...newOffer, expiryDate: e.target.value ? e.target.value : null})}
              className="w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editingId ? editingOffer?.isActive ?? true : newOffer.isActive}
                onChange={(e) => setNewOffer({...newOffer, isActive: e.target.checked})}
                className="h-5 w-5 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">Active (visible to users)</span>
            </label>
            <textarea
              placeholder="Description text"
              value={editingId ? editingOffer?.text || "" : newOffer.text}
              onChange={(e) => setNewOffer({...newOffer, text: e.target.value})}
              rows={3}
              className="md:col-span-2 w-full rounded-xl border border-slate-200 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="mt-6 flex gap-3">
            <button
onClick={() => {
                if (editingId) {
                  updateOffer(editingOffer!);
                } else {
                  createOffer(newOffer);
                }
              }}
              className="flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-white hover:bg-orange-700"
            >
              <Save className="h-4 w-4" />
              {editingId ? "Update Offer" : "Create Offer"}
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

        {/* Offers List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            Offers List ({offers.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div key={offer._id || offer.code} className="rounded-[24px] border border-slate-200 bg-white/90 p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                      <BadgePercent className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">{offer.title}</h3>
                      <p className="text-sm text-slate-600">{offer.text}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(offer._id || "")}
                      className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteOffer(offer._id!)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">{offer.code}</span>
                    <span className="text-lg font-bold text-orange-600">
                      {offer.discountType === 'percent' ? `${offer.discount}% off` : `₹${offer.discount} off`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Service: {offer.service}</span>
                    <span>•</span>
                    <span className={offer.isActive ? "text-green-600" : "text-red-500"}>
                      {offer.isActive ? "Active" : "Inactive"}
                    </span>
                    {offer.expiryDate && (
                      <>
                        <span>•</span>
                        <span>Expires: {new Date(offer.expiryDate).toLocaleDateString()}</span>
                      </>
                    )}
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
