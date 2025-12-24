'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Smartphone, CreditCard, AppWindow, Menu, Zap, Wallet, Package, FileText, Settings, LogOut, Shield, ChevronLeft, X, Rocket, PlayCircle, Users } from 'lucide-react';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useSession, signOut } from 'next-auth/react';

const sidebarLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Fund Wallet', href: '/dashboard/fund-wallet', icon: Wallet },
    { name: 'Boost Account', href: '/dashboard/boost-account', icon: Rocket },
    { name: 'My Orders', href: '/dashboard/orders', icon: Package },
    { name: 'Foreign Numbers', href: '/dashboard/virtual-numbers', icon: Smartphone },
    { name: 'Rent Number', href: '/dashboard/rent-number', icon: Smartphone },
    { name: 'VTU & Bills', href: '/dashboard/vtu', icon: CreditCard },
    { name: 'Buy Logs', href: '/dashboard/buy-logs', icon: AppWindow },
    { name: 'Tutorials', href: '/dashboard/tutorials', icon: PlayCircle },
    { name: 'Refer & Earn', href: '/dashboard/referrals', icon: Users },
    { name: 'API Docs', href: '/dashboard/api-docs', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function MobileNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);

    const isDashboard = pathname === '/dashboard';
    const getPageTitle = (path: string) => {
        const segment = path.split('/').pop();
        if (segment === 'buy-logs') return 'Buy Logs';
        return segment?.replace(/-/g, ' ') || 'Dashboard';
    };
    const pageTitle = getPageTitle(pathname);

    return (
        <>
            {/* Top Navigation Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#080B1A]/80 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {isDashboard ? (
                        <button
                            onClick={() => setIsOpen(true)}
                            className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    ) : (
                        <button
                            onClick={() => router.back()}
                            className="p-2 -ml-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    <span className="font-medium text-white text-lg capitalize">
                        {isDashboard ? 'Dashboard' : pageTitle}
                    </span>
                </div>
            </div>

            {/* Sidebar Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 bottom-0 left-0 w-72 bg-[#080B1A] border-r border-white/10 z-50 flex flex-col md:hidden"
                        >
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <span className="text-xl font-bold text-white">Menu</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {sidebarLinks.map((link) => {
                                    const isActive = pathname === link.href;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                                ? 'bg-primary/10 text-primary border border-primary/20'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <link.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                                            {link.name}
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="p-4 border-t border-white/5 space-y-2 bg-[#080B1A]">
                                <button
                                    onClick={() => {
                                        signOut({ callbackUrl: '/login' });
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium">Logout</span>
                                </button>

                                {(session?.user as any)?.role === 'admin' && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-purple-400 hover:bg-purple-500/10 transition-colors"
                                    >
                                        <Shield className="w-5 h-5" />
                                        <span className="font-medium">Admin Panel</span>
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
