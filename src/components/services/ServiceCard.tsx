'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingCart, Check, X } from 'lucide-react';

interface ServiceProps {
    service: number;
    name: string;
    type: string;
    category: string;
    rate: string;
    min: string;
    max: string;
    refill: boolean;
    cancel: boolean;
}

export default function ServiceCard({ service }: { service: ServiceProps }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="glass-card p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-all group relative overflow-hidden"
        >
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary/20 transition-colors" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                        ID: {service.service}
                    </span>
                    <span className="text-xs font-medium text-gray-400">
                        {service.category}
                    </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[3.5rem]">
                    {service.name}
                </h3>

                <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-2xl font-bold text-white">${service.rate}</span>
                    <span className="text-sm text-gray-400">/ 1000</span>
                </div>

                <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Min / Max</span>
                        <span className="text-white font-medium">{service.min} / {service.max}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Refill</span>
                        <span className={`font-medium flex items-center gap-1 ${service.refill ? 'text-green-400' : 'text-red-400'}`}>
                            {service.refill ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            {service.refill ? 'Available' : 'No Refill'}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Cancel</span>
                        <span className={`font-medium flex items-center gap-1 ${service.cancel ? 'text-green-400' : 'text-red-400'}`}>
                            {service.cancel ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            {service.cancel ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                </div>

                <Link
                    href={`/order?service=${service.service}`}
                    className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-primary hover:text-white text-white py-3 rounded-xl font-medium transition-all group-hover:shadow-[0_0_15px_rgba(0,122,255,0.4)]"
                >
                    <ShoppingCart className="w-4 h-4" />
                    Order Now
                </Link>
            </div>
        </motion.div>
    );
}
