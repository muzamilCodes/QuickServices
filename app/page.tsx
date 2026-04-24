'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
    const router = useRouter();

    const services = [
        { id: 'plumber', name: 'Plumber', icon: '🔧', description: 'Pipe repair, installation & fixing', price: '₹499', color: 'from-blue-500 to-blue-600', popular: true },
        { id: 'electrician', name: 'Electrician', icon: '⚡', description: 'Wiring, switch repair & installation', price: '₹499', color: 'from-yellow-500 to-yellow-600', popular: true },
        { id: 'driver', name: 'Driver', icon: '🚗', description: 'Professional driving & pickup/drop', price: '₹399/hr', color: 'from-green-500 to-green-600', popular: false },
        { id: 'cleaner', name: 'Cleaner', icon: '🧹', description: 'Home, office & deep cleaning', price: '₹399', color: 'from-purple-500 to-purple-600', popular: true },
        { id: 'carpenter', name: 'Carpenter', icon: '🔨', description: 'Furniture repair & installation', price: '₹599', color: 'from-orange-500 to-orange-600', popular: false },
        { id: 'painter', name: 'Painter', icon: '🎨', description: 'Wall painting & finishing', price: '₹699', color: 'from-pink-500 to-pink-600', popular: false },
        { id: 'mechanic', name: 'Mechanic', icon: '🔧', description: 'Car & bike repair service', price: '₹499', color: 'from-red-500 to-red-600', popular: false },
        { id: 'gardener', name: 'Gardener', icon: '🌿', description: 'Garden maintenance & planting', price: '₹399', color: 'from-emerald-500 to-emerald-600', popular: false },
    ];

    const features = [
        { icon: '⚡', title: '30-Min Response', description: 'Quick dispatch of professionals to your doorstep' },
        { icon: '✅', title: '100% Verified', description: 'Background checked & experienced experts' },
        { icon: '🛡️', title: 'Safe & Secure', description: 'Your safety and security is our priority' },
        { icon: '💰', title: 'Best Price', description: 'Affordable rates with no hidden charges' },
        { icon: '⭐', title: '5 Star Service', description: 'Rated 4.8+ by 50,000+ happy customers' },
        { icon: '🔄', title: 'Free Reservice', description: '100% satisfaction or free revisit' },
    ];

    const stats = [
        { number: '50K+', label: 'Happy Customers' },
        { number: '10K+', label: 'Services Done' },
        { number: '98%', label: 'Satisfaction Rate' },
        { number: '500+', label: 'Expert Professionals' },
    ];

    const goToBooking = () => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/booking');
        } else {
            router.push('/register');
        }
    };

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left Side - Text */}
                        <div>
                            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm mb-6">
                                <span className="animate-pulse">⚡</span>
                                India's Best Service Platform
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                                Professional Services at{' '}
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Your Doorstep
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                Book trusted plumbers, electricians, drivers, cleaners and more. 
                                Get quick, reliable, and affordable service within minutes.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button 
                                    onClick={goToBooking}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105"
                                >
                                    Book a Service
                                </button>
                                <button 
                                    onClick={() => router.push('/services')}
                                    className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all"
                                >
                                    View Services
                                </button>
                            </div>
                            <div className="flex items-center gap-8 mt-8">
                                <div className="flex -space-x-2">
                                    {[1,2,3,4].map((i) => (
                                        <div key={i} className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg">
                                            👤
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex text-yellow-400 text-lg">★★★★★</div>
                                    <p className="text-gray-600 text-sm">Trusted by 50,000+ customers</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Image */}
                        <div className="relative">
                            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-3 shadow-2xl">
                                <img 
                                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=600&fit=crop" 
                                    alt="Professional Service Expert"
                                    className="rounded-2xl w-full object-cover shadow-xl"
                                />
                            </div>
                            <div className="absolute -top-5 -left-5 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
                                <span className="text-2xl">⭐</span>
                                <span className="font-bold text-gray-800">4.9 Rating</span>
                            </div>
                            <div className="absolute -bottom-5 -right-5 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
                                <span className="text-2xl">🚀</span>
                                <span className="font-bold text-gray-800">24/7 Support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, i) => (
                            <div key={i}>
                                <div className="text-4xl font-bold">{stat.number}</div>
                                <div className="text-blue-100 mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
                        <p className="text-xl text-gray-600">Choose from a wide range of professional services at affordable prices</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                onClick={() => router.push(`/booking?service=${service.id}`)}
                                className="bg-white rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group relative"
                            >
                                <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                                <p className="text-gray-500 text-sm mb-3">{service.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-600 font-bold">{service.price}</span>
                                    <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition">Book →</span>
                                </div>
                                {service.popular && (
                                    <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Popular</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-10">
                        <button onClick={() => router.push('/services')} className="text-blue-600 font-semibold hover:text-blue-700">View All Services →</button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose QuickServices?</h2>
                        <p className="text-xl text-gray-600">We provide the best service experience with unmatched quality</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <div key={i} className="flex gap-4 p-6 rounded-2xl hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">{feature.icon}</div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{feature.title}</h3>
                                    <p className="text-gray-500">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
                        <p className="text-xl text-blue-100">Book a service in 4 simple steps</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { step: '01', title: 'Choose Service', desc: 'Select the service you need', icon: '📱' },
                            { step: '02', title: 'Book Online', desc: 'Fill details & verify OTP', icon: '📝' },
                            { step: '03', title: 'Get Professional', desc: 'Expert arrives at your doorstep', icon: '👨‍🔧' },
                            { step: '04', title: 'Enjoy Service', desc: 'Quality service with warranty', icon: '🎉' },
                        ].map((step) => (
                            <div key={step.step} className="text-center">
                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">{step.icon}</div>
                                <div className="text-4xl font-bold text-white/20 mb-2">{step.step}</div>
                                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-blue-100">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to Get Professional Service?</h2>
                    <p className="text-xl text-gray-600 mb-8">Join thousands of happy customers who trust QuickServices</p>
                    <button onClick={() => router.push('/register')} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:shadow-xl transition-all">Get Started Now</button>
                </div>
            </section>
        </div>
    );
}