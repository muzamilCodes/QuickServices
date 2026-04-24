'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function BookingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const serviceId = searchParams.get('service') || 'plumber';
    const { user, isAuthenticated, isLoading } = useAuthStore();
    
    const [form, setForm] = useState({
        customerName: user?.username || '',
        customerPhone: user?.mobile || '',
        serviceType: serviceId,
        address: '',
        city: '',
        pincode: '',
        description: ''
    });
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:4000/bookings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ 
                    ...form, 
                    address: { fullAddress: form.address, city: form.city, pincode: form.pincode } 
                })
            });
            const data = await res.json();
            if (data.success) setShowOTP(true);
            else setMsg(data.message);
        } catch (err) { setMsg('Booking failed'); }
        finally { setLoading(false); }
    };

    const verifyOTP = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:4000/bookings/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ otp, bookingMode: 'system' })
            });
            const data = await res.json();
            if (data.success) router.push('/history');
            else setMsg(data.message);
        } catch (err) { setMsg('Verification failed'); }
        finally { setLoading(false); setShowOTP(false); }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    const serviceNames: Record<string, string> = {
        plumber: 'Plumber', electrician: 'Electrician', driver: 'Driver', cleaner: 'Cleaner',
        carpenter: 'Carpenter', painter: 'Painter', mechanic: 'Mechanic', gardener: 'Gardener'
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow p-6">
                    <h1 className="text-2xl font-bold mb-2">Book {serviceNames[serviceId] || serviceId} Service</h1>
                    <p className="text-gray-500 mb-6">Fill the details below to book this service</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-lg" 
                            value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} required />
                        <input type="tel" placeholder="Phone Number" className="w-full p-3 border rounded-lg" 
                            value={form.customerPhone} onChange={e => setForm({...form, customerPhone: e.target.value})} required />
                        <input type="text" placeholder="Full Address" className="w-full p-3 border rounded-lg" 
                            value={form.address} onChange={e => setForm({...form, address: e.target.value})} required />
                        <div className="flex gap-4">
                            <input type="text" placeholder="City" className="flex-1 p-3 border rounded-lg" 
                                value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
                            <input type="text" placeholder="Pincode" className="flex-1 p-3 border rounded-lg" 
                                value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} required />
                        </div>
                        <textarea placeholder="Describe your problem" rows={3} className="w-full p-3 border rounded-lg" 
                            value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                        
                        {msg && <div className="text-red-600 text-sm text-center">{msg}</div>}
                        
                        <button type="submit" disabled={loading} 
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition">
                            {loading ? 'Processing...' : 'Book Service'}
                        </button>
                    </form>
                </div>
            </div>

            {/* OTP Modal */}
            {showOTP && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Enter OTP</h2>
                        <p className="text-gray-500 mb-4">Enter the OTP sent to your email</p>
                        <input type="text" placeholder="6-digit OTP" className="w-full p-3 border rounded-lg text-center text-2xl tracking-widest" 
                            maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} />
                        <button onClick={verifyOTP} className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 font-semibold">
                            Confirm Booking
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}