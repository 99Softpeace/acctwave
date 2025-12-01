'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import MobileNav from '@/components/dashboard/MobileNav';


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#080B1A]">
            <Sidebar />
            <main className="flex-grow w-full pt-16 md:pt-0">
                <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-8rem)]">
                    {children}
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
