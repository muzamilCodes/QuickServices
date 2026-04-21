// app/(dashboard)/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, isAuthenticated, updateProfile, logout, getProfile } = useAuthStore();
    const router = useRouter();
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        phone: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else {
            getProfile();
            if (user) {
                setFormData({
                    username: user.username || '',
                    phone: user.phone || ''
                });
            }
        }
    }, [isAuthenticated, router, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await updateProfile(formData);
        if (success) {
            setMessage('Profile updated successfully!');
            setIsEditing(false);
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage('Failed to update profile');
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-3xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold">My Profile</h1>
                                <p className="mt-2 opacity-90">Manage your account information</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {message && (
                            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-center">
                                {message}
                            </div>
                        )}

                        {!isEditing ? (
                            <div className="space-y-4">
                                <div className="border-b pb-4">
                                    <label className="text-sm text-gray-500">Username</label>
                                    <p className="text-lg font-medium">{user.username}</p>
                                </div>
                                <div className="border-b pb-4">
                                    <label className="text-sm text-gray-500">Email</label>
                                    <p className="text-lg font-medium">{user.email}</p>
                                </div>
                                <div className="border-b pb-4">
                                    <label className="text-sm text-gray-500">Phone Number</label>
                                    <p className="text-lg font-medium">{user.phone}</p>
                                </div>
                                <div className="border-b pb-4">
                                    <label className="text-sm text-gray-500">Account Status</label>
                                    <p className="text-lg font-medium">
                                        {user.isVerified ? '✅ Verified' : '⚠️ Not Verified'}
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="10 digits"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}