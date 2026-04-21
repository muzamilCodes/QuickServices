'use client';

import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        QuickServices
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Professional Services at Your Doorstep
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link 
                            href="/login" 
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            Login / Register
                        </Link>
                    </div>
                </div>

                {/* Services Section */}
                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-center mb-8">Our Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                        {[
                            { name: 'Plumber', icon: '🔧' },
                            { name: 'Electrician', icon: '⚡' },
                            { name: 'Driver', icon: '🚗' },
                            { name: 'Cleaner', icon: '🧹' },
                            { name: 'Carpenter', icon: '🔨' },
                            { name: 'Painter', icon: '🎨' }
                        ].map((service) => (
                            <div key={service.name} className="bg-white rounded-lg p-6 text-center shadow-md">
                                <div className="text-4xl mb-4">
                                    {service.icon}
                                </div>
                                <h3 className="font-bold text-lg">{service.name}</h3>
                                <p className="text-gray-600 text-sm mt-2">
                                    Professional {service.name.toLowerCase()} services
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}