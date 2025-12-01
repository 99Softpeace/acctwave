'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NumberSelection from '@/components/numbers/NumberSelection';
import { ShieldCheck, Clock, Globe } from 'lucide-react';

export default function NumbersPage() {
    const router = useRouter();
    const { status } = useSession({
        required: true,
        onUnauthenticated() {
            router.push('/login');
        },
    });

    return (
        <div className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left Side: Info */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-4">
                                Instant <span className="text-primary">Virtual Numbers</span>
                            </h1>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                Get temporary phone numbers for SMS verification from over 150 countries.
                                Perfect for WhatsApp, Telegram, Google, and more.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                {
                                    icon: ShieldCheck,
                                    title: "Private & Secure",
                                    desc: "Numbers are unique to you and discarded after use."
                                },
                                {
                                    icon: Clock,
                                    title: "Instant Delivery",
                                    desc: "Receive SMS codes within seconds."
                                },
                                {
                                    icon: Globe,
                                    title: "Global Coverage",
                                    desc: "Access numbers from USA, UK, Nigeria, and more."
                                }
                            ].map((feature, i) => (
                                <div key={i} className="glass-card p-6 rounded-2xl border border-white/5">
                                    <feature.icon className="w-8 h-8 text-primary mb-4" />
                                    <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl">
                            <h3 className="font-bold text-white mb-2">How it works</h3>
                            <ol className="list-decimal list-inside space-y-2 text-gray-400 text-sm">
                                <li>Select your desired country and service.</li>
                                <li>Click "Generate Number" to get your temporary number.</li>
                                <li>Use the number in your app (e.g., WhatsApp).</li>
                                <li>Wait for the SMS code to appear here automatically.</li>
                            </ol>
                        </div>
                    </div>

                    {/* Right Side: Selection Tool */}
                    <div>
                        <NumberSelection />
                    </div>
                </div>
            </div>
        </div>
    );
}
