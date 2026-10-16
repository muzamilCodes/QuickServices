'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BriefcaseBusiness, 
  CheckCircle2, 
  Clock3, 
  IndianRupee, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Upload, 
  User, 
  Wrench, 
  Mail, 
  Lock, 
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiBaseUrl } from '@/lib/apiBase';
import { useAuthStore } from '@/store/authStore';

const CATEGORIES = [
  'Plumbing',
  'Electrical works',
  'House section',
  'Appliances',
  'Carpentry',
  'Painting',
  'General Maintenance',
  'Landscaping',
  'Personal Care',
  'Delivery & Shifting',
];

const AVAILABLE_SERVICES = [
  { id: 'plumber', label: 'Plumbing & Leak Repair' },
  { id: 'electrician', label: 'Electrical Wiring & Fittings' },
  { id: 'ac', label: 'AC Cooling & Servicing' },
  { id: 'cleaner', label: 'Deep Cleaning & Sanitization' },
  { id: 'carpenter', label: 'Carpentry & Woodwork' },
  { id: 'painter', label: 'Painting & Wall Patching' },
  { id: 'mechanic', label: 'Automobile & Bike Repair' },
  { id: 'appliance', label: 'Home Appliances Repair' },
  { id: 'waterpurifier', label: 'Water Purifier & RO' },
  { id: 'inverter', label: 'Inverter & Battery Setup' },
  { id: 'pest', label: 'Pest Control & Spray' },
  { id: 'cctv', label: 'CCTV Security Setup' },
  { id: 'moving', label: 'House Packing & Moving' },
  { id: 'gardener', label: 'Garden Care & Pruning' },
  { id: 'salon', label: 'Doorstep Grooming & Salon' },
  { id: 'tutor', label: 'Home Coaching & Tutoring' },
];

