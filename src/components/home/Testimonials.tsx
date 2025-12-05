'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: "Keith Irvine",
        role: "Instagram Model",
        content: "I cannot stress enough how happy I am with the service that I received. Thanks to all of you, my Instagram account is surging with activity! You've not only earned yourself a loyal customer, but a friend for life.",
        rating: 5
    },
    {
        name: "Sara Jade Bevis",
        role: "Instagram Model",
        content: "I cannot stress enough how happy I am with the service that I received. Thanks to all of you, my Instagram account is surging with activity! You've not only earned yourself a loyal customer, but a friend for life.",
        rating: 5
    },
    {
        name: "John Doe",
        role: "YouTuber",
        content: "I cannot stress enough how happy I am with the service that I received. Thanks to all of you, my Instagram account is surging with activity! You've not only earned yourself a loyal customer, but a friend for life.",
        rating: 5
    }
];

export default function Testimonials() {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
            <div className="text-center mb-16 relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-4xl font-bold text-white"
                >
                    What People Say About Us?
                </motion.h2>
            </div>

            {/* Blue Background Card */}
            <div className="bg-[#007AFF] rounded-[3rem] p-8 md:p-12 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-[#080B1A] p-6 rounded-2xl border border-white/5 hover:-translate-y-1 transition-transform duration-300"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600" />
                                <div>
                                    <h4 className="text-white font-bold text-sm">{testimonial.name}</h4>
                                    <div className="flex text-yellow-400 text-xs">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 fill-current" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed mb-4">
                                {testimonial.content}
                            </p>
                            <div className="w-8 h-0.5 bg-white/10" />
                            <p className="text-[#007AFF] text-xs mt-2 font-medium">{testimonial.role}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
