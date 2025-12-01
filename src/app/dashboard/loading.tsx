import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-primary animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                    </div>
                </div>
                <p className="text-gray-400 animate-pulse">Loading dashboard...</p>
            </div>
        </div>
    );
}
