'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

const allServices = [
    { id: 'plumber', name: 'Plumber', icon: '🔧', description: 'Pipe repair, installation & fixing', price: '₹499', color: 'from-blue-500 to-blue-600', popular: true },
    { id: 'electrician', name: 'Electrician', icon: '⚡', description: 'Wiring, switch repair & installation', price: '₹499', color: 'from-yellow-500 to-yellow-600', popular: true },
    { id: 'driver', name: 'Driver', icon: '🚗', description: 'Professional driving & pickup/drop', price: '₹399/hr', color: 'from-green-500 to-green-600', popular: false },
    { id: 'cleaner', name: 'Cleaner', icon: '🧹', description: 'Home, office & deep cleaning', price: '₹399', color: 'from-purple-500 to-purple-600', popular: true },
    { id: 'carpenter', name: 'Carpenter', icon: '🔨', description: 'Furniture repair & installation', price: '₹599', color: 'from-orange-500 to-orange-600', popular: false },
    { id: 'painter', name: 'Painter', icon: '🎨', description: 'Wall painting & finishing', price: '₹699', color: 'from-pink-500 to-pink-600', popular: false },
    { id: 'mechanic', name: 'Mechanic', icon: '🔧', description: 'Car & bike repair service', price: '₹499', color: 'from-red-500 to-red-600', popular: false },
    { id: 'gardener', name: 'Gardener', icon: '🌿', description: 'Garden maintenance & planting', price: '₹399', color: 'from-emerald-500 to-emerald-600', popular: false },
];

export default function ServicesPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">All Services</h1>
                    <p className="text-gray-600">Choose from our wide range of professional services</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {allServices.map((service) => (
                        <div
                            key={service.id}
                            onClick={() => router.push(`/booking?service=${service.id}`)}
                            className="bg-white rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-2 relative"
                        >
                            <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center text-3xl mb-4`}>
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                            <p className="text-gray-500 text-sm mb-3">{service.description}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-blue-600 font-bold">{service.price}</span>
                                <span className="text-blue-600">Book →</span>
                            </div>
                            {service.popular && (
                                <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Popular</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}