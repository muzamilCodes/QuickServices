'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Search, 
  Clock, 
  DollarSign, 
  Star, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  PhoneCall,
  Wrench,
  Zap,
  Truck,
  Shirt,
  Sparkle,
  Baby,
  Car,
  KeyRound,
  Bug,
  BatteryCharging
} from 'lucide-react';

// 10 Express Services (Matching Floating Card in Screenshot)
const expressServices = [
  { id: 'plumber', name: 'PLUMBER', icon: '🔧', color: 'from-blue-500 to-indigo-600', link: '/booking?service=plumber' },
  { id: 'electrician', name: 'ELECTRICIAN', icon: '⚡', color: 'from-amber-400 to-orange-500', link: '/booking?service=electrician' },
  { id: 'delivery', name: 'QUICK DELIVERY', icon: '🛵', color: 'from-cyan-500 to-blue-600', link: '/booking?service=delivery' },
  { id: 'laundry', name: 'LAUNDRY', icon: '🧺', color: 'from-purple-500 to-indigo-600', link: '/booking?service=laundry' },
  { id: 'cleaner', name: 'HOUSE CLEANING', icon: '🧹', color: 'from-emerald-400 to-teal-600', link: '/booking?service=cleaner' },
  { id: 'babysitter', name: 'BABYSITTER', icon: '🍼', color: 'from-pink-400 to-rose-500', link: '/booking?service=babysitter' },
  { id: 'mechanic', name: 'CAR TOWING', icon: '🚗', color: 'from-red-500 to-orange-600', link: '/booking?service=mechanic' },
  { id: 'locksmith', name: 'LOCKSMITH', icon: '🔑', color: 'from-yellow-500 to-amber-600', link: '/booking?service=locksmith' },
  { id: 'pest', name: 'PEST CONTROL', icon: '🦟', color: 'from-teal-500 to-emerald-600', link: '/booking?service=pest' },
  { id: 'inverter', name: 'BATTERY', icon: '🔋', color: 'from-blue-600 to-cyan-600', link: '/booking?service=inverter' },
];

// 8 Trending Services (Matching 4x2 Grid in Screenshot)
const trendingServices = [
  {
    id: 'party',
    title: 'Birthday Party',
    desc: 'Book birthday party entertainers, decorators',
    agents: 'More than 15 agents available',
    img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=400&q=80',
    serviceKey: 'event'
  },
  {
    id: 'cleaner',
    title: 'House Cleaning',
    desc: 'Book Professional House Cleaning Services',
    agents: 'More than 20 agents available',
    img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
    serviceKey: 'cleaner'
  },
  {
    id: 'ac',
    title: 'A/C Cleaning',
    desc: 'Cleaning the condenser fan and blower, and more',
    agents: 'More than 30 agents available',
    img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80',
    serviceKey: 'ac'
  },
  {
    id: 'trainer',
    title: 'Personal Trainer',
    desc: 'Fitness Consultation & Doorstep Workout',
    agents: 'More than 10 agents available',
    img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80',
    serviceKey: 'fitness'
  },
  {
    id: 'painter',
    title: 'Painting',
    desc: 'Paint Your Dream Home and Office',
    agents: 'More than 18 agents available',
    img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80',
    serviceKey: 'painter'
  },
  {
    id: 'moving',
    title: 'Moving',
    desc: 'House shifting and packing made quick and easy',
    agents: 'More than 25 agents available',
    img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=400&q=80',
    serviceKey: 'moving'
  },
  {
    id: 'mechanic',
    title: 'Car Repair',
    desc: 'Quick Doorstep Car Diagnosis & Minor Fixes',
    agents: 'More than 15 agents available',
    img: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80',
    serviceKey: 'mechanic'
  },
  {
    id: 'tutor',
    title: 'Math Tutor',
    desc: 'Homework help & subject coaching for exams',
    agents: 'More than 22 agents available',
    img: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=400&q=80',
    serviceKey: 'tutor'
  },
];

