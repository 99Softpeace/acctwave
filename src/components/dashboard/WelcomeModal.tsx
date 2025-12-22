'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, PlayCircle } from 'lucide-react';

export default function WelcomeModal() {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if user has already seen the modal in this session
        const hasSeen = sessionStorage.getItem('acctwave_welcome_seen');
        if (!hasSeen) {
            // Small delay to allow dashboard to load first
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('acctwave_welcome_seen', 'true');
    };

    const handleWatchTutorial = () => {
        handleClose();
        router.push('/dashboard/tutorials');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-[#1e293b] border border-gray-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="text-center space-y-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-shine">
                        Welcome to Premium Access 💎
                    </h2>

                    <div className="space-y-4 text-gray-300">
                        <p>
                            <span className="text-white font-semibold">Everything you need, instantly.</span>
                            <br />
                            Experience high-speed <span className="text-cyan-400">SMM Services</span>, <span className="text-cyan-400">Virtual Numbers</span>, and <span className="text-cyan-400">Data Bundles</span> at unbeatable rates.
                        </p>

                        <p className="text-sm bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                            <span className="text-blue-400 font-semibold">New to Acctwave?</span>
                            <br />
                            Master the platform in 2 minutes with our quick start guide.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-center pt-2">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2.5 rounded-xl border border-gray-600 text-gray-400 hover:bg-white/5 hover:text-white transition-all font-medium text-sm"
                        >
                            Dismiss
                        </button>

                        <button
                            onClick={handleWatchTutorial}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25 transition-all font-medium text-sm flex items-center gap-2 group"
                        >
                            <PlayCircle size={16} className="group-hover:scale-110 transition-transform" />
                            Watch Tutorial
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
