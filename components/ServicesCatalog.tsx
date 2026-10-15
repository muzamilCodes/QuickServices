'use client';

import { useState, useMemo } from 'react';
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
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { allServices, Service } from '@/lib/services';

const categories = [
  'All Categories',
  'House section',
  'Carpentry',
  'Electrical works',
  'Plumbing',
  'Painting',
  'Appliances',
  'Landscaping',
  'General Maintenance',
  'Personal Care',
  'Delivery & Shifting',
];

const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₹400', min: 0, max: 400 },
  { label: '₹400 to ₹600', min: 400, max: 600 },
  { label: '₹600 to ₹1,000', min: 600, max: 1000 },
  { label: '₹1,000 and above', min: 1000, max: Infinity },
];

const locations = [
  'All Locations',
  'Srinagar',
  'Budgam',
  'Anantnag',
  'Baramulla',
  'Pulwama',
  'Ganderbal',
  'Jammu',
];

export default function ServicesCatalog({ title = "Reliable home repair and maintenance services" }: { title?: string }) {
  const router = useRouter();

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All Prices');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [sortBy, setSortBy] = useState('Highest Ratings');
  const [acceptingNewCustomers, setAcceptingNewCustomers] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter & Sort Logic
  const filteredServices = useMemo(() => {
    return allServices.filter((service) => {
      // Search filter
      const matchesSearch = 
        !search.trim() ||
        service.name.toLowerCase().includes(search.toLowerCase()) ||
        service.description.toLowerCase().includes(search.toLowerCase()) ||
        service.category.toLowerCase().includes(search.toLowerCase());

      // Category filter
      const matchesCategory = 
        selectedCategory === 'All Categories' || 
        service.category.toLowerCase() === selectedCategory.toLowerCase();

      // Price filter
      const currentRange = priceRanges.find((r) => r.label === selectedPriceRange);
      const matchesPrice = !currentRange || (service.numericPrice >= currentRange.min && service.numericPrice <= currentRange.max);

      return matchesSearch && matchesCategory && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'Highest Ratings') return b.rating - a.rating;
      if (sortBy === 'Most Booked') return b.reviewsCount - a.reviewsCount;
      if (sortBy === 'Price: Low to High') return a.numericPrice - b.numericPrice;
      if (sortBy === 'Price: High to Low') return b.numericPrice - a.numericPrice;
      return 0;
    });
  }, [search, selectedCategory, selectedPriceRange, sortBy]);

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
    if (selectedLocation !== 'All Locations') {
      list.push({
        key: 'loc',
        label: selectedLocation,
        onRemove: () => setSelectedLocation('All Locations'),
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
  }, [selectedCategory, selectedPriceRange, selectedLocation, search]);

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('All Categories');
    setSelectedPriceRange('All Prices');
    setSelectedLocation('All Locations');
    setSortBy('Highest Ratings');
  };

  return (
    <section className="bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
      <div className="mx-auto max-w-7xl">
        
        {/* Mobile Filter Toggle */}
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm"
          >
            <SlidersHorizontal className="h-4 w-4 text-[#0f62c9]" />
            {mobileFilterOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
          <span className="text-xs text-slate-500 font-medium">
            {filteredServices.length} Services available
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* =========================================================================
              LEFT SIDEBAR FILTER (EXACT HANDYPAL STYLE FROM SCREENSHOT)
          ========================================================================= */}
          <aside className={`lg:col-span-3 space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              
              {/* Filter Header & Accepting Toggle */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900">Filter</h3>
                  {activeFilters.length > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs font-semibold text-rose-600 hover:underline"
                    >
                      Reset all
                    </button>
                  )}
                </div>

                {/* Accepting new customers toggle */}
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 p-3 border border-slate-100">
                  <span className="text-xs font-bold text-slate-700">Accepting new customers</span>
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
              </div>

              {/* All Categories Radio List */}
              <div className="border-b border-slate-100 pb-5">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-3">
                  All Categories
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <label
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex items-center gap-3 px-2 py-1.5 rounded-xl cursor-pointer text-xs font-medium transition ${
                          isSelected ? 'bg-blue-50/80 text-[#0f62c9] font-bold' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full border transition ${
                            isSelected ? 'border-[#0f62c9] bg-[#0f62c9]' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                        <span>{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Ranges */}
              <div className="border-b border-slate-100 pb-5">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-3">
                  Price
                </h4>
                <div className="space-y-2">
                  {priceRanges.map((range) => {
                    const isSelected = selectedPriceRange === range.label;
                    return (
                      <label
                        key={range.label}
                        onClick={() => setSelectedPriceRange(range.label)}
                        className={`flex items-center gap-3 px-2 py-1.5 rounded-xl cursor-pointer text-xs font-medium transition ${
                          isSelected ? 'bg-orange-50 text-orange-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
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

              {/* Location Dropdown */}
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-2">
                  Location
                </h4>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-800 shadow-sm outline-none focus:border-blue-500 appearance-none"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

            </div>
          </aside>

          {/* =========================================================================
              RIGHT MAIN AREA (SEARCH BAR, ACTIVE PILLS, SORT, SERVICE CARDS)
          ========================================================================= */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Top Search & Sort Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search home repair, cleaning, electricians..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none"
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
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs font-semibold text-slate-500 shrink-0">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-sm outline-none focus:border-blue-500"
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
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                  >
                    <span>{pill.label}</span>
                    <button
                      onClick={pill.onRemove}
                      className="text-slate-400 hover:text-rose-600"
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

            {/* Title & Count */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {title}
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {filteredServices.length} services found
              </span>
            </div>

            {/* Service Cards Grid (Matching Handypal 3-Column in Screenshot) */}
            {filteredServices.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                  🔍
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">No services match your filters</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing your active filters or searching for something else like plumber, cleaner, or electrician.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-5 rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Real Image Header */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <Image
                        src={service.image}
                        alt={service.name}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                      
                      {/* Category Badge */}
                      <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-900 shadow-sm backdrop-blur-sm">
                        {service.category}
                      </span>

                      {/* Icon Bubble */}
                      <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-lg shadow-md backdrop-blur-sm">
                        {service.icon}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#0f62c9] transition leading-snug">
                          {service.name}
                        </h3>

                        {/* Rating & Review Count (Exact Handypal format) */}
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-slate-900">{service.rating.toFixed(1)}</span>
                          <span className="text-slate-400 font-medium">({service.reviewsCount} reviews)</span>
                        </div>

                        {/* Description */}
                        <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      {/* Price & Book Button */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-lg font-black text-slate-950 font-mono">
                            {service.price}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-0.5">/{service.priceUnit}</span>
                        </div>

                        <button
                          onClick={() => router.push(`/booking?service=${service.id}`)}
                          className="rounded-xl bg-[#0f62c9] px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
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
