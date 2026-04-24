'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuthStore();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        window.addEventListener('scroll', () => {
            setScrolled(window.scrollY > 50);
        });
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const navLinks = [
        { name: 'Home', href: '/', icon: '🏠' },
        { name: 'Services', href: '/services', icon: '🔧' },
        { name: 'Bookings', href: '/history', icon: '📋' },
        { name: 'Profile', href: '/profile', icon: '👤' },
    ];

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-3' : 'bg-white/95 backdrop-blur-sm py-4'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div 
                        onClick={() => router.push('/')} 
                        className="flex items-center gap-2 cursor-pointer group"
                    >
                        <span className="text-3xl group-hover:scale-110 transition-transform">🔧</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            QuickServices
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition font-medium group"
                            >
                                <span className="text-lg group-hover:scale-110 transition">{link.icon}</span>
                                <span>{link.name}</span>
                            </a>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                                    <span className="text-lg">👤</span>
                                    <span className="text-gray-700 font-medium">{user?.username}</span>
                                </div>
                                <button
                                    onClick={() => router.push('/dashboard/home')}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-full hover:shadow-lg transition-all"
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-red-600 px-4 py-2 rounded-full hover:bg-red-50 transition"
                                >
                                    <span>🚪</span>
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => router.push('/login')}
                                    className="flex items-center gap-2 text-blue-600 px-5 py-2 rounded-full hover:bg-blue-50 transition font-medium"
                                >
                                    <span>🔑</span>
                                    <span>Login</span>
                                </button>
                                <button
                                    onClick={() => router.push('/register')}
                                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-full hover:shadow-lg transition-all"
                                >
                                    <span>📝</span>
                                    <span>Get Started</span>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-3xl"
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 space-y-3">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition py-2"
                            >
                                <span className="text-xl">{link.icon}</span>
                                <span>{link.name}</span>
                            </a>
                        ))}
                        {isAuthenticated ? (
                            <>
                                <button
                                    onClick={() => {
                                        router.push('/dashboard/home');
                                        setMobileMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-full"
                                >
                                    <span>📊</span>
                                    <span>Dashboard</span>
                                </button>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 w-full text-red-600 px-5 py-2 rounded-full"
                                >
                                    <span>🚪</span>
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        router.push('/login');
                                        setMobileMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 w-full text-blue-600 px-5 py-2 rounded-full"
                                >
                                    <span>🔑</span>
                                    <span>Login</span>
                                </button>
                                <button
                                    onClick={() => {
                                        router.push('/register');
                                        setMobileMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-full"
                                >
                                    <span>📝</span>
                                    <span>Get Started</span>
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}