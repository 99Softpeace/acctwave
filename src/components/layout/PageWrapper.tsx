'use client';

import { usePathname } from 'next/navigation';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith('/dashboard');

    return (
        <main className={`flex-grow ${isDashboard ? 'pt-0' : 'pt-16'}`}>
            {children}
        </main>
    );
}
