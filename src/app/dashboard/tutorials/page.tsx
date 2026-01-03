'use client';

import { motion } from 'framer-motion';

export default function TutorialsPage() {
    const videos = [
        {
            src: "https://www.youtube.com/embed/8WhsMTxh4T8",
            title: "HOW TO FUND YOUR WALLET ON ACCTWAVE"
        },
        {
            src: "https://www.youtube.com/embed/y9mFqWy04D0",
            title: "HOW TO BOOST YOUR ACCOUNT ON ACCTWAVE✨"
        },
        {
            src: "https://www.youtube.com/embed/YEuhrQcJJ6I",
            title: "HOW TO BUY FOREIGN NUMBERS ON ACCTWAVE ✨"
        },
        {
            src: "https://www.youtube.com/embed/c_5yGoivAV4",
            title: "HOW TO ACTIVATE SOCIAL MEDIA LOGS"
        }
    ];

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videos.map((video, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-[#080B1A] border border-white/5 rounded-2xl overflow-hidden flex flex-col group hover:border-primary/50 transition-all shadow-lg"
                    >
                        <div className="relative w-full aspect-[9/16] bg-black/50">
                            <iframe
                                src={video.src}
                                title={video.title}
                                className="absolute inset-0 w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                        <div className="p-4 bg-white/5 flex-1">
                            <h3 className="font-bold text-white text-lg leading-snug group-hover:text-primary transition-colors">
                                {video.title}
                            </h3>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
