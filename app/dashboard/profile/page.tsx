'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleCheckBig, Loader2, Lock, Mail, PencilLine, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getApiBaseUrl } from '@/lib/apiBase';
import AccountDeletionSection from '@/components/AccountDeletionSection';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', mobile: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [saving, setSaving] = useState(false);

  // Email change OTP state
  const [emailChangePending, setEmailChangePending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        useAuthStore.getState().checkAuth();
      }
      if (!useAuthStore.getState().isAuthenticated) {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  const startEditing = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
    });
    setIsEditing(true);
    setMessage('');
    setEmailChangePending(false);
    setEmailOtp('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(`${getApiBaseUrl()}/user/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json() as {
        success?: boolean;
        message?: string;
        emailChangePending?: boolean;
        pendingEmail?: string;
        user?: typeof user;
        payload?: typeof user;
      };

      if (data.success && data.emailChangePending) {
        // Email change requested → show OTP input for new email
        setEmailChangePending(true);
        setPendingEmail(data.pendingEmail || formData.email);
        setMessageType('success');
        setMessage(data.message || `OTP sent to ${data.pendingEmail}. Please enter it below to confirm.`);

        // Update non-email fields in store immediately
        const returnedUser = data.user;
        if (returnedUser) {
          const updatedUser = { ...(user as any), ...returnedUser, email: user?.email }; // keep old email until confirmed
          localStorage.setItem('user', JSON.stringify(updatedUser));
          useAuthStore.setState({ user: updatedUser as any });
        }
        return;
      }

      if (data.success) {
        const returnedUser = data.user || data.payload;
        if (returnedUser) {
          const guaranteedId = (returnedUser as any)?._id ?? user?._id ?? '';
          const updatedUser = {
            ...(user || { _id: guaranteedId } as any),
            ...formData,
            ...returnedUser,
            _id: guaranteedId,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          useAuthStore.setState({ user: updatedUser as any });
        }
        setMessageType('success');
        setMessage('Profile updated successfully.');
        setIsEditing(false);
      } else {
        setMessageType('error');
        setMessage(data.message || 'Unable to update profile.');
      }
    } catch {
      setMessageType('error');
      setMessage('Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOtp.trim()) return;
    setVerifying(true);
    setMessage('');

    try {
      const res = await fetch(`${getApiBaseUrl()}/user/confirm-email-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ otp: emailOtp.trim() }),
      });
      const data = await res.json() as {
        success?: boolean;
        message?: string;
        token?: string;
        user?: typeof user;
      };

      if (data.success) {
        // Store new token + updated user
        if (data.token) localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          useAuthStore.setState({ user: data.user as any });
        }
        setEmailChangePending(false);
        setEmailOtp('');
        setIsEditing(false);
        setMessageType('success');
        setMessage('Email updated successfully! Your new email is now active.');
      } else {
        setMessageType('error');
        setMessage(data.message || 'Invalid or expired OTP.');
      }
    } catch {
      setMessageType('error');
      setMessage('Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading your profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left panel */}
          <div className="rounded-[30px] bg-slate-950 p-8 text-white shadow-xl shadow-slate-200 dark:shadow-black/40">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10">
              <UserRound className="h-8 w-8 text-orange-300" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold">{user?.username || 'My Profile'}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Keep your contact details up to date so the next booking is quicker and your confirmations land in the right place.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Account status</p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-white">
                  <CircleCheckBig className="h-4 w-4 text-emerald-300" />
                  {user?.isVerified ? 'Verified account' : 'Verification pending'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</p>
                <p className="mt-1.5 text-sm text-slate-200 break-all">{user?.email || '—'}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>OTP-verified on change</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full rounded-2xl border border-red-300/30 bg-red-400/10 px-5 py-3 text-sm font-medium text-red-100 transition hover:bg-red-400/20"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Right panel */}
          <div className="rounded-[30px] bg-white/90 dark:bg-[#161b22] p-8 shadow-xl shadow-slate-100 dark:shadow-black/30">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Personal details</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Profile information</h2>
              </div>
              {!isEditing && (
                <button
                  onClick={startEditing}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-white/15 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <PencilLine className="h-4 w-4" />
                  Edit
                </button>
              )}
            </div>

            {/* Status message */}
            {message && (
              <div className={`mt-5 rounded-2xl px-4 py-3 text-sm border ${
                messageType === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                  : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50'
              }`}>
                {message}
              </div>
            )}

            {/* OTP confirmation box for email change */}
            {emailChangePending && (
              <form onSubmit={handleConfirmEmailOtp} className="mt-5 rounded-2xl border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/20 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Verify New Email</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                      Enter the 6-digit OTP sent to <strong>{pendingEmail}</strong>
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    className="flex-1 rounded-2xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-[#0d1117] px-4 py-3 text-sm font-mono tracking-widest outline-none focus:border-blue-500"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={verifying || emailOtp.length !== 6}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    <span>{verifying ? 'Verifying...' : 'Confirm'}</span>
                  </button>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  OTP is valid for 10 minutes. After confirming, your old email will no longer work for login.
                </p>
              </form>
            )}

            {/* View mode */}
            {!isEditing ? (
              <div className="mt-8 space-y-5">
                <div className="rounded-2xl border border-black/5 dark:border-white/8 bg-slate-50 dark:bg-white/4 p-5">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <UserRound className="h-4 w-4" /> Username
                  </p>
                  <p className="mt-2 text-lg font-medium text-slate-950 dark:text-white">{user?.username || '-'}</p>
                </div>
                <div className="rounded-2xl border border-black/5 dark:border-white/8 bg-slate-50 dark:bg-white/4 p-5">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <Mail className="h-4 w-4" /> Email
                  </p>
                  <p className="mt-2 text-lg font-medium text-slate-950 dark:text-white break-all">{user?.email || '-'}</p>
                </div>
                <div className="rounded-2xl border border-black/5 dark:border-white/8 bg-slate-50 dark:bg-white/4 p-5">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <Phone className="h-4 w-4" /> Mobile
                  </p>
                  <p className="mt-2 text-lg font-medium text-slate-950 dark:text-white">{user?.mobile || '-'}</p>
                </div>
              </div>
            ) : (
              /* Edit form */
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 ml-1">Username</label>
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1117] px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-blue-500"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 ml-1">
                    Email <span className="text-orange-500 font-normal">(OTP verification required to change)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1117] px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-blue-500"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 ml-1">Mobile</label>
                  <input
                    type="tel"
                    placeholder="Mobile"
                    className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d1117] px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-blue-500"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 dark:bg-white px-5 py-3 text-sm font-medium text-white dark:text-slate-900 transition hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setMessage(''); setEmailChangePending(false); }}
                    className="flex-1 rounded-2xl border border-slate-300 dark:border-white/15 px-5 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        <div className="mt-6">
          <AccountDeletionSection />
        </div>
      </div>
    </div>
  );
}