export default function ProviderRegisterPage() {
  const router = useRouter();
  const API_URL = getApiBaseUrl();
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    whatsappNumber: '',
    category: 'Plumbing',
    services: ['plumber'] as string[],
    experience: 3,
    qualifications: 'Certified Professional Technician',
    skills: 'Leak repair, pipe fitting, sanitary installation',
    serviceArea: 'Srinagar, Handwara, Kupwara & Baramulla',
    address: 'Main Town, Handwara Qalamabad Road',
    city: 'Handwara',
    pricePerHour: 499,
    pricingDetails: '₹499 base inspection visit fee. Spare parts extra at actuals.',
    workingHours: '08:00 AM - 08:00 PM',
    description: 'Experienced tradesman offering fast, dependable doorstep repairs with guaranteed workmanship.',
    profilePicture: '/hero-user.jpg',
    portfolioLinks: '',
    identityDocument: 'Aadhaar / Trade ID on file'
  });

  const [customServiceName, setCustomServiceName] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, profilePicture: reader.result as string }));
      toast.success('Profile photo loaded from device!');
    };
    reader.readAsDataURL(file);
  };

  const addCustomService = () => {
    if (!customServiceName.trim()) return;
    const clean = customServiceName.trim();
    if (!form.services.includes(clean)) {
      setForm((prev) => ({ ...prev, services: [...prev.services, clean] }));
      setCustomServiceName('');
      toast.success(`"${clean}" added to your services!`);
    }
  };

  const toggleService = (serviceId: string) => {
    setForm((prev) => {
      const exists = prev.services.includes(serviceId);
      const updated = exists 
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId];
      return { ...prev, services: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.name || !form.email || !form.password || !form.phone) {
      setErrorMsg('Please fill in your name, email, password, and phone number.');
      return;
    }

    if (form.services.length === 0) {
      setErrorMsg('Please select at least one service that you offer.');
      return;
    }

    setLoading(true);

    try {
      const portfolioArray = form.portfolioLinks 
        ? form.portfolioLinks.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const skillsArray = form.skills
        ? form.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        whatsappNumber: form.whatsappNumber || form.phone,
        category: form.category,
        services: form.services,
        experience: Number(form.experience) || 1,
        qualifications: form.qualifications,
        skills: skillsArray,
        serviceArea: form.serviceArea,
        address: form.address,
        city: form.city,
        pricePerHour: Number(form.pricePerHour) || 499,
        pricingDetails: form.pricingDetails,
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          hours: form.workingHours
        },
        description: form.description,
        profilePicture: form.profilePicture || '/hero-user.jpg',
        portfolio: portfolioArray,
        documents: [{ name: 'Government ID', url: form.identityDocument }]
      };

      const res = await fetch(`${API_URL}/providers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Registration submitted! Sent to Admin for verification.');
        router.push('/login?pending=pro');
      } else {
        setErrorMsg(data.message || 'Registration failed. Please try again.');
        toast.error(data.message || 'Registration failed');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Network error connecting to backend.');
      toast.error('Network error. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        
        {/* Banner Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-800 shadow-sm">
            <BriefcaseBusiness className="h-4 w-4 text-orange-500" />
            QuickServices Pro Network
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Register as a Verified Service Provider
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Join Kashmir&apos;s fastest growing on-demand home service platform. Get direct local customer bookings, guaranteed upfront pricing, and live GPS job tracking.
          </p>
        </div>

        {/* Process Banner */}
        <div className="mb-8 rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-xs font-black text-white shrink-0">1</span>
              <div>
                <p className="text-xs font-extrabold text-slate-900">1. Fill Profile Form</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Category, services, phone, location & pricing</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white shrink-0">2</span>
              <div>
                <p className="text-xs font-extrabold text-slate-900">2. Admin Verification</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Admin verifies your documents & approves profile</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-xs font-black text-white shrink-0">3</span>
              <div>
                <p className="text-xs font-extrabold text-slate-900">3. Pro Dashboard</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Manage jobs, accept requests & live GPS tracking</p>
              </div>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm font-semibold text-rose-700">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl">
          
          {/* STEP 1: Personal & Account Credentials */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="h-5 w-5 text-blue-600" /> 1. Personal & Account Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Muzamil War"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (10 digits) *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 9682645127"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. provider@quickservices.com"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Contact Number</label>
                <input
                  type="tel"
                  value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                  placeholder="e.g. 9682645127"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Profile Picture (Apni photo upload karein ya URL daalein)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative h-16 w-16 rounded-2xl overflow-hidden border-2 border-slate-300 bg-slate-100 shrink-0">
                    <img
                      src={form.profilePicture || '/hero-user.jpg'}
                      alt="Profile Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/hero-user.jpg';
                      }}
                    />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-sm">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Choose Photo from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                      <span className="text-xs text-slate-400 font-semibold">or paste image URL:</span>
                    </div>
                    <input
                      type="text"
                      value={form.profilePicture}
                      onChange={(e) => setForm({ ...form, profilePicture: e.target.value })}
                      placeholder="/hero-user.jpg or https://..."
                      className="w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-xs focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Trade Category & Specific Services */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Wrench className="h-5 w-5 text-orange-600" /> 2. Trade Category & Specific Services
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Category * (Aap khud likhein kya service denge)
                </label>
                <input
                  type="text"
                  required
                  list="category-suggestions"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Plumbing, Electrician, Carpet Repair, AC Service, etc."
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none font-bold text-slate-900"
                />
                <datalist id="category-suggestions">
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
                <p className="text-[11px] text-slate-500 mt-1">
                  Aap apni custom service category type kar sakte hain ya suggestions me se chun sakte hain.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Years of Experience *</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Specific Services You Provide (Select all that apply) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {AVAILABLE_SERVICES.map((srv) => {
                  const isSelected = form.services.includes(srv.id);
                  return (
                    <button
                      type="button"
                      key={srv.id}
                      onClick={() => toggleService(srv.id)}
                      className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold text-left transition ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm ring-1 ring-blue-500' 
                          : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 className={`h-4 w-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`} />
                      <span>{srv.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Service Adder */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomService(); } }}
                  placeholder="Apni koi aur specific service likhein (e.g. Kashmiri Wood Carving, Geyser Fitting)..."
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-xs focus:border-blue-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomService}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition shrink-0"
                >
                  + Add Custom Service
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Key Skills (comma separated)</label>
                <input
                  type="text"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="e.g. Leak repair, Switchboard wiring, RO filter"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications / Certification</label>
                <input
                  type="text"
                  value={form.qualifications}
                  onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                  placeholder="e.g. ITI Certified Electrician / 5+ Yrs Field Expert"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: Pricing & Working Hours */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
              <IndianRupee className="h-5 w-5 text-emerald-600" /> 3. Pricing & Working Hours
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Starting Visit Price (₹) *</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={form.pricePerHour}
                  onChange={(e) => setForm({ ...form, pricePerHour: Number(e.target.value) })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Daily Working Hours</label>
                <input
                  type="text"
                  value={form.workingHours}
                  onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                  placeholder="08:00 AM - 08:00 PM"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Pricing Explanation Note</label>
                <input
                  type="text"
                  value={form.pricingDetails}
                  onChange={(e) => setForm({ ...form, pricingDetails: e.target.value })}
                  placeholder="₹499 inspection fee. Spare parts quoted before replacement."
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: Location & Coverage */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="h-5 w-5 text-rose-600" /> 4. Service Location & Operational Coverage
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Base City / Town *</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. Srinagar or Handwara"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Coverage Area & Radius</label>
                <input
                  type="text"
                  value={form.serviceArea}
                  onChange={(e) => setForm({ ...form, serviceArea: e.target.value })}
                  placeholder="e.g. Handwara, Kupwara, Sopore, Srinagar"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Shop / Base Doorstep Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. Main Market, Handwara Qalamabad Road"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* STEP 5: Description & Verification Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="h-5 w-5 text-indigo-600" /> 5. Bio Description & Verification Proof
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Professional Bio / Service Pitch</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Briefly describe your experience, tools used, and guarantee..."
                className="w-full rounded-2xl border border-slate-300 p-4 text-sm focus:border-blue-600 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Portfolio Images (comma separated URLs)</label>
                <input
                  type="text"
                  value={form.portfolioLinks}
                  onChange={(e) => setForm({ ...form, portfolioLinks: e.target.value })}
                  placeholder="https://images...1.jpg, https://..."
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ID / Aadhaar Document Reference</label>
                <input
                  type="text"
                  value={form.identityDocument}
                  onChange={(e) => setForm({ ...form, identityDocument: e.target.value })}
                  placeholder="Aadhaar ID number or document URL"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-blue-600 hover:underline">
                Sign in here
              </Link>
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-8 py-4 text-sm font-bold text-white shadow-xl hover:bg-slate-800 active:scale-95 transition disabled:opacity-60"
            >
              {loading ? 'Creating Provider Account...' : 'Complete Provider Registration'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
