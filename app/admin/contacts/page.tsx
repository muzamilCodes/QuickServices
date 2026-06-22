'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getApiBaseUrl } from '@/lib/apiBase';

export default function AdminContactsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const API_URL = getApiBaseUrl();

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/contacts?limit=100`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) setContacts(data.contacts || []);
    } catch (err) {
      console.error(err);
      setMessage('Unable to load contacts.');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteContact = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/contacts/${id}`, { method: 'DELETE', headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setMessage('Contact deleted');
        await fetchContacts();
      } else setMessage(data.message || 'Delete failed');
    } catch (err) {
      console.error(err);
      setMessage('Delete failed');
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
    if (isAuthenticated) void fetchContacts();
  }, [isAuthenticated, isLoading, fetchContacts, router]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => router.push('/admin')} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">←</button>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950 mb-2">Contacts</h1>
            <p className="text-slate-600">View and manage messages sent via the public contact form.</p>
          </div>
        </div>

        {message && <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-amber-800">{message}</div>}

        <div className="space-y-4">
          {contacts.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No messages found.</p>
          ) : (
            contacts.map((c) => (
              <div key={c._id} className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{c.name} · {c.topic}</h3>
                    <p className="text-sm text-slate-600">{c.email} · {c.phone}</p>
                    <p className="mt-3 text-sm text-slate-700">{c.message}</p>
                    <p className="mt-3 text-xs text-slate-500">{new Date(c.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <button onClick={() => deleteContact(c._id)} className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition" title="Delete">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
