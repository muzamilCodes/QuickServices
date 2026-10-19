'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Search, 
  Star, 
  MapPin, 
  Check, 
  X, 
  ChevronDown, 
  SlidersHorizontal,
  Zap,
  Sparkles,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { allServices, Service } from '@/lib/services';
import { getApiBaseUrl } from '@/lib/apiBase';

const categories = [
  { name: 'All Categories', icon: '✨' },
  { name: 'Plumbing', icon: '🔧' },
  { name: 'Electrical works', icon: '⚡' },
  { name: 'House section', icon: '🧹' },
  { name: 'Appliances', icon: '❄️' },
  { name: 'Carpentry', icon: '🔨' },
  { name: 'Painting', icon: '🎨' },
  { name: 'General Maintenance', icon: '🛡️' },
  { name: 'Landscaping', icon: '🌿' },
  { name: 'Personal Care', icon: '💇' },
  { name: 'Delivery & Shifting', icon: '🚚' },
];

const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₹400', min: 0, max: 400 },
  { label: '₹400 to ₹600', min: 400, max: 600 },
  { label: '₹600 to ₹1,000', min: 600, max: 1000 },
  { label: '₹1,000 and above', min: 1000, max: Infinity },
];

const ratingFilters = [
  { label: 'All Ratings', min: 0 },
  { label: '4.8 ★ & above', min: 4.8 },
  { label: '4.5 ★ & above', min: 4.5 },
  { label: '4.0 ★ & above', min: 4.0 },
];

const locations = [
  'All Locations',
  'Srinagar',
  'Budgam',
  'Anantnag',
  'Baramulla',
  'Kupwara',
  'Handwara',
  'Pulwama',
  'Ganderbal',
  'Jammu',
];

