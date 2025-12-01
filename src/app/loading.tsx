import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B1A]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-primary animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <h2 className="text-xl font-bold text-white">Acctwave</h2>
                    <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
                </div>
            </div>
        </div>
    );
}
