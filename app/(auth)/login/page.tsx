"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  LogIn, 
  BriefcaseBusiness, 
  UserCheck, 
  Clock3, 
  ArrowRight,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { getApiBaseUrl } from "@/lib/apiBase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginRole, setLoginRole] = useState<"customer" | "provider">("customer");
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (searchParams.get("pending") === "pro") {
      setLoginRole("provider");
      setPendingNotice(
        "Your Service Provider registration has been submitted successfully! Your profile is queued for Admin review. Once approved, you will receive a confirmation email and can log in here to access your Provider Dashboard."
      );
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPendingNotice(null);
    
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
        credentials: "include",
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          role: loginRole,
        }),
      });

      const result = await response.json();

      // Provider pending approval
      if (response.status === 403 && result.isPendingApproval) {
        setPendingNotice(result.message || "Your Service Provider account is pending Admin approval. You will be able to log in once verified by the Admin.");
        toast.error("Account pending Admin approval");
        return;
      }

      // Wrong tab: provider logging in as customer or vice versa
      if (response.status === 403) {
        toast.error(result.message || "You are logging in on the wrong tab. Please switch the tab above.");
        return;
      }

      // Account not verified — redirect to OTP verification
      if (response.status === 401 && result.needsVerification) {
        const targetEmail = result.email || formData.email.trim();
        localStorage.setItem("verifyEmail", targetEmail);
        localStorage.setItem("pendingEmail", targetEmail);
        if (result.devOtp) {
          localStorage.setItem("devRegisterOtp", result.devOtp);
        }
        toast.error("Account not verified. Check your email for OTP.");
        router.push(`/otp?email=${encodeURIComponent(targetEmail)}`);
        return;
      }

      // Wrong credentials or account doesn't exist
      if (response.status === 401) {
        toast.error(result.message || "Incorrect email/password. If you don't have an account, please register first.");
        return;
      }

      if (result.success && result.token) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        checkAuth();
        toast.success(`Welcome back, ${result.user.username || "User"}!`);
        
        if (result.user.isAdmin || result.user.role === "admin") {
          router.push("/admin");
        } else if (result.user.role === "provider") {
          router.push("/dashboard/provider");
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.error(result.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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

      {/* Pending Admin Approval Banner */}
      {pendingNotice && (
        <div className="mb-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 p-4 shadow-sm text-left animate-in fade-in">
          <div className="flex items-start gap-3">
            <Clock3 className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black uppercase text-amber-950">
                Application Pending Admin Approval
              </h4>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                {pendingNotice}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Role Selector Tabs */}
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
        <button
          type="button"
          onClick={() => {
            setLoginRole("customer");
            setPendingNotice(null);
          }}
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
          {/* Email or Mobile Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address or Mobile Number
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                placeholder="name@example.com or 10-digit mobile"
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
        <div className="mt-5 pt-5 border-t border-slate-100">
          <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3 text-center">
            <p className="text-xs text-slate-700 font-medium">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-extrabold text-blue-600 hover:underline">
                Create a free account →
              </Link>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Customer Login tab = normal customer accounts only
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <Suspense fallback={<div className="text-sm font-bold text-slate-500">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
