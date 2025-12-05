'use client';

import Link from 'next/link';
import { Twitter, Instagram, Send, Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';


export default function Footer() {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith('/dashboard');

    if (isDashboard) return null;

    return (
        <footer className="bg-black border-t border-white/10 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand & Social */}
                    <div>
                        <Link href="/" className="inline-block mb-6">
                            <div className="flex items-center gap-2">
                                <Image
                                    src="/acctwave_logo.png"
                                    alt="Acctwave"
                                    width={40}
                                    height={40}
                                    className="w-10 h-10"
                                />
                                <span className="text-xl font-bold text-white">Acctwave</span>
                            </div>
                        </Link>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            Premium social media growth services for individuals and businesses. Boost your presence today.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                                <Send className="w-5 h-5" />
                            </a>
                        </div >
                    </div >

                    {/* Quick Links */}
                    < div >
                        <h3 className="font-bold text-white mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/services" className="text-gray-400 hover:text-primary text-sm transition-colors">
                                    All Services
                                </Link>
                            </li>

                            <li>
                                <Link href="/api-docs" className="text-gray-400 hover:text-primary text-sm transition-colors">
                                    API Documentation
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-400 hover:text-primary text-sm transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div >



                    {/* Help & FAQ */}
                    <div>
                        <h3 className="font-bold text-white mb-6">Help & FAQ</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/how-it-works" className="text-gray-400 hover:text-primary text-sm transition-colors">
                                    How to place an order
                                </Link>
                            </li>
                            <li>
                                <Link href="/payment-methods" className="text-gray-400 hover:text-primary text-sm transition-colors">
                                    Payment Methods
                                </Link>
                            </li>
                            <li>
                                <Link href="/refill-policy" className="text-gray-400 hover:text-primary text-sm transition-colors">
                                    Refill Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/api-docs" className="text-gray-400 hover:text-primary text-sm transition-colors">
                                    API Support
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    < div >
                        <h3 className="font-bold text-white mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-gray-400 text-sm">
                                <Mail className="w-5 h-5 text-primary shrink-0" />
                                <a href="mailto:support@acctwave.com" className="hover:text-white transition-colors">
                                    support@acctwave.com
                                </a>
                            </li>
                        </ul>
                    </div >
                </div >

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Acctwave. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-gray-500 hover:text-white text-sm transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/cookies" className="text-gray-500 hover:text-white text-sm transition-colors">
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div >
        </footer >
    );
}
