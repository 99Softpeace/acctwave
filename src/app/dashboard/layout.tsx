import Sidebar from '@/components/dashboard/Sidebar';
import MobileNav from '@/components/dashboard/MobileNav';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SuspensionListener from '@/components/auth/SuspensionListener';
import WelcomeModal from '@/components/dashboard/WelcomeModal';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect('/login');
    }

    return (
        <div className="flex min-h-screen bg-[#080B1A]">
            <SuspensionListener />
            <WelcomeModal />
            <Sidebar />
            <main className="flex-grow w-full pt-16 md:pt-0 flex flex-col">
                <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-8rem)] w-full">
                    {children}
                </div>
                <DashboardFooter />
            </main>
            <MobileNav />
        </div>
    );
}
