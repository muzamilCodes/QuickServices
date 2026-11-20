'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getApiBaseUrl } from '@/lib/apiBase';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

interface Complaint {
  bookingId: string;
  customerName: string;
  serviceType: string;
  status: string;
  complaint: { reason: string; description: string; status: string; createdAt: string };
  user?: { username?: string; email?: string };
}

const API_URL = getApiBaseUrl();

export default function AdminComplaintsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/complaints`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) setComplaints(data.complaints || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
    if (isAuthenticated) fetchComplaints();
  }, [isAuthenticated, isLoading, fetchComplaints, router]);

  const updateStatus = async (bookingId: string, status: string) => {
    setUpdating(bookingId);
    try {
      const res = await fetch(`${API_URL}/admin/complaints/${bookingId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(prev => prev.map(c => c.bookingId === bookingId ? { ...c, complaint: { ...c.complaint, status } } : c));
      }
    } catch {} finally { setUpdating(null); }
  };

  const statusColor = (s: string) => s === 'open' ? 'bg-red-100 text-red-700' : s === 'under_review' ? 'bg-orange-100 text-orange-700' : s === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600';

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[32px] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <button onClick={() => router.push('/admin')} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold flex items-center gap-3"><AlertCircle className="h-7 w-7 text-red-400" />Customer Complaints</h1>
              <p className="mt-2 text-slate-400 text-sm">{complaints.length} total complaints</p>
            </div>
            <button onClick={fetchComplaints} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/10">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </section>

        {loading ? (
          <div className="mt-8 text-center text-slate-500">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm">
            <AlertCircle className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-900">No complaints found</p>
            <p className="mt-1 text-sm text-slate-500">Great! No customer complaints at this time.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {complaints.map(c => (
              <div key={c.bookingId} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-slate-900">{c.customerName || c.user?.username || 'Customer'}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(c.complaint?.status || 'open')}`}>
                        {(c.complaint?.status || 'open').replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">Service: <span className="font-medium text-slate-700 capitalize">{c.serviceType}</span> · Booking #{c.bookingId?.slice(-6)}</p>
                    {c.user?.email && <p className="text-xs text-slate-400 mt-0.5">{c.user.email}</p>}
                    <div className="mt-3 rounded-2xl bg-red-50 p-4 border border-red-100">
                      <p className="text-sm font-semibold text-red-800">{c.complaint?.reason}</p>
                      <p className="mt-1 text-sm text-red-700 leading-relaxed">{c.complaint?.description}</p>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">Filed: {c.complaint?.createdAt ? new Date(c.complaint.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end shrink-0">
                    <select
                      value={c.complaint?.status || 'open'}
                      disabled={updating === c.bookingId}
                      onChange={e => updateStatus(c.bookingId, e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-500"
                    >
                      <option value="open">Open</option>
                      <option value="under_review">Under Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    {updating === c.bookingId && <p className="text-xs text-slate-400">Updating...</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
