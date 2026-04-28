'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const quickActions = [
        { name: 'Book New Service', icon: '➕', href: '/booking', color: 'bg-blue-600' },
        { name: 'View Services', icon: '🔧', href: '/services', color: 'bg-green-600' },
        { name: 'My Bookings', icon: '📋', href: '/history', color: 'bg-purple-600' },
        { name: 'Profile', icon: '👤', href: '/profile', color: 'bg-orange-600' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-10">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold">Welcome, {user?.username || 'Guest'}! 👋</h1>
                    <p className="mt-2 text-blue-100">Ready to book a service today?</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl shadow text-center">
                        <div className="text-3xl mb-2">🔧</div>
                        <div className="text-2xl font-bold">8+</div>
                        <div className="text-gray-500">Services</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow text-center">
                        <div className="text-3xl mb-2">✅</div>
                        <div className="text-2xl font-bold">100%</div>
                        <div className="text-gray-500">Verified</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow text-center">
                        <div className="text-3xl mb-2">⚡</div>
                        <div className="text-2xl font-bold">30min</div>
                        <div className="text-gray-500">Response</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow text-center">
                        <div className="text-3xl mb-2">⭐</div>
                        <div className="text-2xl font-bold">4.8</div>
                        <div className="text-gray-500">Rating</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {quickActions.map((action) => (
                        <button
                            key={action.name}
                            onClick={() => router.push(action.href)}
                            className={`${action.color} text-white p-6 rounded-xl text-center hover:shadow-lg transition transform hover:-translate-y-1`}
                        >
                            <div className="text-4xl mb-2">{action.icon}</div>
                            <h3 className="font-bold text-lg">{action.name}</h3>
                        </button>
                    ))}
                </div>

                {/* Recent Activity Placeholder */}
                <div className="mt-10 bg-white rounded-xl p-6 shadow">
                    <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                    <p className="text-gray-500 text-center py-8">No recent bookings. Book a service to get started!</p>
                    <button onClick={() => router.push('/booking')} className="w-full bg-blue-600 text-white py-2 rounded-lg">Book Now</button>
                </div>
            </div>
        </div>
    );
}