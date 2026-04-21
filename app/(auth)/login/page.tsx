// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const { login, sendLoginOTP, verifyLoginOTP, isLoading } = useAuthStore();
    
    const [mode, setMode] = useState<'password' | 'otp'>('password');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const success = await login(email, password);
        
        if (success) {
            router.push('/');
        } else {
            setError('Invalid email or password');
        }
    };

    const handleSendOTP = async () => {
        setError('');
        const success = await sendLoginOTP(email);
        
        if (success) {
            setOtpSent(true);
            alert('OTP sent to your email!');
        } else {
            setError('User not found. Please register first.');
        }
    };

    const handleOTPLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const success = await verifyLoginOTP(email, otp);
        
        if (success) {
            router.push('/');
        } else {
            setError('Invalid or expired OTP');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6">Welcome Back</h1>
                
                {/* Mode Toggle */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => { setMode('password'); setOtpSent(false); setError(''); }}
                        className={`flex-1 py-2 rounded-lg transition ${mode === 'password' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Password Login
                    </button>
                    <button
                        onClick={() => { setMode('otp'); setOtpSent(false); setError(''); }}
                        className={`flex-1 py-2 rounded-lg transition ${mode === 'otp' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        OTP Login
                    </button>
                </div>
                
                {mode === 'password' ? (
                    <form onSubmit={handlePasswordLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={otpSent}
                            />
                        </div>
                        
                        {!otpSent ? (
                            <button
                                onClick={handleSendOTP}
                                disabled={!email || isLoading}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                Send OTP
                            </button>
                        ) : (
                            <form onSubmit={handleOTPLogin} className="space-y-4">
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
                                    {isLoading ? 'Verifying...' : 'Verify & Login'}
                                </button>
                            </form>
                        )}
                    </div>
                )}
                
                <div className="text-center mt-6 space-y-2">
                    <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline block">
                        Forgot Password?
                    </Link>
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-blue-600 hover:underline">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}