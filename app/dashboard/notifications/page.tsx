'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle2,
  Truck,
  Star,
  Tag,
  ArrowLeft,
  Loader2,
  CheckCheck,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getApiBaseUrl } from '@/lib/apiBase';

interface Notification {
  _id: string;
  title?: string;
  message: string;
  createdAt: string;
  read?: boolean;
  isRead?: boolean;
  type?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const API = getApiBaseUrl();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API}/user/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
    if (isAuthenticated) void fetchNotifications();
  }, [isAuthenticated, authLoading, fetchNotifications, router]);

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true, isRead: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  // Icon selector based on type or content
  const getIcon = (type?: string, msg: string = '') => {
    const m = msg.toLowerCase();
    if (m.includes('way') || type?.includes('way')) return { icon: Truck, color: 'text-blue-600 bg-blue-50' };
    if (m.includes('rate') || m.includes('review')) return { icon: Star, color: 'text-amber-600 bg-amber-50' };
    if (m.includes('off') || m.includes('coupon')) return { icon: Tag, color: 'text-purple-600 bg-purple-50' };
    return { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' };
  };

  const unreadCount = notifications.filter((n) => !n.read && !n.isRead).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 flex items-center gap-2.5">
            <Bell className="h-7 w-7 text-rose-500" /> Notifications & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time updates about technician arrivals, booking confirmations, and special offers.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <CheckCheck className="h-4 w-4 text-blue-600" /> Mark All as Read
          </button>
        )}
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            You have no notifications right now.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => {
              const { icon: Icon, color } = getIcon(n.type, n.message);
              const isUnread = !n.read && !n.isRead;
              return (
                <div
                  key={n._id}
                  onClick={() => isUnread && markAsRead(n._id)}
                  className={`p-5 flex items-start gap-4 transition cursor-pointer ${
                    isUnread ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                        {n.title || n.message}
                      </h3>
                      {isUnread && (
                        <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" title="Unread" />
                      )}
                    </div>

                    {n.title && n.title !== n.message && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    )}

                    <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1 font-medium">
                      <Clock className="h-3 w-3" />
                      {new Date(n.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })} • {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
