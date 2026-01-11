'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, Heart } from 'lucide-react';

export default function ServiceColorInfo() {
    const [isOpen, setIsOpen] = useState(false);

    const categories = [
        {
            title: "Low Quality Services",
            color: "text-amber-400",
            bg: "bg-amber-400",
            iconColor: "#fbbf24", // yellow-400
            description: "Our Basic tier offers the most affordable BOT services with fairly lower quality. While we strive to provide satisfactory results, please note that there might be occasional drops or slowdown, and we cannot offer any guarantees for this tier."
        },
        {
            title: "Medium Quality Services",
            color: "text-green-500",
            bg: "bg-green-500",
            iconColor: "#22c55e", // green-500
            description: "The Medium tier provides services of moderate quality with the added benefit of refills against any drops. We are committed to ensuring that you receive a stable and consistent experience, backed by our refill policy. Services can be carefully used to attracting organic engagement."
        },
        {
            title: "High Quality Services",
            color: "text-blue-500",
            bg: "bg-blue-500",
            iconColor: "#3b82f6", // blue-500
            description: "Our Premium tier offers the best-in-class services, created through organic methods, ensuring a stable and reliable performance. With Elite services, you can expect top-notch quality without any drops, making it the most expensive but highly worthwhile option for a seamless experience."
        },
        {
            title: "Task / Farm System Services",
            color: "text-white",
            bg: "bg-white",
            iconColor: "#ffffff",
            description: "Services delivered through our task and farm system are known to be the highest quality on the market. Real users knowingly engage with your social profile Services can %100 attract your organic engagement."
        },
        {
            title: "Our Own Services",
            color: "text-orange-500",
            bg: "bg-orange-500",
            iconColor: "#f97316", // orange-500
            description: "These are services that we produce ourselves and provide directly as the primary source Only with us!"
        },
        {
            title: "Colorless Services",
            color: "text-gray-500",
            bg: "bg-gray-500",
            iconColor: "#6b7280", // gray-500
            description: "Services without a quality control check don't have a color indicator"
        }
    ];

    return (
        <div className="mt-6 flex justify-center">
            {/* Trigger Pill */}
            <button
                onClick={() => setIsOpen(true)}
                className="transform hover:scale-105 transition-all duration-300 max-w-full"
            >
                <div className="bg-[#0f1225] border border-white/5 px-4 md:px-6 py-2.5 md:py-3 rounded-full flex items-center gap-3 md:gap-4 shadow-lg shadow-black/20 overflow-hidden">
                    <div className="flex flex-col items-start gap-0.5 overflow-hidden">
                        <span className="text-[10px] md:text-xs text-gray-400 font-medium truncate max-w-[180px] md:max-w-none">
                            Acctwave Service Color Categorization
                        </span>
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></span>
                                <span className="text-[9px] md:text-[10px] text-gray-300 font-medium tracking-wide">Basic</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                                <span className="text-[9px] md:text-[10px] text-gray-300 font-medium tracking-wide">Medium</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                                <span className="text-[9px] md:text-[10px] text-gray-300 font-medium tracking-wide">Elite</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-[1px] h-6 md:h-8 bg-white/10 mx-0.5 md:mx-1 shrink-0"></div>

                    <span className="text-[9px] md:text-[10px] font-bold text-primary hover:text-primary-light transition-colors tracking-wider uppercase shrink-0 whitespace-nowrap">
                        SEE DETAILS
                    </span>
                </div>
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-4xl bg-[#080B1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#0f1225]">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Info className="w-5 h-5 text-primary" />
                                    Service Categorization Guide
                                </h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4 md:p-6 overflow-y-auto max-h-[70vh] md:max-h-[80vh] pb-24 md:pb-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    {categories.map((cat, index) => (
                                        <div
                                            key={index}
                                            className="bg-white/5 border border-white/5 rounded-xl p-4 md:p-5 hover:bg-white/[0.07] transition-colors group"
                                        >
                                            <div className="flex items-start gap-3 md:gap-4">
                                                <div className={`mt-1 p-2 rounded-lg bg-black/20 ${cat.color} shrink-0`}>
                                                    <Heart
                                                        fill="currentColor"
                                                        className="w-5 h-5 md:w-6 md:h-6"
                                                        strokeWidth={0}
                                                    />
                                                </div>
                                                <div className="space-y-1.5 md:space-y-2">
                                                    <h4 className="font-bold text-white text-sm group-hover:text-primary transition-colors">
                                                        {cat.title}
                                                    </h4>
                                                    <p className="text-xs leading-relaxed text-gray-400">
                                                        {cat.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
