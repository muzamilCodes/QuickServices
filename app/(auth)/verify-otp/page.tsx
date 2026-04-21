// app/(auth)/verify-otp/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function VerifyOTPPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { verifyOTP, isLoading } = useAuthStore();
    
    const email = searchParams.get('email') || '';
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!email) {
            router.push('/register');
        }
    }, [email, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const success = await verifyOTP(email, otp);
        
        if (success) {
            router.push('/');
        } else {
            setError('Invalid or expired OTP. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6">Verify OTP</h1>
                
                <p className="text-gray-600 text-center mb-6">
                    Enter the 6-digit OTP sent to <strong>{email}</strong>
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">OTP</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            className="w-full px-3 py-2 text-center text-2xl tracking-widest border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="123456"
                            required
                        />
                    </div>
                    
                    {error && (
                        <div className="text-red-600 text-sm text-center">
                            {error}
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isLoading ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                </form>
                
                <p className="text-center text-sm text-gray-600 mt-6">
                    Didn't receive OTP?{' '}
                    <button
                        onClick={() => alert('Please check your email or try registering again')}
                        className="text-blue-600 hover:underline"
                    >
                        Resend
                    </button>
                </p>
            </div>
        </div>
    );
}