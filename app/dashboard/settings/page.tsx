'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Settings,
  User,
  Mail,
  Phone,
  Lock,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getApiBaseUrl } from '@/lib/apiBase';

export default function SettingsPage() {
  const router = useRouter();
  const API = getApiBaseUrl();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuthStore();

  // Profile Edit State
  const [username, setUsername] = useState(user?.username || 'War Muzamil');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileMessageType, setProfileMessageType] = useState<'success' | 'error'>('success');

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordMessageType, setPasswordMessageType] = useState<'success' | 'error'>('success');

  // Account Deletion State
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Formal Deletion Request State
  const [deletionRequestStatus, setDeletionRequestStatus] = useState<string | null>(null);
  const [requestReason, setRequestReason] = useState('No longer using the service');
  const [requestingDeletion, setRequestingDeletion] = useState(false);

  const fetchProfileAndDeletion = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API}/user/account/deletion-request`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.request) {
        setDeletionRequestStatus(data.request.status);
      }
    } catch (e) {
      console.error(e);
    }
  }, [API]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
    if (isAuthenticated) {
      if (user) {
        setUsername(user.username || 'War Muzamil');
        setMobile(user.mobile || '');
        setEmail(user.email || '');
      }
      void fetchProfileAndDeletion();
    }
  }, [isAuthenticated, authLoading, user, fetchProfileAndDeletion, router]);

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage('');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/user/update-profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, mobile, email }),
      });
      const data = await res.json();
      if (data.success) {
        setProfileMessageType('success');
        setProfileMessage('Profile details updated successfully!');
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          useAuthStore.getState().checkAuth();
        }
      } else {
        setProfileMessageType('error');
        setProfileMessage(data.message || 'Could not update profile');
      }
    } catch {
      setProfileMessageType('error');
      setProfileMessage('Network error. Failed to save profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMessageType('error');
      setPasswordMessage('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessageType('error');
      setPasswordMessage('New passwords do not match');
      return;
    }

    setPasswordSaving(true);
    setPasswordMessage('');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/user/change/password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: oldPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMessageType('success');
        setPasswordMessage('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessageType('error');
        setPasswordMessage(data.message || 'Failed to change password');
      }
    } catch {
      setPasswordMessageType('error');
      setPasswordMessage('Server error changing password');
    } finally {
      setPasswordSaving(false);
    }
  };

  // Handle Instant Account Deletion
  const handleInstantDelete = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE in capital letters to confirm');
      return;
    }

    setDeleting(true);
    setDeleteError('');

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/user/account/me`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Your QuickServices account and all associated data have been permanently deleted.');
        await logout();
        router.push('/');
      } else {
        setDeleteError(data.message || 'Could not delete account. Active bookings may exist.');
      }
    } catch {
      setDeleteError('Network error while deleting account');
    } finally {
      setDeleting(false);
    }
  };

  // Handle Request Deletion (30-day graceful deletion)
  const handleRequestDeletion = async () => {
    setRequestingDeletion(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/user/account/deletion-request`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: requestReason }),
      });
      const data = await res.json();
      if (data.success) {
        setDeletionRequestStatus('pending');
        alert('Account deletion request submitted. An admin will review and confirm within 48 hours.');
      } else {
        alert(data.message || 'Error submitting deletion request');
      }
    } catch {
      alert('Error connecting to backend');
    } finally {
      setRequestingDeletion(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 flex items-center gap-2.5">
          <Settings className="h-7 w-7 text-blue-600" /> Account Settings & Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal details, credentials, and privacy options.
        </p>
      </div>

      {/* ── SECTION 1: PROFILE DETAILS ────────────────────────────────────────── */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-slate-200 shadow-md">
            <Image
              src="/hero-user.jpg"
              alt={username}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-950">{username}</h2>
            <p className="text-xs text-slate-500">{email}</p>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-0.5 text-[11px] font-bold text-blue-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified Customer Account
            </span>
          </div>
        </div>

        {profileMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold border ${
              profileMessageType === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {profileMessage}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" /> Full Name / Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> Mobile Number
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10 digit mobile"
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={profileSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-60"
            >
              {profileSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* ── SECTION 2: CHANGE PASSWORD ─────────────────────────────────────────── */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <h2 className="text-lg font-black text-slate-950 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-indigo-600" /> Change Password
        </h2>
        <p className="text-xs text-slate-500">Ensure your QuickServices account uses a strong, secure password.</p>

        {passwordMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold border ${
              passwordMessageType === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {passwordMessage}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 chars"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordSaving}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-60"
          >
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* ── SECTION 3: DANGER ZONE (ACCOUNT DELETION) ─────────────────────────── */}
      <div className="rounded-3xl bg-rose-50/50 p-6 sm:p-8 border border-rose-200 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-rose-950">Danger Zone: Delete Account</h2>
            <p className="text-xs text-rose-700">Permanent removal of your profile, booking records, and saved addresses.</p>
          </div>
        </div>

        {deletionRequestStatus === 'pending' ? (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs font-bold text-amber-800">
            ⏳ Your account deletion request is currently under review by QuickServices administration.
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Once you delete your account, there is no going back. All active service warranties, address records,
              and historical invoices will be wiped in accordance with Indian Digital Data Protection laws.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-sm shadow-rose-500/20 transition"
              >
                <Trash2 className="h-4 w-4" />
                Permanently Delete Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: CONFIRM PERMANENT ACCOUNT DELETION ─────────────────────────── */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="h-8 w-8 shrink-0" />
              <div>
                <h3 className="text-lg font-black text-slate-950">Delete Account Permanently?</h3>
                <p className="text-xs text-rose-600 font-semibold">This action cannot be undone.</p>
              </div>
            </div>

            {deleteError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700">
                {deleteError}
              </div>
            )}

            <p className="text-xs text-slate-600 leading-relaxed">
              Please enter your password and type <span className="font-mono font-bold text-slate-900">DELETE</span> below
              to confirm you want to wipe all records.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Account Password</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type <span className="font-mono text-rose-600">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono text-slate-900 outline-none focus:border-rose-600"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-300 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInstantDelete}
                disabled={deleting || deleteConfirmText !== 'DELETE'}
                className="flex-1 rounded-xl bg-rose-600 py-3 text-xs font-bold text-white hover:bg-rose-700 transition disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
