import Link from 'next/link';
import { Twitter, Instagram, Send, Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';

export default function DashboardFooter() {
    return (
        <footer className="bg-[#080B1A] border-t border-white/5 py-8 mt-auto">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Acctwave. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-gray-500 hover:text-white text-sm transition-colors">
                            Privacy
                        </Link>
                        <Link href="/terms" className="text-gray-500 hover:text-white text-sm transition-colors">
                            Terms
                        </Link>
                        <Link href="/api-docs" className="text-gray-500 hover:text-white text-sm transition-colors">
                            API
                        </Link>
                        <a href="mailto:support@acctwave.com" className="text-gray-500 hover:text-primary text-sm transition-colors flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            support@acctwave.com
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
