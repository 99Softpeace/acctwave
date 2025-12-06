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
                    <a
                        href="https://youtube.com/@acctwave?si=iIBtZDHNWzEynpaw"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-full relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-purple-600/10 hover:from-red-600/20 hover:to-purple-600/20 transition-all flex items-center justify-center group">
                            <div className="text-center p-8">
                                <Youtube className="w-24 h-24 text-red-500 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
                                <h2 className="text-3xl font-bold text-white mb-4">Acctwave Official Channel</h2>
                                <p className="text-lg text-gray-400 mb-8 max-w-lg mx-auto">
                                    Visit our YouTube channel for detailed tutorials, guides, and updates on how to use Acctwave effectively.
                                </p>
                                <span className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors">
                                    <PlayCircle className="w-6 h-6" />
                                    Watch Tutorials
                                </span>
                            </div>
                        </div>
                    </a>
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
