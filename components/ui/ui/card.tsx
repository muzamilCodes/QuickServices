'use client';

import { useState } from 'react';
import { useRouter }useState from 'react';
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
            alert('OTP sent to your email! Check console for OTP');
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
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '16px'
        }}>
            <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '16px', 
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', 
                padding: '32px', 
                width: '100%', 
                maxWidth: '400px' 
            }}>
                <h1 style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    textAlign: 'center', 
                    marginBottom: '24px', 
                    color: '#1f2937' 
                }}>
                    Welcome Back
                </h1>
                
                {/* Mode Toggle Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    <button
                        onClick={() => { setMode('password'); setOtpSent(false); setError(''); }}
                        style={{ 
                            flex: 1, 
                            padding: '10px', 
                            borderRadius: '8px', 
                            border: 'none',
                            backgroundColor: mode === 'password' ? '#3b82f6' : '#e5e7eb',
                            color: mode === 'password' ? 'white' : '#374151',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Password Login
                    </button>
                    <button
                        onClick={() => { setMode('otp'); setOtpSent(false); setError(''); }}
                        style={{ 
                            flex: 1, 
                            padding: '10px', 
                            borderRadius: '8px', 
                            border: 'none',
                            backgroundColor: mode === 'otp' ? '#3b82f6' : '#e5e7eb',
                            color: mode === 'otp' ? 'white' : '#374151',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        OTP Login
                    </button>
                </div>
                
                {mode === 'password' ? (
                    <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px 12px', 
                                    border: '1px solid #d1d5db', 
                                    borderRadius: '8px', 
                                    fontSize: '16px', 
                                    color: '#1f2937', 
                                    backgroundColor: 'white' 
                                }}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px 12px', 
                                    border: '1px solid #d1d5db', 
                                    borderRadius: '8px', 
                                    fontSize: '16px', 
                                    color: '#1f2937', 
                                    backgroundColor: 'white' 
                                }}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        
                        {error && (
                            <div style={{ color: '#dc2626', fontSize: '14px', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}
                        
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{ 
                                width: '100%', 
                                backgroundColor: '#3b82f6', 
                                color: 'white', 
                                padding: '10px', 
                                borderRadius: '8px', 
                                border: 'none', 
                                fontSize: '16px', 
                                fontWeight: '500', 
                                cursor: 'pointer', 
                                opacity: isLoading ? 0.5 : 1 
                            }}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px 12px', 
                                    border: '1px solid #d1d5db', 
                                    borderRadius: '8px', 
                                    fontSize: '16px', 
                                    color: '#1f2937', 
                                    backgroundColor: 'white',
                                    opacity: otpSent ? 0.6 : 1
                                }}
                                placeholder="Enter your email"
                                disabled={otpSent}
                                required
                            />
                        </div>
                        
                        {!otpSent ? (
                            <button
                                onClick={handleSendOTP}
                                disabled={!email || isLoading}
                                style={{ 
                                    width: '100%', 
                                    backgroundColor: '#3b82f6', 
                                    color: 'white', 
                                    padding: '10px', 
                                    borderRadius: '8px', 
                                    border: 'none', 
                                    fontSize: '16px', 
                                    fontWeight: '500', 
                                    cursor: 'pointer', 
                                    opacity: (!email || isLoading) ? 0.5 : 1 
                                }}
                            >
                                {isLoading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        ) : (
                            <form onSubmit={handleOTPLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
                                        OTP
                                    </label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                        style={{ 
                                            width: '100%', 
                                            padding: '10px 12px', 
                                            border: '1px solid #d1d5db', 
                                            borderRadius: '8px', 
                                            fontSize: '20px', 
                                            textAlign: 'center',
                                            letterSpacing: '4px',
                                            color: '#1f2937', 
                                            backgroundColor: 'white' 
                                        }}
                                        placeholder="123456"
                                        required
                                    />
                                </div>
                                
                                {error && (
                                    <div style={{ color: '#dc2626', fontSize: '14px', textAlign: 'center' }}>
                                        {error}
                                    </div>
                                )}
                                
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    style={{ 
                                        width: '100%', 
                                        backgroundColor: '#3b82f6', 
                                        color: 'white', 
                                        padding: '10px', 
                                        borderRadius: '8px', 
                                        border: 'none', 
                                        fontSize: '16px', 
                                        fontWeight: '500', 
                                        cursor: 'pointer', 
                                        opacity: isLoading ? 0.5 : 1 
                                    }}
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Login'}
                                </button>
                            </form>
                        )}
                    </div>
                )}
                
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Link 
                        href="/forgot-password" 
                        style={{ 
                            fontSize: '14px', 
                            color: '#3b82f6', 
                            textDecoration: 'none',
                            display: 'block',
                            marginBottom: '8px'
                        }}
                    >
                        Forgot Password?
                    </Link>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        Don't have an account?{' '}
                        <Link href="/register" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}