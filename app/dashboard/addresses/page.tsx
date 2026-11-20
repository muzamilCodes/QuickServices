'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Navigation,
  Loader2,
  Home as HomeIcon,
  Building,
  ArrowLeft,
  X
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getApiBaseUrl } from '@/lib/apiBase';

interface Address {
  _id: string;
  label?: string;
  fullAddress: string;
  city?: string;
  pincode?: string;
  landmark?: string;
  location?: { lat?: number; lng?: number };
  isDefault?: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const API = getApiBaseUrl();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Form State
  const [label, setLabel] = useState('Home');
  const [fullAddress, setFullAddress] = useState('');
  const [city, setCity] = useState('Handwara');
  const [pincode, setPincode] = useState('193221');
  const [landmark, setLandmark] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAddresses = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API}/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.addresses)) {
        setAddresses(data.addresses);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (isAuthenticated) {
      void fetchAddresses();
    }
  }, [isAuthenticated, authLoading, fetchAddresses, router]);

  const openAddModal = () => {
    setEditingAddress(null);
    setLabel('Home');
    setFullAddress('');
    setCity('Handwara');
    setPincode('193221');
    setLandmark('');
    setIsDefault(addresses.length === 0);
    setMessage('');
    setModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setLabel(addr.label || 'Home');
    setFullAddress(addr.fullAddress);
    setCity(addr.city || 'Handwara');
    setPincode(addr.pincode || '');
    setLandmark(addr.landmark || '');
    setIsDefault(Boolean(addr.isDefault));
    setMessage('');
    setModalOpen(true);
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data && data.display_name) {
            setFullAddress(data.display_name);
            const addr = data.address || {};
            setCity(addr.city || addr.town || addr.village || 'Handwara');
            setPincode(addr.postcode || '');
          }
        } catch {
          setFullAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)} (GPS Location)`);
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        alert('Could not retrieve your location. Please type manually.');
        setGpsLoading(false);
      }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullAddress.trim()) {
      setMessage('Address is required');
      return;
    }
    setSaving(true);
    setMessage('');

    const token = localStorage.getItem('token');
    const payload = { label, fullAddress, city, pincode, landmark, isDefault };

    try {
      const url = editingAddress
        ? `${API}/user/addresses/${editingAddress._id}`
        : `${API}/user/addresses`;
      const method = editingAddress ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        await fetchAddresses();
      } else {
        setMessage(data.message || 'Error saving address');
      }
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to remove this address?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/user/addresses/${addressId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAddresses((prev) => prev.filter((a) => a._id !== addressId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/user/addresses/${addressId}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        await fetchAddresses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 flex items-center gap-2.5">
            <MapPin className="h-7 w-7 text-blue-600" /> My Saved Addresses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your doorstep service locations across Handwara, Srinagar, and all of Kashmir.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition"
        >
          <Plus className="h-4 w-4" /> Add New Address
        </button>
      </div>

      {/* Address List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <MapPin className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">No Addresses Saved Yet</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Save your home, office, or site address so booking your next service takes only one click!
          </p>
          <button
            onClick={openAddModal}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" /> Add Address Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`rounded-2xl p-5 bg-white border transition shadow-sm hover:shadow-md flex flex-col justify-between ${
                addr.isDefault ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      {addr.label === 'Office' ? <Building className="h-4 w-4" /> : <HomeIcon className="h-4 w-4" />}
                    </div>
                    <span className="font-extrabold text-sm text-slate-900">{addr.label || 'Home'}</span>
                  </div>

                  {addr.isDefault ? (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Default
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="text-xs font-semibold text-slate-400 hover:text-blue-600 transition"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <p className="mt-3 text-sm text-slate-700 leading-relaxed font-medium">
                  {addr.fullAddress}
                </p>

                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  {addr.city && <span>📍 {addr.city}</span>}
                  {addr.pincode && <span>📮 {addr.pincode}</span>}
                  {addr.landmark && <span>🏢 Near {addr.landmark}</span>}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => openEditModal(addr)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>

                <button
                  onClick={() => handleDelete(addr._id)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-700 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL: ADD / EDIT ADDRESS ────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {message && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
                {message}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Label selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Address Label</label>
                <div className="flex gap-2">
                  {['Home', 'Office', 'Other'].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLabel(l)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${
                        label === l
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Address with GPS button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Full Doorstep Address</label>
                  <button
                    type="button"
                    onClick={handleUseGps}
                    disabled={gpsLoading}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline disabled:opacity-50"
                  >
                    <Navigation className="h-3 w-3" />
                    {gpsLoading ? 'Detecting...' : 'Use Current GPS'}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder="Street, Mohalla, Ward, House/Shop No."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              {/* City & Pincode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">City / District</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Handwara / Kupwara / Srinagar"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="193221"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Landmark (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near Jamia Masjid / Main Chowk / Hospital"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600"
                />
              </div>

              {/* Default checkbox */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-700">Set as my default address for bookings</span>
              </label>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-300 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
