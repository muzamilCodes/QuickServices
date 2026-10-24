'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, ShieldAlert, UserX, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getApiBaseUrl } from '@/lib/apiBase';

type Stats = {
  bookingsAsCustomer: number;
  bookingsAsProvider: number;
  activeBookings: number;
};

type DeletionRequest = {
  _id: string;
  accountType: 'customer' | 'provider';
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  details?: string;
  adminNote?: string;
  requestedAt?: string;
  reviewedAt?: string;
  reviewedBy?: { username?: string; email?: string };
  accountSnapshot?: { username?: string; email?: string; mobile?: string; providerName?: string };
  account?: { _id?: string; username?: string; email?: string; mobile?: string; role?: string; createdAt?: string };
  provider?: { name?: string; category?: string; isApproved?: boolean; completedBookings?: number; rating?: number } | null;
  stats?: Stats;
};

const FILTERS = [
  { key: 'pending', label: 'Pending requests' },
  { key: 'approved', label: 'Deleted accounts' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' }
];

const EMPTY_STATS: Stats = { bookingsAsCustomer: 0, bookingsAsProvider: 0, activeBookings: 0 };

export default function AdminDeletionsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<DeletionRequest | null>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [note, setNote] = useState('');
  const [forceDelete, setForceDelete] = useState(false);
  const [working, setWorking] = useState(false);

  const API_URL = getApiBaseUrl();

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/deletion-requests?status=${filter}`, { headers: getHeaders() });
      const data = (await res.json()) as { success?: boolean; requests?: DeletionRequest[]; message?: string };
      if (data.success) setRequests(data.requests || []);
      else setMessage(data.message || 'Unable to load deletion requests.');
    } catch {
      setMessage('Unable to load deletion requests.');
    } finally {
      setLoading(false);
    }
  }, [API_URL, filter]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) void fetchRequests();
  }, [fetchRequests, isAuthenticated]);

  const openAction = (request: DeletionRequest, kind: 'approve' | 'reject') => {
    setTarget(request);
    setAction(kind);
    setNote('');
    setForceDelete(false);
    setMessage('');
  };

  const runAction = async () => {
    if (!target) return;
    setWorking(true);
    setMessage('');
    try {
      const endpoint = action === 'approve' ? 'approve' : 'reject';
      const body = action === 'approve'
        ? { adminNote: note.trim(), force: (target.stats?.activeBookings || 0) > 0 ? forceDelete : undefined }
        : { adminNote: note.trim() };

      const res = await fetch(`${API_URL}/admin/deletion-requests/${target._id}/${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body)
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        activeBookings?: number;
      };

      if (!res.ok || !data.success) {
        if (res.status === 409 && data.activeBookings) {
          setMessage(data.message || 'This account has active bookings.');
          setForceDelete(true);
        } else {
          setMessage(data.message || 'Action failed.');
        }
        return;
      }

      setMessage(
        action === 'approve'
          ? `${data.message} The user has been notified by email.`
          : 'Request rejected and the user has been notified.'
      );
      setTarget(null);
      await fetchRequests();
    } catch {
      setMessage('Action failed. Check your connection.');
    } finally {
      setWorking(false);
    }
  };

  const renderDetail = (label: string, value?: string | number | null) => (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-slate-100">{value || '—'}</p>
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.push('/admin')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            ←
          </button>
          <div>
            <h1 className="mb-2 text-3xl font-semibold text-slate-950">Account deletion requests</h1>
            <p className="text-slate-600">
              Every request carries the reason the user gave. Approving deletes the account permanently.
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map(item => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === item.key
                  ? 'bg-slate-950 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {message && (
          <div className="mb-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{message}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
            Loading requests...
          </div>
        ) : (
          <div className="space-y-5">
            {requests.length === 0 && (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                No {filter === 'all' ? '' : `${filter} `}deletion requests found.
              </p>
            )}

            {requests.map(request => {
              const account = (request.account || request.accountSnapshot || {}) as {
                username?: string;
                email?: string;
                mobile?: string;
                createdAt?: string;
              };
              const stats = request.stats || EMPTY_STATS;
              return (
                <div
                  key={request._id}
                  className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg dark:bg-slate-900"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        {request.accountType === 'provider' ? 'Service provider' : 'Customer'}
                        {request.provider?.name ? ` · ${request.provider.name}` : ''}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                        {account.username || 'Deleted account'}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Request #{String(request._id).slice(-6)} · submitted{' '}
                        {request.requestedAt ? new Date(request.requestedAt).toLocaleString() : '—'}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                        request.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : request.status === 'approved'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
                    {renderDetail('Email', account.email)}
                    {renderDetail('Mobile', account.mobile)}
                    {renderDetail(
                      'Joined',
                      account.createdAt ? new Date(account.createdAt).toLocaleDateString() : 'Account removed'
                    )}
                    {renderDetail('Category', request.provider?.category)}
                    {renderDetail('Bookings (customer)', stats.bookingsAsCustomer)}
                    {renderDetail('Bookings (provider)', stats.bookingsAsProvider)}
                    {renderDetail(
                      'Active bookings',
                      request.status === 'pending' ? stats.activeBookings : 'Locked at deletion'
                    )}
                    {renderDetail('Rating', request.provider?.rating ?? '—')}
                  </div>

                  <div className="mt-5 space-y-2 rounded-2xl border border-rose-200 bg-rose-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-700">Reason for deletion</p>
                    <p className="text-sm font-medium leading-6 text-rose-900">{request.reason}</p>
                    {request.details && <p className="text-sm leading-6 text-rose-800">{request.details}</p>}
                  </div>

                  {request.adminNote && (
                    <p className="mt-4 rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-700">
                      <span className="font-bold">Admin note:</span> {request.adminNote}
                      {request.reviewedAt ? ` · reviewed ${new Date(request.reviewedAt).toLocaleString()}` : ''}
                    </p>
                  )}

                  {request.status === 'pending' && (
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={() => openAction(request, 'approve')}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-700 px-6 py-3 text-sm font-bold text-white hover:bg-rose-800"
                      >
                        <UserX className="h-4 w-4" />
                        Approve and delete account
                      </button>
                      <button
                        onClick={() => openAction(request, 'reject')}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject request
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8 dark:bg-slate-900">
            <div className="flex items-start gap-4">
              <ShieldAlert className="mt-1 h-7 w-7 shrink-0 text-rose-600" />
              <div>
                <h3 className="text-xl font-extrabold text-slate-950 dark:text-white">
                  {action === 'approve' ? 'Delete this account permanently?' : 'Reject this deletion request?'}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {action === 'approve'
                    ? `The ${target.accountType} account ${(target.account?.username || target.accountSnapshot?.username || 'this account')} and its provider listings will be removed, and the user will be notified by email.`
                    : 'The account stays active and the user is told their request was not approved.'}
                </p>
              </div>
            </div>

            {(target.stats?.activeBookings || 0) > 0 && action === 'approve' && (
              <label className="mt-5 flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <input
                  type="checkbox"
                  checked={forceDelete}
                  onChange={(e) => setForceDelete(e.target.checked)}
                  className="mt-1 h-4 w-4"
                />
                This account has {target.stats?.activeBookings} active booking(s). Checking this box deletes the
                account anyway and leaves those bookings unassigned.
              </label>
            )}

            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={action === 'approve' ? 'Internal note (optional)' : 'Tell the user why (optional)'}
              className="mt-5 w-full rounded-2xl border border-slate-300 p-3.5 text-sm focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                onClick={() => void runAction()}
                disabled={working || (action === 'approve' && (target.stats?.activeBookings || 0) > 0 && !forceDelete)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-700 px-6 py-3 text-sm font-bold text-white hover:bg-rose-800 disabled:opacity-50"
              >
                {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {working ? 'Working...' : action === 'approve' ? 'Yes, delete account' : 'Reject request'}
              </button>
              <button
                onClick={() => setTarget(null)}
                className="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
