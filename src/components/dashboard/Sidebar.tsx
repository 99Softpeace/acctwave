'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Smartphone, Settings, FileText, LogOut, AppWindow, CreditCard, Wallet, Package, Zap, Shield, Rocket, Users, Wifi } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

const sidebarLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Fund Wallet', href: '/dashboard/fund-wallet', icon: Wallet },
    { name: 'Boost Account', href: '/dashboard/boost-account', icon: Rocket },
    { name: 'My Orders', href: '/dashboard/orders', icon: Package },
    { name: 'Foreign Numbers', href: '/dashboard/virtual-numbers', icon: Smartphone },
    { name: 'Rent Number', href: '/dashboard/rent-number', icon: Smartphone },
    { name: 'Buy eSIM', href: '/dashboard/esim', icon: Wifi },
    { name: 'VTU & Bills', href: '/dashboard/vtu', icon: CreditCard },
    { name: 'Buy Logs', href: '/dashboard/modded-apps', icon: AppWindow },
    { name: 'API Docs', href: '/dashboard/api-docs', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <aside className="w-64 bg-[#080B1A] border-r border-white/5 hidden md:flex flex-col h-screen sticky top-0">
            <div className="p-4 space-y-2 flex-grow overflow-y-auto">
                {sidebarLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
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

            <div className="p-4 border-t border-white/5">
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>

                {/* Admin Link */}
                {(session?.user as any)?.role === 'admin' && (
                    <div className="pt-4 mt-4 border-t border-white/5">
                        <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-purple-400 hover:bg-purple-500/10 transition-colors"
                        >
                            <Shield className="w-5 h-5" />
                            <span className="font-medium">Admin Panel</span>
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    );
}
