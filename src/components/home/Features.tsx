'use client';

import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw, Headset, Star, Code, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const features = [
    {
        title: "Supports",
        desc: "Technical support for all our services 24/7 to help you.",
        icon: Headset,
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
        border: "border-yellow-400/20"
    },
    {
        title: "High quality services",
        desc: "Get the best high quality services and in less time here.",
        icon: Star,
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/20"
    },
    {
        title: "API support",
        desc: "We have API Support for panel owners so you can resell easily.",
        icon: Code,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-400/20"
    },
    {
        title: "Secure Payments",
        desc: "We have popular methods as PayPal and many more.",
        icon: ShieldCheck,
        color: "text-green-500",
        bg: "bg-green-500/10",
        border: "border-green-500/20"
    }
];

export default function Features() {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Resellers Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="glass-card p-8 rounded-3xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center mb-6 text-blue-400">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Resellers</h3>
                        <p className="text-gray-400 mb-8 max-w-md">
                            You can resell our services and grow your profit easily. Resellers are important part of SMM PANEL.
                        </p>
                        <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
                            Get Started
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>

                {/* Updates Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-8 rounded-3xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-purple-600/20 flex items-center justify-center mb-6 text-purple-400">
                            <RefreshCw className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Updates</h3>
                        <p className="text-gray-400 mb-8 max-w-md">
                            Services are updated daily in order to be further improved and to provide you with best experience.
                        </p>
                        <Link href="/services" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors">
                            View Services
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Small Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + (index * 0.1) }}
                        className={`glass-card p-6 rounded-2xl border ${feature.border} hover:bg-white/5 transition-colors`}
                    >
                        <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 ${feature.color}`}>
                            <feature.icon className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {feature.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
