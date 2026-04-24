'use client';

import { useRouter } from 'next/navigation';

export default function Footer() {
    const router = useRouter();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const footerLinks = {
        'Quick Links': [
            { name: 'Home', href: '/' },
            { name: 'Services', href: '/#services' },
            { name: 'Features', href: '/#features' },
            { name: 'How It Works', href: '/#howitworks' },
        ],
        'Services': [
            { name: 'Plumber', href: '/dashboard/booking?service=plumber' },
            { name: 'Electrician', href: '/dashboard/booking?service=electrician' },
            { name: 'Driver', href: '/dashboard/booking?service=driver' },
            { name: 'Cleaner', href: '/dashboard/booking?service=cleaner' },
            { name: 'Carpenter', href: '/dashboard/booking?service=carpenter' },
            { name: 'Painter', href: '/dashboard/booking?service=painter' },
        ],
        'Support': [
            { name: 'Contact Us', href: '/contact' },
            { name: 'FAQs', href: '/faq' },
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Terms of Service', href: '/terms' },
        ],
    };

    return (
        <footer className="bg-gray-900 text-white">
            {/* Main Footer */}
            <div className="pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Brand Column */}
                        <div>
                            <div 
                                onClick={scrollToTop}
                                className="flex items-center gap-2 mb-4 cursor-pointer"
                            >
                                <span className="text-3xl">🔧</span>
                                <span className="text-xl font-bold">QuickServices</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-4">
                                Professional services at your doorstep. Quick, reliable, and affordable.
                            </p>
                            <div className="flex gap-4">
                                {['📘', '🐦', '📷', '💼'].map((icon, i) => (
                                    <button key={i} className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition">
                                        <span>{icon}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Links Columns */}
                        {Object.entries(footerLinks).map(([title, links]) => (
                            <div key={title}>
                                <h3 className="font-bold text-lg mb-4">{title}</h3>
                                <ul className="space-y-2">
                                    {links.map((link) => (
                                        <li key={link.name}>
                                            <button
                                                onClick={() => {
                                                    if (link.href.startsWith('/#')) {
                                                        const element = document.querySelector(link.href.substring(1));
                                                        if (element) element.scrollIntoView({ behavior: 'smooth' });
                                                    } else {
                                                        router.push(link.href);
                                                    }
                                                }}
                                                className="text-gray-400 hover:text-white transition text-sm"
                                            >
                                                {link.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Contact Column */}
                        <div>
                            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
                            <ul className="space-y-3 text-gray-400 text-sm">
                                <li className="flex items-center gap-3">
                                    <span>📞</span>
                                    <span>+91 12345 67890</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span>✉️</span>
                                    <span>support@quickservices.com</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span>📍</span>
                                    <span>India</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-sm text-center md:text-left">
                            © 2024 QuickServices. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <button className="text-gray-400 hover:text-white text-sm transition">Privacy Policy</button>
                            <button className="text-gray-400 hover:text-white text-sm transition">Terms of Service</button>
                            <button className="text-gray-400 hover:text-white text-sm transition">Cookies</button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}