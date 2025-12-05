'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
    {
        question: "What services do you offer?",
        answer: "We provide comprehensive social media growth services (SMM) and instant virtual numbers for SMS verification across various platforms like WhatsApp, Telegram, and more."
    },
    {
        question: "How do the virtual numbers work?",
        answer: "Our virtual numbers allow you to receive SMS verification codes instantly without needing a physical SIM card. Perfect for verifying accounts on any platform."
    },
    {
        question: "Are your services safe to use?",
        answer: "Yes! Our SMM services are designed to be safe for your accounts, and our virtual numbers are private and secure. We prioritize your account safety."
    },
    {
        question: "How fast is delivery?",
        answer: "Most of our services are automated and delivered instantly. You'll see results or receive verification codes within seconds of placing an order."
    },
    {
        question: "Do you offer API support?",
        answer: "Yes, we offer a fully functional API that allows panel owners and developers to resell our services directly to their own customers."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept various payment methods including Bank Transfer, Crypto, and other local payment options to make funding your account easy."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <div className="text-center mb-16">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-4xl font-bold text-white mb-4"
                >
                    We answered some of the most frequently<br />
                    asked questions on our panel.
                </motion.h2>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card rounded-2xl overflow-hidden border border-white/5"
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                        >
                            <span className="font-medium text-white">{faq.question}</span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIndex === index ? 'bg-[#007AFF] text-white' : 'bg-white/10 text-gray-400'}`}>
                                {openIndex === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </div>
                        </button>
                        <AnimatePresence>
                            {openIndex === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                                        {faq.answer}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
