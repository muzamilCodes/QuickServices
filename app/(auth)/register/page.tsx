"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  BriefcaseBusiness, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  Clock3 
} from "lucide-react";
import toast from "react-hot-toast";
import { getApiBaseUrl } from "@/lib/apiBase";

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"customer" | "provider">("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      setFormData({ ...formData, [name]: value.replace(/\D/g, "").slice(0, 10) });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.mobile || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    const isPasswordValid =
      formData.password.length >= 8 &&
      /[A-Z]/.test(formData.password) &&
      /[a-z]/.test(formData.password) &&
      /[0-9]/.test(formData.password) &&
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(formData.password);

    if (!isPasswordValid) {
      toast.error("Password kam se kam 8 digits/characters ka hona chahiye aur usme Uppercase (A), Lowercase (a), Number (1), aur Special symbol (@) zaroori hai.");
      return;
    }

    if (formData.mobile.length !== 10) {
      toast.error("Mobile number must be 10 digits");
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = getApiBaseUrl();

      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile,
        phone: formData.mobile,
        password: formData.password,
      };

      const response = await fetch(`${apiUrl}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let result: { success?: boolean; message?: string } | null = null;
      try {
        result = await response.json();
      } catch {
        // ignore
      }

      if (response.ok && result?.success) {
        localStorage.setItem("verifyEmail", payload.email);
        toast.success("OTP sent to your email! Please verify.");
        setTimeout(() => {
          router.push("/otp");
        }, 500);
      } else {
        toast.error(result?.message || `Registration failed (${response.status})`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="w-full max-w-lg">
        
        {/* Header Branding */}
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
            Create an Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose whether you want to book services or register as a service provider
          </p>
        </div>

        {/* 2-Card Account Type Choice */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAccountType("customer")}
            className={`rounded-2xl p-4 text-left border-2 transition-all ${
              accountType === "customer"
                ? "border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-600/20"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl ${accountType === "customer" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                <UserCheck className="h-4 w-4" />
              </div>
              {accountType === "customer" && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">Customer</h3>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Book plumbers, electricians & cleaners with live GPS tracking
            </p>
          </button>

          <button
            type="button"
            onClick={() => setAccountType("provider")}
            className={`rounded-2xl p-4 text-left border-2 transition-all ${
              accountType === "provider"
                ? "border-orange-500 bg-orange-50/60 shadow-md ring-2 ring-orange-500/20"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl ${accountType === "provider" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-700"}`}>
                <BriefcaseBusiness className="h-4 w-4" />
              </div>
              {accountType === "provider" && <CheckCircle2 className="h-4 w-4 text-orange-500" />}
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">Service Provider</h3>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              Apni service offer karein, admin verification & alag dashboard
            </p>
          </button>
        </div>

        {/* ================= CONDITION 1: SERVICE PROVIDER SELECTED ================= */}
        {accountType === "provider" ? (
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-orange-200 space-y-6">
            <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-4 border border-orange-200">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-extrabold text-orange-700 mb-2">
                <BriefcaseBusiness className="h-3 w-3" /> Dedicated Provider Registration
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                Register as a Verified QuickServices Specialist
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Agar aap plumber, electrician, technician ya koi bhi service provider hain, toh aapka alag professional profile form hai jahan aap category, services, pricing, aur location fill karenge.
              </p>
            </div>

            {/* 3-Step Verification Flow */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Registration & Approval Process:
              </h4>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 border border-slate-100">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-500 text-xs font-black text-white shrink-0">
                  1
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Fill Professional Profile</p>
                  <p className="text-[11px] text-slate-500">Apni category, services offered, rates, phone number, aur location details bharein.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 border border-slate-100">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white shrink-0">
                  2
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Admin Verification</p>
                  <p className="text-[11px] text-slate-500">Aapka form Admin ke paas verification ke liye jayega. Admin verify aur approve karega.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 border border-slate-100">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-xs font-black text-white shrink-0">
                  3
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Dedicated Provider Dashboard</p>
                  <p className="text-[11px] text-slate-500">Aapko apna alag Pro Dashboard milega jahan aap customer requests accept kar sakenge aur live GPS tracking chalu kar sakenge.</p>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <Link
              href="/providers/register"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-500/25 hover:opacity-95 transition"
            >
              <span>Continue to Provider Registration Form</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="text-center text-xs text-slate-500">
              Already registered as a provider?{" "}
              <Link href="/login" className="font-bold text-orange-600 hover:underline">
                Login here
              </Link>
            </p>
          </div>
        ) : (
          /* ================= CONDITION 2: CUSTOMER SELECTED ================= */
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    placeholder="e.g. Muzamil War"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
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

              {/* Mobile Phone Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Mobile Number (10 Digits)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="tel"
                    name="mobile"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                    placeholder="9876543210"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Create Password (A / a / 1 / @)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition font-medium"
                    placeholder="Min 8 chars: A-Z, a-z, 0-9, symbol"
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

                {/* Live Password Rules Indicator */}
                {formData.password && (
                  <div className="mt-2.5 rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs space-y-1">
                    <p className="font-bold text-slate-700 text-[11px] mb-1">
                      Password Requirements (Min 8 Digits & Mixed Types):
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <span className={formData.password.length >= 8 ? "text-emerald-600 font-semibold flex items-center gap-1" : "text-slate-400 flex items-center gap-1"}>
                        {formData.password.length >= 8 ? "✓" : "○"} Min 8 characters
                      </span>
                      <span className={/[A-Z]/.test(formData.password) ? "text-emerald-600 font-semibold flex items-center gap-1" : "text-slate-400 flex items-center gap-1"}>
                        {/[A-Z]/.test(formData.password) ? "✓" : "○"} Uppercase (A-Z)
                      </span>
                      <span className={/[a-z]/.test(formData.password) ? "text-emerald-600 font-semibold flex items-center gap-1" : "text-slate-400 flex items-center gap-1"}>
                        {/[a-z]/.test(formData.password) ? "✓" : "○"} Lowercase (a-z)
                      </span>
                      <span className={/[0-9]/.test(formData.password) ? "text-emerald-600 font-semibold flex items-center gap-1" : "text-slate-400 flex items-center gap-1"}>
                        {/[0-9]/.test(formData.password) ? "✓" : "○"} Number (0-9)
                      </span>
                      <span className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(formData.password) ? "text-emerald-600 font-semibold flex items-center gap-1 col-span-2" : "text-slate-400 flex items-center gap-1 col-span-2"}>
                        {/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(formData.password) ? "✓" : "○"} Special Symbol (@, $, !, %, *, #, etc.)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#0f62c9,#ff8a3d)] py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:opacity-95 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Sending verification OTP...</span>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Create Customer Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-blue-600 hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
