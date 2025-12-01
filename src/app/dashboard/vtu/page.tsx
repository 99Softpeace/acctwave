'use client';

import { useState } from 'react';
import { Smartphone, Wifi, CreditCard, Zap, Loader2, CheckCircle, AlertCircle, History } from 'lucide-react';
import { toast } from 'react-hot-toast';

const NETWORKS = [
    { id: 'MTN', name: 'MTN', color: 'bg-yellow-400', textColor: 'text-yellow-900' },
    { id: 'AIRTEL', name: 'Airtel', color: 'bg-red-500', textColor: 'text-white' },
    { id: 'GLO', name: 'Glo', color: 'bg-green-500', textColor: 'text-white' },
    { id: '9MOBILE', name: '9Mobile', color: 'bg-green-900', textColor: 'text-white' },
];

import { DATA_PLANS } from '@/lib/vtu';

export default function VTUPage() {
    const [activeTab, setActiveTab] = useState<'airtime' | 'data' | 'datacard'>('airtime');
    const [loading, setLoading] = useState(false);

    // Form States
    const [network, setNetwork] = useState('MTN');
    const [phone, setPhone] = useState('');
    const [amount, setAmount] = useState('');
    const [plan, setPlan] = useState('');
    const [cardName, setCardName] = useState('');
    const [quantity, setQuantity] = useState(1);

    const handlePurchase = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/vtu/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: activeTab,
                    network,
                    phone,
                    amount,
                    planId: plan,
                    quantity,
                    nameOnCard: cardName
                })
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Transaction Successful!');
                // Reset forms
                setAmount('');
                setPhone('');
                setCardName('');
                if (activeTab === 'datacard' && data.data) {
                    // Show pins if available in response
                    // You might want to display them in a modal or alert
                    console.log('Pins:', data.data);
                }
            } else {
                toast.error(data.message || 'Transaction Failed');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const filteredPlans = DATA_PLANS.filter(p => p.network === network);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">VTU & Bills Payment</h1>
                <p className="text-gray-400">Instant recharge for Airtime, Data, and more.</p>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 w-full md:w-fit">
                <button
                    onClick={() => setActiveTab('airtime')}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'airtime' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <Smartphone className="w-4 h-4" />
                    Airtime
                </button>
                <button
                    onClick={() => setActiveTab('data')}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'data' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <Wifi className="w-4 h-4" />
                    Data
                </button>
                <button
                    onClick={() => setActiveTab('datacard')}
                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'datacard' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <CreditCard className="w-4 h-4" />
                    Data Card
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form Area */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-6 rounded-2xl border border-white/5">
                        <form onSubmit={handlePurchase} className="space-y-6">
                            {/* Network Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-3">Select Network</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {NETWORKS.map((net) => (
                                        <button
                                            key={net.id}
                                            type="button"
                                            onClick={() => setNetwork(net.id)}
                                            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${network === net.id
                                                ? 'bg-primary/10 border-primary ring-1 ring-primary'
                                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full ${net.color} flex items-center justify-center font-bold text-[10px] ${net.textColor}`}>
                                                {net.name}
                                            </div>
                                            <span className={`text-xs font-medium ${network === net.id ? 'text-white' : 'text-gray-400'}`}>
                                                {net.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic Fields based on Tab */}
                            {activeTab === 'airtime' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="08012345678"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Amount (₦)</label>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="100 - 50,000"
                                            min="50"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'data' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Data Plan</label>
                                        <select
                                            value={plan}
                                            onChange={(e) => setPlan(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                                            required
                                        >
                                            <option value="">Select a plan</option>
                                            {filteredPlans.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} - ₦{p.price} ({p.validity})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="08012345678"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'datacard' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Data Plan</label>
                                        <select
                                            value={plan}
                                            onChange={(e) => setPlan(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                                            required
                                        >
                                            <option value="">Select a plan</option>
                                            {filteredPlans.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} - ₦{p.price}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Quantity</label>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            min="1"
                                            max="10"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Name on Card</label>
                                        <input
                                            type="text"
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="e.g. My Business Name"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-blue-600 disabled:bg-gray-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                    {activeTab === 'airtime' ? 'Purchase Airtime' : activeTab === 'data' ? 'Purchase Data' : 'Generate Pins'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Side: Info & History */}
                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                            Important Note
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Transactions are processed instantly. Please verify the phone number before proceeding.
                            <br /><br />
                            For Data Cards, the PINs will be displayed immediately after purchase and also sent to your email.
                        </p>
                    </div>

                    <div className="glass-card p-6 rounded-2xl border border-white/5">
                        <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                            <History className="w-5 h-5 text-gray-400" />
                            Recent Transactions
                        </h3>
                        <div className="space-y-4">
                            {/* Empty State */}
                            <div className="text-center py-8 text-gray-500 text-sm">
                                No recent transactions
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
