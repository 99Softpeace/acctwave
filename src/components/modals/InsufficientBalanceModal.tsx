'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface InsufficientBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InsufficientBalanceModal({ isOpen, onClose }: InsufficientBalanceModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4 z-50"
                    >
                        <div className="bg-[#1a1b1e] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                {/* Icon */}
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 relative">
                                    <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
                                    <Wallet className="w-10 h-10 text-red-500" />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2">Insufficient Balance</h3>
                                <p className="text-gray-400 mb-8">
                                    You don't have enough funds to complete this transaction. Please fund your wallet to continue.
                                </p>

                                {/* Action Button */}
                                <Link
                                    href="/dashboard/fund-wallet"
                                    className="w-full bg-primary hover:bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group"
                                >
                                    Fund Wallet
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>

                                <button
                                    onClick={onClose}
                                    className="mt-4 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    Cancel Transaction
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
