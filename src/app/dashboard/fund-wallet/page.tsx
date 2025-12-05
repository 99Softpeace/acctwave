'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Copy, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import TransactionHistory from '@/components/dashboard/TransactionHistory';

export default function FundWalletPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [virtualAccount, setVirtualAccount] = useState<any>(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [amount, setAmount] = useState<string | number>('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchVirtualAccount();
    }, []);

    const fetchVirtualAccount = async () => {
        try {
            const res = await fetch('/api/user/virtual-account');
            const data = await res.json();
            if (data.success) {
                setVirtualAccount(data.data);
            } else {
                setError(data.message || 'Failed to load virtual account');
            }
        } catch (err) {
            setError('Failed to load virtual account');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePayment = async () => {
        const amountValue = Number(amount);
        if (!amountValue || amountValue < 100) {
            setError('Minimum funding amount is ₦100.');
            return;
        }
        setProcessing(true);
        setError('');

        try {
            const res = await fetch('/api/payment/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    email: session?.user?.email
                }),
            });
            const data = await res.json();

            if (data.success && data.authorization_url) {
                window.location.href = data.authorization_url;
            } else {
                setError(data.message || 'Failed to initiate payment.');
            }
        } catch (err) {
            setError('An error occurred while initiating payment.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Fund Wallet</h1>
                <p className="text-gray-400 mt-2">Transfer to your dedicated account number below to fund your wallet instantly.</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Online Payment Card */}
                <div className="glass-card p-8 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <CreditCard className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Online Payment</h2>
                            <p className="text-sm text-gray-400">Instant funding via Card / Transfer</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Amount (₦)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="Enter amount (min 100)"
                                min="100"
                            />
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={processing || Number(amount) < 100}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Pay Now'
                            )}
                        </button>

                        <div className="flex items-start gap-3 text-sm text-gray-400 bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <p>
                                Secured by PocketFi. Your wallet will be credited instantly after payment.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Virtual Account Card */}
                <div className="glass-card p-8 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-500/10 rounded-lg">
                            <Copy className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Bank Transfer</h2>
                            <p className="text-sm text-gray-400">Dedicated virtual account</p>
                        </div>
                    </div>

                    {virtualAccount ? (
                        <div className="space-y-6">
                            <div className="bg-white/5 rounded-xl p-6 space-y-6 border border-white/10">
                                <div>
                                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Bank Name</label>
                                    <p className="text-xl font-semibold text-white mt-1">{virtualAccount.bankName}</p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Account Number</label>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-3xl font-mono font-bold text-indigo-400 tracking-wider">
                                            {virtualAccount.accountNumber}
                                        </p>
                                        <button
                                            onClick={() => copyToClipboard(virtualAccount.accountNumber)}
                                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                            title="Copy Account Number"
                                        >
                                            {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Account Name</label>
                                    <p className="text-lg font-medium text-white mt-1">{virtualAccount.accountName}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 text-sm text-gray-400 bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <p>
                                    Transfers to this account are automatically credited to your wallet.
                                    Please allow 1-5 minutes for the transaction to reflect.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Generating your dedicated account...</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <TransactionHistory />
                </div>
            </div>
        </div>
    );
}
