'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function DashboardHome() {
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

    const services = [
        { id: 'plumber', name: 'Plumber', icon: '🔧', price: '₹499' },
        { id: 'electrician', name: 'Electrician', icon: '⚡', price: '₹499' },
        { id: 'driver', name: 'Driver', icon: '🚗', price: '₹399' },
        { id: 'cleaner', name: 'Cleaner', icon: '🧹', price: '₹399' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold">Welcome, {user?.username || 'Guest'}! 👋</h1>
                    <p className="mt-2 text-blue-100">Ready to book a service today?</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mb-10">
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

                {/* Popular Services */}
                <h2 className="text-2xl font-bold mb-4">Popular Services</h2>
                <div className="grid md:grid-cols-4 gap-6 mb-10">
                    {services.map((service) => (
                        <div 
                            key={service.id}
                            onClick={() => router.push(`/dashboard/booking?service=${service.id}`)}
                            className="bg-white p-6 rounded-xl shadow text-center cursor-pointer hover:shadow-lg transition"
                        >
                            <div className="text-5xl mb-3">{service.icon}</div>
                            <h3 className="font-bold text-lg">{service.name}</h3>
                            <p className="text-blue-600 font-bold mt-2">{service.price}</p>
                            <button className="mt-3 text-blue-600 text-sm">Book Now →</button>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-6">
                    <button 
                        onClick={() => router.push('/dashboard/booking')}
                        className="bg-blue-600 text-white p-4 rounded-xl text-center hover:bg-blue-700 transition"
                    >
                        + Book New Service
                    </button>
                    <button 
                        onClick={() => router.push('/dashboard/history')}
                        className="border border-gray-300 p-4 rounded-xl text-center hover:bg-gray-50 transition"
                    >
                        📋 View Booking History
                    </button>
                </div>
            </div>
        </div>
    );
}