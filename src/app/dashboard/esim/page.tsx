'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Smartphone, Wifi, CreditCard, Zap, Loader2, CheckCircle, AlertCircle, Globe, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

interface ESIMPlan {
    ID: number;
    name?: string;
    price: string;
    dataInGb: number;
    duration: number;
    speed: string;
    network: any;
}

export default function ESIMPage() {
    const { data: session } = useSession();
    const [countries, setCountries] = useState<any[]>([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [plans, setPlans] = useState<ESIMPlan[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [purchasing, setPurchasing] = useState<number | null>(null);
    const [purchasedOrder, setPurchasedOrder] = useState<any>(null);

    const EXCHANGE_RATE = 1600; // Display rate

    useEffect(() => {
        fetchCountries();
    }, []);

    useEffect(() => {
        if (selectedCountry) {
            fetchPlans(selectedCountry);
        } else {
            setPlans([]);
        }
    }, [selectedCountry]);

    const fetchCountries = async () => {
        try {
            const res = await fetch('/api/services/countries'); // Reusing existing route
            const data = await res.json();
            // SMSPool returns short_name which we need.
            // Filter only popular ones or sort them?
            // The existing route returns { id, name, short_name }
            setCountries(data);
        } catch (error) {
            console.error('Failed to load countries', error);
            toast.error('Failed to load countries');
        } finally {
            setLoadingCountries(false);
        }
    };

    const fetchPlans = async (countryCode: string) => {
        setLoadingPlans(true);
        try {
            const res = await fetch(`/api/esim/plans?country=${countryCode}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setPlans(data);
            } else {
                setPlans([]);
                if (data.error) toast.error(data.error);
            }
        } catch (error) {
            console.error('Failed to load plans', error);
            toast.error('Failed to load eSIM plans');
        } finally {
            setLoadingPlans(false);
        }
    };

    const handlePurchase = async (plan: ESIMPlan) => {
        if (!confirm(`Are you sure you want to purchase this eSIM for ₦${(parseFloat(plan.price) * EXCHANGE_RATE).toLocaleString()}?`)) return;

        setPurchasing(plan.ID);
        try {
            const res = await fetch('/api/esim/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: plan.ID,
                    price: parseFloat(plan.price)
                })
            });

            const data = await res.json();

            if (data.success) {
                toast.success('eSIM purchased successfully!');
                setPurchasedOrder(data.order);
                // Scroll to top or show modal
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                toast.error(data.message || 'Purchase failed');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setPurchasing(null);
        }
    };

    if (purchasedOrder) {
        return (
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Purchase Successful!</h2>
                        <p className="text-gray-600">Your eSIM is ready to activate.</p>
                    </div>

                    {purchasedOrder.qr_code && (
                        <div className="bg-white p-4 rounded-xl inline-block shadow-sm border border-gray-100">
                            <img src={purchasedOrder.qr_code} alt="eSIM QR Code" className="w-48 h-48" />
                        </div>
                    )}

                    <div className="bg-white rounded-xl p-6 text-left space-y-4 border border-gray-100">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Activation Code</label>
                            <div className="flex items-center gap-2 mt-1">
                                <code className="bg-gray-100 px-3 py-2 rounded-lg text-lg font-mono block w-full">
                                    {purchasedOrder.activation_code || 'N/A'}
                                </code>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Instructions</label>
                            <p className="text-sm text-gray-600 mt-1">
                                1. Go to Settings {'>'} Cellular/Mobile Data {'>'} Add eSIM<br />
                                2. Scan the QR code or enter the activation code manually.<br />
                                3. Enable Data Roaming for this line.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setPurchasedOrder(null)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        Buy Another eSIM
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Buy eSIM</h1>
                <p className="text-gray-400">Instant delivery of eSIM profiles for global connectivity.</p>
            </div>

            {/* Country Selector */}
            <div className="glass-card p-6 rounded-2xl border border-white/10">
                <label className="block text-sm font-medium text-gray-400 mb-2">Select Destination</label>
                <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white appearance-none focus:outline-none focus:border-primary/50 transition-colors"
                        disabled={loadingCountries}
                    >
                        <option value="">Select a country...</option>
                        {countries.map((c) => (
                            <option key={c.id} value={c.short_name}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Plans Grid */}
            {selectedCountry && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Wifi className="w-5 h-5 text-primary" />
                        Available Plans
                    </h2>

                    {loadingPlans ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : plans.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {plans.map((plan) => (
                                <div key={plan.ID} className="glass-card p-6 rounded-2xl border border-white/10 hover:border-primary/30 transition-all relative group">
                                    <div className="absolute top-4 right-4 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                                        {plan.speed}
                                    </div>

                                    <div className="mb-6">
                                        <div className="text-4xl font-bold text-white mb-1">
                                            {plan.dataInGb} <span className="text-lg text-gray-400">GB</span>
                                        </div>
                                        <div className="text-gray-400 text-sm">Valid for {plan.duration} days</div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">Price</span>
                                            <span className="text-white font-bold">₦{(parseFloat(plan.price) * EXCHANGE_RATE).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">Network</span>
                                            <span className="text-gray-300 truncate max-w-[150px]" title={JSON.stringify(plan.network)}>
                                                {Array.isArray(plan.network) ? plan.network[0]?.network?.map((n: any) => n.operatorName).join(', ') : 'Multi-Network'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handlePurchase(plan)}
                                        disabled={purchasing === plan.ID}
                                        className="w-full bg-white/5 hover:bg-primary hover:text-white text-white border border-white/10 hover:border-primary py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                                    >
                                        {purchasing === plan.ID ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <QrCode className="w-5 h-5" />
                                                Purchase
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No plans available for this country.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