export default function ServicesCatalog({ 
  title = "Reliable home repair and maintenance services",
  limitCards,
}: { 
  title?: string;
  limitCards?: number;
}) {
  const router = useRouter();
  const API_URL = getApiBaseUrl();

  // Dynamic live services state (defaults to static, updates when API responds)
  const [servicesList, setServicesList] = useState<Service[]>(allServices);

  useEffect(() => {
    let active = true;
    const fetchServicesFromDb = async () => {
      try {
        const res = await fetch(`${API_URL}/services`);
        const data = await res.json();
        if (data.success && Array.isArray(data.services) && data.services.length > 0) {
          const mapped: Service[] = data.services.map((s: any) => {
            const staticMatch = allServices.find(
              as => as.id === s.id || as.name.toLowerCase() === s.name.toLowerCase()
            );
            return {
              id: s.id || s._id,
              name: s.name,
              icon: s.icon || staticMatch?.icon || '🔧',
              description: s.description || staticMatch?.description || '',
              details: Array.isArray(s.details) && s.details.length > 0 ? s.details : (staticMatch?.details || [s.description]),
              price: `₹${s.basePrice || s.price || 499}`,
              numericPrice: Number(s.basePrice || s.price) || 499,
              priceUnit: s.priceUnit || 'visit',
              rating: Number(s.rating) || staticMatch?.rating || 4.8,
              reviewsCount: staticMatch?.reviewsCount || (s.isProviderSubmitted ? 12 : 68),
              eta: staticMatch?.eta || 'Fast doorstep dispatch',
              color: staticMatch?.color || 'from-blue-500 to-indigo-700',
              category: s.category || staticMatch?.category || 'General Maintenance',
              popular: s.isProviderSubmitted ? false : (staticMatch?.popular ?? true),
              image: s.image || staticMatch?.image || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
              isProviderSubmitted: Boolean(s.isProviderSubmitted),
              submittedBy: s.submittedBy || '',
            };
          });

          // Also merge any allServices defaults not yet in DB
          const existingNames = new Set(mapped.map(m => m.name.toLowerCase()));
          const remaining = allServices.filter(as => !existingNames.has(as.name.toLowerCase()));

          if (active) {
            setServicesList([...mapped, ...remaining]);
          }
        }
      } catch (err) {
        console.warn('Could not load live services from API, using default catalog:', err);
      }
    };
    fetchServicesFromDb();
    return () => { active = false; };
  }, [API_URL]);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');
  const [selectedRating, setSelectedRating] = useState('All Ratings');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [sortBy, setSortBy] = useState('Highest Ratings');
  const [acceptingNewCustomers, setAcceptingNewCustomers] = useState(true);
  const [popularOnly, setPopularOnly] = useState(false);
  const [expressDispatchOnly, setExpressDispatchOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Categories': servicesList.length };
    categories.forEach((cat) => {
      if (cat.name !== 'All Categories') {
        counts[cat.name] = servicesList.filter(
          (s) => s.category.toLowerCase() === cat.name.toLowerCase()
        ).length;
      }
    });
    return counts;
  }, [servicesList]);

  // Filter & Sort Logic
  const filteredServices = useMemo(() => {
    return servicesList.filter((service) => {
      // Search filter
      const matchesSearch = 
        !search.trim() ||
        service.name.toLowerCase().includes(search.toLowerCase()) ||
        service.description.toLowerCase().includes(search.toLowerCase()) ||
        service.category.toLowerCase().includes(search.toLowerCase()) ||
        (service.details && service.details.some(d => d.toLowerCase().includes(search.toLowerCase())));

      // Category filter
      const matchesCategory = 
        selectedCategory === 'All Categories' || 
        service.category.toLowerCase() === selectedCategory.toLowerCase();

      // Price filter
      const currentRange = priceRanges.find((r) => r.label === selectedPriceRange);
      const matchesPrice = !currentRange || (service.numericPrice >= currentRange.min && service.numericPrice <= currentRange.max);

      // Rating filter
      const currentRating = ratingFilters.find((r) => r.label === selectedRating);
      const matchesRating = !currentRating || service.rating >= currentRating.min;

      // Popular filter
      const matchesPopular = !popularOnly || service.popular;

      // Express dispatch filter
      const matchesExpress = !expressDispatchOnly || service.eta.toLowerCase().includes('30 min') || service.eta.toLowerCase().includes('fast');

      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesPopular && matchesExpress;
    }).sort((a, b) => {
      if (sortBy === 'Highest Ratings') return b.rating - a.rating;
      if (sortBy === 'Most Booked') return b.reviewsCount - a.reviewsCount;
      if (sortBy === 'Price: Low to High') return a.numericPrice - b.numericPrice;
      if (sortBy === 'Price: High to Low') return b.numericPrice - a.numericPrice;
      return 0;
    });
  }, [servicesList, search, selectedCategory, selectedPriceRange, selectedRating, popularOnly, expressDispatchOnly, sortBy]);

  // Active filter pills
  const activeFilters = useMemo(() => {
    const list: { key: string; label: string; onRemove: () => void }[] = [];
    if (selectedCategory !== 'All Categories') {
      list.push({
        key: 'cat',
        label: selectedCategory,
        onRemove: () => setSelectedCategory('All Categories'),
      });
    }
    if (selectedPriceRange !== 'All Prices') {
      list.push({
        key: 'price',
        label: selectedPriceRange,
        onRemove: () => setSelectedPriceRange('All Prices'),
      });
    }
    if (selectedRating !== 'All Ratings') {
      list.push({
        key: 'rating',
        label: selectedRating,
        onRemove: () => setSelectedRating('All Ratings'),
      });
    }
    if (selectedLocation !== 'All Locations') {
      list.push({
        key: 'loc',
        label: selectedLocation,
        onRemove: () => setSelectedLocation('All Locations'),
      });
    }
    if (popularOnly) {
      list.push({
        key: 'pop',
        label: 'Popular Only',
        onRemove: () => setPopularOnly(false),
      });
    }
    if (expressDispatchOnly) {
      list.push({
        key: 'express',
        label: 'Express 30-min',
        onRemove: () => setExpressDispatchOnly(false),
      });
    }
    if (search.trim()) {
      list.push({
        key: 'search',
        label: `"${search}"`,
        onRemove: () => setSearch(''),
      });
    }
    return list;
  }, [selectedCategory, selectedPriceRange, selectedRating, selectedLocation, popularOnly, expressDispatchOnly, search]);

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('All Categories');
    setSelectedPriceRange('All Prices');
    setSelectedRating('All Ratings');
    setSelectedLocation('All Locations');
    setPopularOnly(false);
    setExpressDispatchOnly(false);
    setSortBy('Highest Ratings');
  };

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-white/8 bg-[var(--background)]">
      <div className="mx-auto max-w-screen-2xl">
        
        {/* Mobile Filter Toggle */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-800 shadow-sm"
          >
            <SlidersHorizontal className="h-4 w-4 text-[#0f62c9]" />
            {mobileFilterOpen ? 'Hide Filters' : 'Show Filters & Categories'}
            {activeFilters.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0f62c9] text-[10px] text-white">
                {activeFilters.length}
              </span>
            )}
          </button>
          <span className="text-xs text-slate-600 font-semibold">
            {filteredServices.length} Services available
          </span>
        </div>

        {/* 
          EXPANDED SIDE-BY-SIDE LAYOUT:
          - Filter Sidebar: lg:col-span-4 (Wider & Bolder)
          - Service Cards & Controls: lg:col-span-8 (Directly Barabar / Alongside)
        */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          
          {/* =========================================================================
              LEFT SIDEBAR: EXPANDED & BOLDER FILTER
          ========================================================================= */}
          <aside className={`lg:col-span-3 space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'} lg:sticky lg:top-24`}>
            <div className="rounded-3xl border border-slate-200 dark:border-white/8 p-6 sm:p-7 shadow-sm space-y-6 bg-white dark:bg-[#161b22]">
              
              {/* Filter Header & Reset */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f62c9]/15 text-[#4f9cff]">
                      <SlidersHorizontal className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900">Filters</h3>
                      <p className="text-[11px] text-slate-500 font-medium">Refine services by category & price</p>
                    </div>
                  </div>
                  {activeFilters.length > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </button>
                  )}
                </div>

                {/* Quick Toggles: Accepting new customers & Express Dispatch */}
                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Accepting customers</span>
                    </div>
                    <button
                      onClick={() => setAcceptingNewCustomers(!acceptingNewCustomers)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        acceptingNewCustomers ? 'bg-[#0f62c9]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          acceptingNewCustomers ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">30-min Express Only</span>
                    </div>
                    <button
                      onClick={() => setExpressDispatchOnly(!expressDispatchOnly)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        expressDispatchOnly ? 'bg-amber-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          expressDispatchOnly ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* All Categories Radio List */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Categories
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {categories.length - 1} options
                  </span>
                </div>
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.name;
                    const count = categoryCounts[cat.name] || 0;
                    return (
                      <label
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-xs font-medium transition ${
                          isSelected 
                            ? 'bg-blue-50 dark:bg-[#0f62c9]/15 text-[#0f62c9] dark:text-[#4f9cff] font-bold border border-blue-200 dark:border-[#4f9cff]/25 shadow-xs' 
                            : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm">{cat.icon}</span>
                          <span>{cat.name}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-blue-100 text-[#0f62c9]' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Ranges */}
              <div className="border-b border-slate-100 pb-5">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-3">
                  Price Budget
                </h4>
                <div className="space-y-1.5">
                  {priceRanges.map((range) => {
                    const isSelected = selectedPriceRange === range.label;
                    return (
                      <label
                        key={range.label}
                        onClick={() => setSelectedPriceRange(range.label)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer text-xs font-medium transition ${
                          isSelected 
                            ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold border border-orange-200 dark:border-orange-400/25' 
                            : 'text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                            isSelected ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </span>
                        <span>{range.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Ratings Filter */}
              <div className="border-b border-slate-100 pb-5">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-3">
                  Minimum Rating
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {ratingFilters.map((rf) => {
                    const isSelected = selectedRating === rf.label;
                    return (
                      <button
                        key={rf.label}
                        type="button"
                        onClick={() => setSelectedRating(rf.label)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border ${
                          isSelected 
                            ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-400/25 shadow-xs' 
                            : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-white/8 hover:bg-slate-100 dark:hover:bg-white/10'
                        }`}
                      >
                        <Star className={`h-3 w-3 ${isSelected ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                        <span>{rf.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location Dropdown */}
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Coverage Area
                </h4>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full rounded-xl border border-white/10 pl-10 pr-8 py-2.5 text-xs font-semibold shadow-sm outline-none" style={{ background: '#1c2333', color: '#cdd9e5' }}
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Popular Only Checkbox */}
              <div className="pt-2">
                <label 
                  onClick={() => setPopularOnly(!popularOnly)}
                  className="flex items-center gap-3 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                      popularOnly ? 'border-[#0f62c9] bg-[#0f62c9] text-white' : 'border-slate-300 bg-white'
                    }`}
                  >
                    {popularOnly && <Check className="h-3 w-3 stroke-[3]" />}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                    Show Popular & Verified Services only
                  </span>
                </label>
              </div>

            </div>
          </aside>

          {/* =========================================================================
              RIGHT MAIN AREA: SERVICE CARDS SIDE-BY-SIDE WITH FILTER
          ========================================================================= */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Top Search & Sort Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between p-4 rounded-3xl border border-slate-200 dark:border-white/8 shadow-sm bg-white dark:bg-[#161b22]">
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search home repair, cleaning, plumbers, electricians..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-white/10 pl-10 pr-8 py-2.5 text-xs font-medium bg-slate-50 dark:bg-[#1c2333] text-slate-900 dark:text-[#e6edf3] placeholder-slate-400 dark:placeholder-slate-500 outline-none transition"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <span className="text-xs font-bold text-slate-500 shrink-0">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-slate-200 dark:border-white/10 px-3.5 py-2 text-xs font-bold shadow-sm outline-none cursor-pointer bg-slate-50 dark:bg-[#1c2333] text-slate-900 dark:text-[#e6edf3]"
                >
                  <option value="Highest Ratings">Highest Ratings</option>
                  <option value="Most Booked">Most Booked</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                </select>
              </div>

            </div>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-500">Active Filters:</span>
                {activeFilters.map((pill) => (
                  <span
                    key={pill.key}
                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3 py-1 text-xs font-semibold text-blue-900 shadow-xs"
                  >
                    <span>{pill.label}</span>
                    <button
                      onClick={pill.onRemove}
                      className="text-blue-500 hover:text-rose-600 transition"
                      aria-label="Remove filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-[#0f62c9] hover:underline ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Title & Count Header (Directly alongside the filter) */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200 pb-4 gap-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Verified doorstep technicians and specialists across Jammu & Kashmir with upfront pricing.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-white/8 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                {filteredServices.length} services available
              </span>
            </div>

            {/* Service Cards Grid (Side-by-side with Filter) */}
            {filteredServices.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 dark:border-white/15 p-12 text-center bg-white dark:bg-[#161b22]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                  🔍
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">No services match your filters</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing your active filters or searching for something else like plumber, cleaner, or electrician.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-5 rounded-full bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {(limitCards ? filteredServices.slice(0, limitCards) : filteredServices).map((service) => (
                  <div
                    key={service.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 dark:border-white/8 shadow-sm transition hover:shadow-xl hover:shadow-black/30 hover:-translate-y-1 duration-300 bg-white dark:bg-[#161b22]"
                  >
                    {/* Image Header */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <Image
                        src={service.image || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80'}
                        alt={`${service.name} - QuickServices Verified Home Service Kashmir`}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                      
                      {/* Category Badge */}
                      <span className="absolute top-3 left-3 rounded-full bg-white/95 dark:bg-slate-900/90 border border-slate-200/50 dark:border-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white shadow-sm backdrop-blur-sm">
                        {service.category}
                      </span>

                      {/* Icon Bubble */}
                      <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-white/95 dark:bg-slate-800/90 border border-slate-200/50 dark:border-white/10 text-base shadow-md backdrop-blur-sm text-slate-900 dark:text-white">
                        {service.icon}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#4f9cff] transition leading-snug">
                          {service.name}
                        </h3>

                        {service.submittedBy && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 text-[10px] text-orange-600 dark:text-orange-400 font-bold bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-md">
                              ★ Verified Specialist: {service.submittedBy}
                            </span>
                          </div>
                        )}

                        {/* Rating & Review Count */}
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-slate-700 dark:text-slate-200">{service.rating.toFixed(1)}</span>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">({service.reviewsCount} reviews)</span>
                        </div>

                        {/* Description */}
                        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {service.description}
                        </p>

                        {/* ETA / Feature Pill */}
                        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 dark:border-emerald-800/40 px-2.5 py-1 rounded-lg w-fit">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{service.eta}</span>
                        </div>
                      </div>

                      {/* Price & Book Button */}
                      <div className="pt-3 border-t border-slate-100 dark:border-white/8 flex items-center justify-between">
                        <div>
                          <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                            {service.price}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-0.5">/{service.priceUnit}</span>
                        </div>

                        <button
                          onClick={() => router.push(`/booking?service=${service.id}`)}
                          className="rounded-xl bg-[linear-gradient(135deg,#0f62c9,#ff8a3d)] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition hover:opacity-95 active:scale-95"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </main>

        </div>
      </div>
    </section>
  );
}