// 4 Featured Service Agents (Matching Screenshot)
const featuredAgents = [
  {
    name: 'Eva Green',
    role: 'YOGA INSTRUCTOR',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    rating: 5,
  },
  {
    name: 'Michael Kors',
    role: 'BABYSITTER',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    rating: 5,
  },
  {
    name: 'David Miller',
    role: 'LAUNDRY SPECIALIST',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    rating: 5,
  },
  {
    name: 'Karlos Marconi',
    role: 'ELECTRICIAN',
    img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=400&q=80',
    rating: 5,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/services');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* =========================================================================
          SECTION 1: HERO HEADER (ROYAL BLUE, MATCHING SCREENSHOT)
      ========================================================================= */}
      <section className="relative overflow-hidden bg-[#0B39BB] pb-32 pt-28 sm:pb-40 sm:pt-36 lg:pb-48 lg:pt-40 text-white">
        {/* Subtle geometric circles matching reference image */}
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            
            {/* Left Column: Big Typography & Search Pill */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="space-y-3">
                <h1 className="text-4xl font-normal leading-tight text-white sm:text-5xl lg:text-6xl tracking-tight">
                  Find Local Expert &
                  <span className="block font-black text-white mt-1">
                    Get your Job Done
                  </span>
                </h1>
                <p className="max-w-xl text-base text-blue-100 sm:text-lg leading-relaxed mx-auto lg:mx-0">
                  QuickServices connects you with verified local plumbers, electricians, cleaners, technicians and tutors in minutes.
                </p>
              </div>

              {/* Action Bar / Search Pill (Matching Screenshot) */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                {/* White Pill Button: POST A JOB */}
                <button
                  onClick={() => router.push('/services')}
                  className="w-full sm:w-auto rounded-full bg-white px-8 py-3.5 text-xs font-black uppercase tracking-wider text-[#0B39BB] shadow-xl shadow-blue-950/20 transition hover:bg-slate-100 hover:scale-105 active:scale-95"
                >
                  POST A JOB
                </button>

                {/* Dark Translucent Search Bar */}
                <form 
                  onSubmit={handleSearch}
                  className="flex w-full sm:w-80 items-center rounded-full bg-[#072B8E]/80 border border-white/15 px-4 py-2 shadow-inner backdrop-blur-sm focus-within:border-white/40"
                >
                  <Search className="h-4 w-4 text-white/70 shrink-0 mr-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search For Service"
                    className="w-full bg-transparent text-xs font-medium text-white placeholder-white/60 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Hero Specialist Girl Photo (Matching Screenshot) */}
            <div className="relative lg:col-span-5 flex justify-center">
              <div className="relative w-72 sm:w-80 lg:w-[380px] h-80 sm:h-96 lg:h-[450px]">
                {/* Glowing Circular Accent */}
                <div className="absolute inset-0 rounded-full bg-white/10 blur-xl scale-95" />
                
                <div className="relative h-full w-full overflow-hidden rounded-3xl border-4 border-white/20 shadow-2xl shadow-blue-950/30">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                    alt="QuickServices Expert"
                    fill
                    priority
                    className="object-cover object-top hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B39BB]/60 via-transparent to-transparent" />
                  
                  {/* Floating Verified Badge */}
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-3 shadow-lg backdrop-blur-md flex items-center justify-between text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wide">350+ Verified Agents Online</span>
                    </div>
                    <span className="text-xs font-bold text-[#0B39BB]">★ 4.9</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: FLOATING CARD - "NEED HELP URGENTLY? EXPRESS SERVICES"
      ========================================================================= */}
      <div className="relative -mt-20 sm:-mt-28 z-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[32px] bg-white p-6 sm:p-10 shadow-2xl shadow-blue-950/15 border border-slate-100">
          
          {/* Header */}
          <div className="text-center space-y-1 mb-8">
            <p className="text-xs font-black uppercase tracking-widest text-[#FF4D4D]">
              NEED HELP URGENTLY?
            </p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              EXPRESS SERVICES
            </h2>
          </div>

          {/* 10 Express Service Icons (2 Rows of 5) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8">
            {expressServices.map((service) => (
              <button
                key={service.id}
                onClick={() => router.push(service.link)}
                className="group flex flex-col items-center text-center p-3 rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:bg-slate-50"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl shadow-sm transition group-hover:scale-110 group-hover:bg-blue-50 group-hover:shadow-md">
                  {service.icon}
                </div>
                <span className="mt-3 text-xs font-extrabold tracking-wider text-slate-800 uppercase group-hover:text-[#0B39BB]">
                  {service.name}
                </span>
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* =========================================================================
          SECTION 3: CATEGORIES - TRENDING SERVICES (4x2 Grid)
      ========================================================================= */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          {/* Section Header */}
          <div className="text-center space-y-1 mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-[#FF4D4D]">
              CATEGORIES
            </p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              TRENDING SERVICES
            </h2>
          </div>

          {/* 8 Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingServices.map((service) => (
              <div 
                key={service.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-xl hover:-translate-y-1"
              >
                {/* Photo Header */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={service.img}
                    alt={service.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute bottom-2.5 left-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-slate-900 backdrop-blur-sm">
                    {service.agents}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-[#0B39BB] transition">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {service.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => router.push(`/booking?service=${service.serviceKey}`)}
                    className="w-full rounded-lg bg-slate-900 py-2 text-center text-xs font-bold text-white transition hover:bg-[#0B39BB]"
                  >
                    Find Agent Now
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4: CHOOSE - A PLATFORM MAKES YOUR LIFE EASY
      ========================================================================= */}
      <section className="bg-slate-100/70 py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            
            {/* Left: Relaxed Customer Photo */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative h-80 sm:h-[440px] w-full max-w-lg overflow-hidden rounded-3xl shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
                  alt="Relaxed customer at home"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
              </div>
            </div>

            {/* Right: Value Proposition Points */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#FF4D4D]">
                  CHOOSE
                </p>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 mt-1">
                  A PLATFORM MAKES YOUR LIFE EASY
                </h2>
              </div>

              {/* 3 Value Pillars */}
              <div className="space-y-4 pt-2">
                
                {/* Save Time */}
                <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-200/60">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Save Time</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Don&apos;t hunt around or ask your friends to find good service agents. One click connects you with verified pros.
                    </p>
                  </div>
                </div>

                {/* Save Money */}
                <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-200/60">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Save Money</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Get transparent, upfront quotes from agents offering affordable rates without hidden charges.
                    </p>
                  </div>
                </div>

                {/* Get Quality Service */}
                <div className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-200/60">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Get Quality Service</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Select your agent based on verified customer ratings, background checks, and past job satisfaction.
                    </p>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => router.push('/services')}
                  className="rounded-full bg-[#0B39BB] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-blue-700/25 transition hover:bg-blue-800"
                >
                  POST A JOB
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: STEPS - HOW QUICKSERVICES WORK
      ========================================================================= */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          {/* Header */}
          <div className="text-center space-y-1 mb-14">
            <p className="text-xs font-black uppercase tracking-widest text-[#FF4D4D]">
              STEPS
            </p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              HOW QUICKSERVICES WORK
            </h2>
          </div>

          {/* 3 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-xl hover:-translate-y-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 text-3xl mb-5">
                💼
              </div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-900 leading-snug">
                POST YOUR JOB AND RECEIVE OFFERS
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Describe the service you need, select date and time, and enter your service location.
              </p>
              <div className="mt-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#0B39BB] text-xs font-black text-white shadow-md">
                1
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-xl hover:-translate-y-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 text-3xl mb-5">
                ⭐
              </div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-900 leading-snug">
                CHOOSE YOUR AGENT BY REVIEWS, SKILLS AND PRICE
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Review verified specialist profiles, ratings, past work, and compare quotes transparently.
              </p>
              <div className="mt-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#0B39BB] text-xs font-black text-white shadow-md">
                2
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-xl hover:-translate-y-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 text-3xl mb-5">
                🤝
              </div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-900 leading-snug">
                CHAT, AGREE AND GET YOUR JOB DONE
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Track specialist live on radar, verify via OTP, and call or chat directly on WhatsApp.
              </p>
              <div className="mt-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#0B39BB] text-xs font-black text-white shadow-md">
                3
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 6: EXPERIENCE - EXPRESS SERVICE (WITH BLUE UNIFORM TECHNICIAN)
      ========================================================================= */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 sm:p-12 shadow-xl border border-slate-200/80">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-[#FF4D4D]">
                  EXPERIENCE
                </p>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 mt-1">
                  EXPRESS SERVICE
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Need service urgently? QuickServices provides express dispatch for selective emergencies. Just choose the service you urgently need, share your location, and Express Service Agents in your vicinity will reach your doorstep rapidly!
              </p>

              {/* Bullet Checklist */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Select express service you need</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Send your live location</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Receive proposals & technician on the way in minutes</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => router.push('/booking?service=plumber')}
                  className="rounded-full bg-[#0B39BB] px-8 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-700/25 transition hover:bg-blue-800"
                >
                  EXPRESS SERVICE
                </button>
              </div>
            </div>

            {/* Right: Courier / Blue Technician Guy with Box */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative h-64 sm:h-80 w-full max-w-sm overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"
                  alt="Express Delivery & Service Agent"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: FIND SERVICES - FEATURED SERVICE AGENTS
      ========================================================================= */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          
          {/* Header */}
          <div className="text-center space-y-1 mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-[#FF4D4D]">
              FIND SERVICES
            </p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              FEATURED SERVICE AGENTS
            </h2>
          </div>

          {/* 4 Agent Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAgents.map((agent) => (
              <div 
                key={agent.name}
                className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-xl hover:-translate-y-1 text-center"
              >
                <div className="relative h-48 w-full overflow-hidden rounded-xl bg-slate-100">
                  <Image
                    src={agent.img}
                    alt={agent.name}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-4 font-bold text-base text-slate-950">
                  {agent.name}
                </h3>
                <p className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase mt-0.5">
                  {agent.role}
                </p>
                <div className="mt-2 flex text-amber-400 text-xs">
                  {'★'.repeat(agent.rating)}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 8: TESTIMONIAL - WHAT PEOPLE ARE SAYING
      ========================================================================= */}
      <section className="bg-slate-100/70 py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="mx-auto max-w-4xl text-center">
          
          <div className="space-y-1 mb-10">
            <p className="text-xs font-black uppercase tracking-widest text-[#FF4D4D]">
              TESTIMONIAL
            </p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              WHAT PEOPLE ARE SAYING
            </h2>
          </div>

          {/* Testimonial Card */}
          <div className="rounded-3xl bg-white p-8 sm:p-12 shadow-xl border border-slate-200/80 space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#0B39BB] text-2xl font-serif">
              “
            </div>
            <p className="text-sm sm:text-base font-medium text-slate-700 leading-relaxed italic max-w-2xl mx-auto">
              &quot;It was a great experience. Booking a verified electrician took less than 2 minutes and the technician arrived within 30 minutes. Super clean, fast, and transparent pricing!&quot;
            </p>
            <div className="flex justify-center text-amber-400 text-sm">
              ★★★★★
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-900">Muzamil War</p>
              <p className="text-xs text-slate-500">Verified Customer • Srinagar</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
