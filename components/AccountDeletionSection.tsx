'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert, Trash2, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getApiBaseUrl } from '@/lib/apiBase';

type DeletionStatus = 'pending' | 'approved' | 'rejected';

type DeletionRequest = {
  _id: string;
  status: DeletionStatus;
  reason: string;
  details?: string;
  adminNote?: string;
  requestedAt?: string;
  reviewedAt?: string;
};

const REASON_MIN = 10;

export default function AccountDeletionSection() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [request, setRequest] = useState<DeletionRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const API_URL = getApiBaseUrl();

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/user/account/deletion-request`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = (await res.json()) as { request?: DeletionRequest | null };
      setRequest(data.request || null);
    } catch {
      setRequest(null);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const submitRequest = async () => {
    if (reason.trim().length < REASON_MIN) {
      setError(`Please tell us why you want to delete your account (at least ${REASON_MIN} characters).`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/user/account/deletion-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason: reason.trim(), details: details.trim() })
      });
      const data = (await res.json()) as { success?: boolean; message?: string; request?: DeletionRequest };
      if (!res.ok || !data.success) {
        setError(data.message || 'Unable to send your request right now.');
        return;
      }
      setRequest(data.request || null);
      setReason('');
      setDetails('');
      setIsModalOpen(false);
    } catch {
      setError('Unable to send your request. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const leaveAfterDeletion = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-slate-200/90 bg-white p-6 text-sm text-slate-500 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking your account status...
      </div>
    );
  }

  if (request?.status === 'approved') {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-lg sm:p-8 dark:border-rose-900 dark:bg-rose-950/40">
        <div className="flex items-start gap-4">
          <ShieldAlert className="mt-1 h-6 w-6 shrink-0 text-rose-600 dark:text-rose-400" />
          <div className="space-y-3">
            <h3 className="text-xl font-extrabold text-rose-900 dark:text-rose-100">
              Aap ka account delete ho giya hai
            </h3>
            <p className="text-sm leading-6 text-rose-800 dark:text-rose-200">
              Your account has been permanently deleted by our team, as per your request. You can no longer log in,
              book services, or receive updates on this account.
            </p>
            <button
              onClick={() => void leaveAfterDeletion()}
              className="rounded-2xl bg-rose-700 px-6 py-2.5 text-sm font-bold text-white hover:bg-rose-800"
            >
              Sign out and return home
            </button>
          </div>
        </div>
      </section>
    );
  }

  const pending = request?.status === 'pending';

  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-lg sm:p-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <h3 className="text-xl font-extrabold text-slate-950 dark:text-white">Close your account</h3>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
            Deleting your account needs our admin team to approve it. Tell us why you want to leave — your account
            stays fully active until an admin reviews the request.
          </p>
        </div>

        {pending ? (
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-xs font-bold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
            <Loader2 className="h-3.5 w-3.5" />
            Pending admin review
          </span>
        ) : (
          <button
            onClick={() => { setError(''); setIsModalOpen(true); }}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-rose-300 bg-rose-50 px-6 py-3 text-sm font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70"
          >
            <Trash2 className="h-4 w-4" />
            Request account deletion
          </button>
        )}
      </div>

      {request && (
        <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-5 text-sm dark:bg-slate-800/70">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            {pending ? 'Your submitted reason' : 'Your last request'}
          </p>
          <p className="font-medium leading-6 text-slate-800 dark:text-slate-200">{request.reason}</p>
          {request.details && (
            <p className="leading-6 text-slate-600 dark:text-slate-400">{request.details}</p>
          )}
          {request.status === 'rejected' && (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-rose-700 dark:bg-rose-950/50 dark:text-rose-200">
              Our team did not approve this request.{request.adminNote ? ` Note: ${request.adminNote}` : ''}
            </p>
          )}
          {request.requestedAt && (
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Submitted on {new Date(request.requestedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xl font-extrabold text-slate-950 dark:text-white">
                  Why are you deleting your account?
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  This goes straight to our admin team along with your profile and booking details.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="deletion-reason" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Reason for deletion *
                </label>
                <textarea
                  id="deletion-reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. I am moving out of Kashmir and will not need these services."
                  className="mt-2 w-full rounded-2xl border border-slate-300 p-3.5 text-sm focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <p className="mt-1 text-xs text-slate-500">{reason.trim().length}/{REASON_MIN} minimum characters</p>
              </div>

              <div>
                <label htmlFor="deletion-details" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Anything else we should know? (optional)
                </label>
                <textarea
                  id="deletion-details"
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Open bookings, data you want removed, feedback..."
                  className="mt-2 w-full rounded-2xl border border-slate-300 p-3.5 text-sm focus:border-rose-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              {error && (
                <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-200">
                  {error}
                </p>
              )}

              <p className="rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                Once an admin approves this request, your profile, provider listings and login access are removed
                permanently. This cannot be undone from the app.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                onClick={() => void submitRequest()}
                disabled={submitting || reason.trim().length < REASON_MIN}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-700 px-6 py-3 text-sm font-bold text-white hover:bg-rose-800 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {submitting ? 'Sending request...' : 'Send deletion request'}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
