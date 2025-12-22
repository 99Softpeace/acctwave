'use client';

import { useState, useMemo } from 'react';
import { Smartphone, Wifi, Loader2, CheckCircle, Search, Menu } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { STATIC_DATA_PLANS } from '@/lib/vtu-plans';

const NETWORKS = [
    { id: 'MTN', name: 'MTN', color: 'bg-yellow-400', textColor: 'text-yellow-900', border: 'border-yellow-500' },
    { id: 'GLO', name: 'Glo', color: 'bg-green-600', textColor: 'text-white', border: 'border-green-400' },
    { id: 'AIRTEL', name: 'Airtel', color: 'bg-red-600', textColor: 'text-white', border: 'border-red-400' },
    { id: '9MOBILE', name: '9Mobile', color: 'bg-green-900', textColor: 'text-white', border: 'border-green-700' },
];

export default function VTUPage() {
    const [network, setNetwork] = useState('MTN');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    // UI Logic: Filter Plans by Network and Group by Type
    const groupedPlans = useMemo(() => {
        const filtered = STATIC_DATA_PLANS.filter(p => p.network === network);
        // Group: { 'AWOOF': [...], 'CG': [...] }
        const groups: Record<string, typeof filtered> = {};

        filtered.forEach(plan => {
            const type = plan.type || 'OTHERS';
            if (!groups[type]) groups[type] = [];
            groups[type].push(plan);
        });

        return groups;
    }, [network]);

    const handlePurchase = async (planId: number, price: number, name: string) => {
        if (!phone || phone.length < 10) {
            toast.error('Please enter a valid phone number first');
            return;
        }

        if (!confirm(`Confirm Purchase?\n\n${network} ${name}\nPrice: ₦${price}\nPhone: ${phone}`)) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/vtu/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'data',
                    network,
                    phone,
                    planId,
                    amount: price // passed for validation mainly
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Data Sent Successfully! 🚀');
            } else {
                toast.error(data.message || 'Failed');
            }
        } catch (err) {
            toast.error('Connection Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition">
                    {/* Back icon simulated */}
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-bold text-white">Buy Data</h1>
            </div>

            {/* Network Selector */}
            <div className="space-y-3">
                <p className="text-sm text-gray-400">Select any network</p>
                <div className="flex gap-4">
                    {NETWORKS.map(net => (
                        <button
                            key={net.id}
                            onClick={() => setNetwork(net.id)}
                            className={`relative group transition-all duration-300 ${network === net.id ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
                        >
                            <div className={`w-14 h-14 rounded-full ${net.color} flex items-center justify-center border-2 ${net.border} shadow-lg shadow-black/50`}>
                                <span className={`font-bold text-[10px] ${net.textColor}`}>{net.name}</span>
                            </div>
                            {network === net.id && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input */}
            <div className="space-y-3">
                <p className="text-sm text-gray-400">Phone number</p>
                <div className="relative">
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="08123456789"
                        className="w-full bg-black/40 border border-white/10 rounded-full py-4 px-6 text-white text-lg focus:outline-none focus:border-white/30 transition-all font-mono tracking-wider"
                    />
                </div>
            </div>

            {/* Plans Grid */}
            <div className="space-y-8">
                {Object.entries(groupedPlans).map(([type, plans]) => (
                    <div key={type} className="space-y-4">
                        <h3 className="text-white font-bold uppercase tracking-wide text-sm flex items-center gap-2">
                            {network} {type} <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400">{plans.length}</span>
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {plans.map(plan => (
                                <button
                                    key={plan.id}
                                    disabled={loading}
                                    onClick={() => handlePurchase(plan.id, plan.price, plan.name)}
                                    className="bg-[#2A2A2A] hover:bg-[#333] active:scale-95 transition-all p-5 rounded-xl border border-white/5 text-left flex flex-col justify-between h-32 relative overflow-hidden group"
                                >
                                    <div className="z-10 relative">
                                        <p className="text-gray-400 text-xs font-medium mb-1">₦ {plan.price.toLocaleString()}</p>
                                        <p className="text-white text-lg font-bold">{plan.size}</p>
                                        <p className="text-gray-500 text-[10px] mt-1">{plan.validity}</p>
                                    </div>

                                    {/* Decoration */}
                                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {Object.keys(groupedPlans).length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No plans available for this network yet.
                    </div>
                )}
            </div>

            {loading && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="authenticate-card p-6 rounded-2xl flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="text-white font-medium">Processing...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
