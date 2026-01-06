'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import OrderForm from '@/components/order/OrderForm';
import { AlertCircle, Info } from 'lucide-react';

export default function NewOrderPage() {
    const router = useRouter();
    const { status } = useSession({
        required: true,
        onUnauthenticated() {
            router.push('/login');
        },
    });

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left Side: Form */}
                <div className="order-2 lg:order-1">
                    <Suspense fallback={<div className="text-white">Loading form...</div>}>
                        <OrderForm />
                    </Suspense>
                </div>

                {/* Right Side: Info */}
                <div className="order-1 lg:order-2 space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-4">
                            Boost Your <span className="text-primary">Social Media</span>
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Select a service, enter your link, and watch your account grow.
                            Our automated system processes orders instantly.
                        </p>
                    </div>

                    <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Info className="w-5 h-5 text-primary" />
                            Important Information
                        </h3>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                <span className="flex-1 leading-relaxed">
                                    Make sure your account is set to <strong className="text-white font-semibold">Public</strong> before ordering.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                <span className="flex-1 leading-relaxed">
                                    Do not place two orders for the same link at the same time. Wait for the first one to complete.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                <span className="flex-1 leading-relaxed">
                                    If you enter a wrong link, we cannot refund or cancel the order. Please <strong className="text-white font-semibold">double check!</strong>
                                </span>
                            </li>
                        </ul>
                        <ul className="space-y-4 text-gray-400 text-sm mt-4">
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                <span className="flex-1 leading-relaxed">
                                    For <strong>Views</strong> boosting, please enter the <strong className="text-white font-semibold">Video Link</strong>, not your profile link.
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                        <p className="text-yellow-200/80 text-sm">
                            <strong>Note:</strong> Drip-feed is currently disabled for maintenance.
                            Standard delivery is working normally.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
