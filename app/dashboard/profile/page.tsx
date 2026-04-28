'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircleCheckBig, Mail, PencilLine, Phone, UserRound } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', mobile: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const startEditing = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:4000/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };

      if (data.success) {
        if (user) {
          const updatedUser = {
            ...user,
            ...formData,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          useAuthStore.setState({ user: updatedUser });
        }
        setMessage('Profile updated successfully.');
        setIsEditing(false);
      } else {
        setMessage(data.message || 'Unable to update profile.');
      }
    } catch {
      setMessage('Update failed.');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading your profile...</div>;
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] bg-slate-950 p-8 text-white shadow-xl shadow-slate-200">
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
              <button
                onClick={handleLogout}
                className="w-full rounded-2xl border border-red-300/30 bg-red-400/10 px-5 py-3 text-sm font-medium text-red-100"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="rounded-[30px] bg-white/90 p-8 shadow-xl shadow-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Personal details</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Profile information</h2>
              </div>
              {!isEditing && (
                <button
                  onClick={startEditing}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  <PencilLine className="h-4 w-4" />
                  Edit
                </button>
              )}
            </div>

            {message && (
              <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}

            {!isEditing ? (
              <div className="mt-8 space-y-5">
                <div className="rounded-2xl border border-black/5 bg-slate-50 p-5">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <UserRound className="h-4 w-4" />
                    Username
                  </p>
                  <p className="mt-2 text-lg font-medium text-slate-950">{user?.username || '-'}</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-slate-50 p-5">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="mt-2 text-lg font-medium text-slate-950">{user?.email || '-'}</p>
                </div>
                <div className="rounded-2xl border border-black/5 bg-slate-50 p-5">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <Phone className="h-4 w-4" />
                    Mobile
                  </p>
                  <p className="mt-2 text-lg font-medium text-slate-950">{user?.mobile || '-'}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <input
                  type="tel"
                  placeholder="Mobile"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                />
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button type="submit" className="flex-1 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white">
                    Save changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
