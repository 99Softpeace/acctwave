'use client';

import { motion } from 'framer-motion';
import { PlayCircle, Youtube } from 'lucide-react';

export default function TutorialsPage() {
    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-bold text-white">Tutorials</h1>
                    <p className="text-gray-400">Watch our guides to learn how to use the platform effectively</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Featured Video (Large) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="col-span-1 md:col-span-2 lg:col-span-3 aspect-video bg-[#080B1A] border border-white/10 rounded-2xl overflow-hidden relative group"
                >
                    <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=FeatureVideoPlaceholder" // Placeholder: Rick Roll for safety, user can replace
                        title="Platform Overview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                </motion.div>

                {/* Placeholder for more videos */}
                {[1, 2, 3].map((item, index) => (
                    <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="bg-[#080B1A] border border-white/5 rounded-xl overflow-hidden group hover:border-primary/50 transition-all"
                    >
                        <div className="aspect-video bg-white/5 relative flex items-center justify-center">
                            <Youtube className="w-12 h-12 text-gray-600 group-hover:text-red-500 transition-colors" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white font-medium flex items-center gap-2">
                                    <PlayCircle className="w-5 h-5" />
                                    Watch Video
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-medium text-white group-hover:text-primary transition-colors">How to Fund Your Wallet</h3>
                            <p className="text-sm text-gray-400 mt-1">Learn the quickest ways to add funds to your account.</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
