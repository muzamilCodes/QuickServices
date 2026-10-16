"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, LogIn, BriefcaseBusiness, UserCheck, ShieldCheck, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { getApiBaseUrl } from "@/lib/apiBase";

export default function LoginPage() {
  const router = useRouter();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginRole, setLoginRole] = useState<"customer" | "provider">("customer");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success && result.token) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        checkAuth();
        toast.success(`Welcome back, ${result.user.username || "User"}!`);
        
        if (result.user.isAdmin) {
          router.push("/admin");
        } else if (result.user.role === "provider" || loginRole === "provider") {
          router.push("/dashboard/provider");
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.error(result.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f62c9,#ff8a3d)] text-white shadow-md shadow-blue-500/20">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black text-slate-950">
              Quick<span className="text-blue-600">Services</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Account Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sign in to access your dashboard, bookings, and live tracking
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
          <button
            type="button"
            onClick={() => setLoginRole("customer")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
              loginRole === "customer"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Customer Login</span>
          </button>
          <button
            type="button"
            onClick={() => setLoginRole("provider")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
              loginRole === "provider"
                ? "bg-orange-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            <span>Service Provider (Pro)</span>
          </button>
        </div>

        {/* Login Form Card */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#0f62c9,#ff8a3d)] py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:opacity-95 transition disabled:opacity-50"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>
                    {loginRole === "provider" ? "Login to Pro Dashboard" : "Login to Customer Account"}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* New to platform */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Don&apos;t have an account yet?{" "}
              <Link href="/register" className="font-bold text-blue-600 hover:underline">
                Sign up as Customer
              </Link>
            </p>
          </div>
        </div>

        {/* Dedicated Service Provider Card */}
        <div className="mt-4 rounded-3xl bg-gradient-to-r from-orange-50 to-amber-50 p-5 border border-orange-200 shadow-sm text-left">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
                <BriefcaseBusiness className="h-4 w-4" /> Apni Service Dena Chahte Hain?
              </p>
              <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
                Register as a Verified Service Provider
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Fill your professional profile, select your skills & pricing. Once approved by Admin, start getting direct local bookings!
              </p>
            </div>
            <Link
              href="/providers/register"
              className="shrink-0 rounded-2xl bg-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-600 transition flex items-center gap-1"
            >
              <span>Join Pro</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
