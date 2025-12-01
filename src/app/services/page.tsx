'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Smartphone, Code, Users, ArrowRight, Zap, Wifi } from 'lucide-react';
import Link from 'next/link';

const services = [
    {
        id: 'smm',
        name: 'Social Media Growth',
        icon: TrendingUp,
        color: 'from-blue-500 to-purple-600',
        features: ['All Major Platforms', 'Instant Delivery', 'Real Engagement', '24/7 Support'],
        desc: 'Boost your presence across Instagram, TikTok, YouTube, and more with our premium SMM services.',
        link: '/signup',
        cta: 'Start Growing'
    },
    {
        id: 'numbers',
        name: 'Virtual Numbers',
        icon: Smartphone,
        color: 'from-green-400 to-emerald-600',
        features: ['150+ Countries', 'Instant SMS', 'Private & Secure', 'One-Time Use'],
        desc: 'Get temporary phone numbers for SMS verification on WhatsApp, Telegram, and other apps.',
        link: '/numbers',
        cta: 'Get Numbers'
    },
    {
        id: 'vtu',
        name: 'VTU & Bills',
        icon: Wifi,
        color: 'from-yellow-400 to-orange-500',
        features: ['Airtime Top-up', 'Data Bundles', 'Electricity Bills', 'Cable TV'],
        desc: 'Instant recharge for all networks and bill payments at the best rates.',
        link: '/signup',
        cta: 'Pay Bills'
    },
    {
        id: 'api',
        name: 'API Solutions',
        icon: Code,
        color: 'from-orange-400 to-red-600',
        features: ['Easy Integration', 'Full Documentation', 'High Rate Limits', 'Developer Support'],
        desc: 'Connect your own platform directly to our services with our robust and reliable API.',
        link: '/signup', // Assuming API docs are inside dashboard or separate
        cta: 'Access API'
    },
    {
        id: 'reseller',
        name: 'Reseller Panel',
        icon: Users,
        color: 'from-cyan-400 to-blue-600',
        features: ['Wholesale Prices', 'White Label', 'Bulk Orders', 'Priority Status'],
        desc: 'Start your own SMM business. Get access to exclusive reseller rates and tools.',
        link: '/signup',
        cta: 'Become Reseller'
    }
];

export default function ServicesPage() {
    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Floating Background Elements */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6"
                    >
                        Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient">Services</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-400 max-w-2xl mx-auto"
                    >
                        Elevate your social presence with our high-quality, instant delivery solutions.
                    </motion.p>
                </div>



                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            className="group relative perspective-1000"
                        >
                            <motion.div
                                whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="relative h-full"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative h-full glass-card p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-all duration-300">
                                    {/* Icon & Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <service.icon className="w-7 h-7 text-white" />
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
                                            Instant Start
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-white mb-3">{service.name}</h3>
                                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                        {service.desc}
                                    </p>

                                    {/* Features List */}
                                    <div className="space-y-3 mb-8">
                                        {service.features.map((feature) => (
                                            <div key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        href={service.link}
                                        className="block w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-center text-white font-medium transition-all group-hover:bg-primary group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(0,122,255,0.3)] flex items-center justify-center gap-2"
                                    >
                                        {service.cta}
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                {/* Logs Card Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mt-24 max-w-4xl mx-auto"
                >
                    <div className="glass-card rounded-3xl border border-white/10 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <Code className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Live Activity Logs</h3>
                                    <p className="text-sm text-gray-400">Real-time system performance</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs font-mono text-green-400">SYSTEM ONLINE</span>
                            </div>
                        </div>

                        <div className="p-6 bg-black/40 font-mono text-sm space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {[
                                { time: '10:42:15', type: 'INFO', msg: 'Order #8921 processed successfully', color: 'text-green-400' },
                                { time: '10:42:12', type: 'API', msg: 'New connection from 192.168.x.x', color: 'text-blue-400' },
                                { time: '10:41:58', type: 'SYSTEM', msg: 'Service metrics updated: 99.9% uptime', color: 'text-purple-400' },
                                { time: '10:41:45', type: 'INFO', msg: 'User registration: @crypto_king', color: 'text-gray-300' },
                                { time: '10:41:30', type: 'API', msg: 'Rate limit check passed', color: 'text-blue-400' },
                                { time: '10:41:15', type: 'INFO', msg: 'Payment gateway handshake complete', color: 'text-yellow-400' },
                            ].map((log, i) => (
                                <div key={i} className="flex items-start gap-4 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                    <span className="text-gray-500 shrink-0">{log.time}</span>
                                    <span className={`font-bold shrink-0 w-16 ${log.color}`}>{log.type}</span>
                                    <span className="text-gray-300">{log.msg}</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-2 text-gray-500 pt-2 animate-pulse">
                                <span className="text-primary">➜</span>
                                <span>Listening for new events...</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-20 text-center"
                >
                    <div className="inline-flex flex-col items-center gap-4 p-8 rounded-3xl glass border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 animate-gradient opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-2">Ready to go viral?</h2>
                            <p className="text-gray-400 mb-6">Join thousands of creators who trust Acctwave.</p>
                            <Link
                                href="/signup"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors transform hover:scale-105 duration-200"
                            >
                                <Zap className="w-5 h-5" />
                                Get Started Now
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
