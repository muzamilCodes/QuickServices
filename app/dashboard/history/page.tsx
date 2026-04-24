'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function HistoryPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthStore();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        } else if (isAuthenticated) {
            fetchBookings();
        }
    }, [isAuthenticated, isLoading, router]);

    const fetchBookings = async () => {
        try {
            const res = await fetch('http://localhost:4000/bookings/my-bookings', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) setBookings(data.bookings);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-700',
            accepted: 'bg-blue-100 text-blue-700',
            'in-progress': 'bg-purple-100 text-purple-700',
            completed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    if (isLoading || loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
                <p className="text-gray-600 mb-8">View all your service requests</p>

                {bookings.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="text-gray-500 mb-4">No bookings yet</p>
                        <button onClick={() => router.push('/services')} 
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg">Book a Service</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking: any) => (
                            <div key={booking._id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">
                                                {booking.serviceType === 'plumber' && '🔧'}
                                                {booking.serviceType === 'electrician' && '⚡'}
                                                {booking.serviceType === 'driver' && '🚗'}
                                                {booking.serviceType === 'cleaner' && '🧹'}
                                                {booking.serviceType === 'carpenter' && '🔨'}
                                                {booking.serviceType === 'painter' && '🎨'}
                                            </span>
                                            <h3 className="font-bold text-lg capitalize">{booking.serviceType}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm">{booking.address?.fullAddress}</p>
                                        <p className="text-gray-500 text-sm mt-1">{booking.address?.city}, {booking.address?.pincode}</p>
                                        <p className="text-gray-400 text-xs mt-2">{new Date(booking.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <button onClick={() => router.push(`/booking?service=${booking.serviceType}`)} 
                                        className="text-blue-600 text-sm font-medium">Book Again →</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}