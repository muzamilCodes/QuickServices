// app/(dashboard)/page.tsx
'use client';

import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const services = [
    { id: 'plumber', name: 'Plumber', icon: '🔧', description: 'Pipe repair, installation & more', color: 'bg-blue-500' },
    { id: 'electrician', name: 'Electrician', icon: '⚡', description: 'Wiring, repairs & installation', color: 'bg-yellow-500' },
    { id: 'driver', name: 'Driver', icon: '🚗', description: 'Professional driving services', color: 'bg-green-500' },
    { id: 'cleaner', name: 'Cleaner', icon: '🧹', description: 'Home & office cleaning', color: 'bg-purple-500' },
    { id: 'carpenter', name: 'Carpenter', icon: '🔨', description: 'Furniture repair & installation', color: 'bg-orange-500' },
    { id: 'painter', name: 'Painter', icon: '🎨', description: 'Wall painting & finishing', color: 'bg-pink-500' },
];

export default function HomePage() {
    const { isAuthenticated, user } = useAuthStore();
    const router = useRouter();

    const handleServiceClick = (serviceId: string) => {
        if (!isAuthenticated) {
            router.push('/login');
        } else {
            router.push(`/booking?service=${serviceId}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold mb-4">
                        Professional Services at Your Doorstep
                    </h1>
                    <p className="text-xl mb-8 opacity-90">
                        Book trusted plumbers, electricians, drivers, and cleaners instantly
                    </p>
                    {!isAuthenticated ? (
                        <Link
                            href="/login"
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
                        >
                            Get Started
                        </Link>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-lg">Welcome back, {user?.username}! 👋</p>
                            <Link
                                href="#services-grid"
                                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
                            >
                                Book a Service
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Services Section */}
            <div id="services-grid" className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            onClick={() => handleServiceClick(service.id)}
                            className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className={`w-16 h-16 ${service.color} rounded-full flex items-center justify-center mb-4`}>
                                <span className="text-3xl">{service.icon}</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                            <p className="text-gray-600">{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Choose QuickServices?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-5xl mb-4">⚡</div>
                            <h3 className="font-bold text-xl mb-2">Instant Booking</h3>
                            <p className="text-gray-600">Book services in under 2 minutes</p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl mb-4">✅</div>
                            <h3 className="font-bold text-xl mb-2">Verified Professionals</h3>
                            <p className="text-gray-600">Background-checked experts</p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl mb-4">🛡️</div>
                            <h3 className="font-bold text-xl mb-2">100% Safe</h3>
                            <p className="text-gray-600">Secure payments & 24/7 support</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}