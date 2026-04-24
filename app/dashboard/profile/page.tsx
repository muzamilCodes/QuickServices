'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '', mobile: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.push('/login');
        else if (user) setFormData({ username: user.username || '', email: user.email || '', mobile: user.mobile || '' });
    }, [isAuthenticated, isLoading, router, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:4000/user/update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) { setMessage('Profile updated!'); setIsEditing(false); setTimeout(() => setMessage(''), 3000); }
            else setMessage(data.message);
        } catch (error) { setMessage('Update failed'); }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-2">👤</div>
                        <h1 className="text-2xl font-bold">My Profile</h1>
                    </div>

                    {message && <div className="p-3 rounded-lg mb-4 bg-green-100 text-green-700 text-center">{message}</div>}

                    {!isEditing ? (
                        <div className="space-y-4">
                            <div className="border-b pb-3"><label className="text-gray-500">Username</label><p className="font-medium">{user?.username}</p></div>
                            <div className="border-b pb-3"><label className="text-gray-500">Email</label><p className="font-medium">{user?.email}</p></div>
                            <div className="border-b pb-3"><label className="text-gray-500">Mobile</label><p className="font-medium">{user?.mobile}</p></div>
                            <div><label className="text-gray-500">Account Status</label><p className="font-medium">{user?.isVerified ? '✅ Verified' : '⚠️ Not Verified'}</p></div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setIsEditing(true)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Edit Profile</button>
                                <button onClick={logout} className="flex-1 border border-red-300 text-red-600 py-2 rounded-lg">Logout</button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Username" className="w-full p-3 border rounded-lg" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                            <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                            <input type="tel" placeholder="Mobile" className="w-full p-3 border rounded-lg" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} required />
                            <div className="flex gap-3">
                                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Save</button>
                                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 border border-gray-300 py-2 rounded-lg">Cancel</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}