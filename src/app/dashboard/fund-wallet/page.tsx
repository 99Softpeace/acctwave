'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CreditCard, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import TransactionHistory from '@/components/dashboard/TransactionHistory';

export default function FundWalletPage() {
    const { data: session } = useSession();
    const [amount, setAmount] = useState<string>('');
    const [processing, setProcessing] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState('');
    const [verificationMessage, setVerificationMessage] = useState('');

    useEffect(() => {
        checkPendingTransaction();
    }, []);

    const checkPendingTransaction = async () => {
        const pendingRef = localStorage.getItem('pocketfi_pending_ref');
        if (!pendingRef) return;

        console.log('Found pending transaction:', pendingRef);
        setVerifying(true);
        setVerificationMessage('Verifying your recent payment...');

        try {
            const res = await fetch(`/api/payment/verify?reference=${pendingRef}`);
            const data = await res.json();

            if (data.success && data.status === 'completed') {
                setVerificationMessage('Payment successful! Updating wallet...');
                localStorage.removeItem('pocketfi_pending_ref');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else if (data.status === 'failed') {
                setError(data.message || 'Payment failed.');
                localStorage.removeItem('pocketfi_pending_ref');
                setVerifying(false);
            } else {
                setVerificationMessage('Payment is processing. Your balance will update automatically once confirmed.');
                setTimeout(() => setVerifying(false), 4000);
            }
        } catch (err) {
            console.error('Verification error:', err);
            setVerifying(false);
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amountValue,
                    email: session?.user?.email
                }),
            });
            const data = await res.json();

            if (data.success && data.authorization_url) {
                if (data.reference) {
                    localStorage.setItem('pocketfi_pending_ref', data.reference);
                }
                // Redirect to PocketFi Checkout
                window.location.href = data.authorization_url;
            } else {
                setError(data.message || 'Failed to initiate payment.');
                setProcessing(false);
            }
        } catch (err) {
            setError('An error occurred. Please check your connection.');
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Fund Wallet</h1>
                <p className="text-gray-400 mt-2">Add funds to purchase data, airtime, and other services.</p>
            </div>

            {verifying && (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-3 rounded-lg flex items-center gap-2 animate-pulse">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    {verificationMessage}
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Form */}
                <div className="glass-card p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <CreditCard className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Online Payment</h2>
                            <p className="text-sm text-gray-400">Instant funding via Card/Transfer</p>
                        </div>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-2">Amount to Fund (₦)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₦</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="e.g. 5000"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                                    min="100"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Minimum amount: ₦100</p>
                        </div>

                        <button
                            type="submit"
                            disabled={processing || verifying}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-medium py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            {processing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Proceed to Pay'
                            )}
                        </button>
                    </form>
                </div>

                {/* Info Card */}
                <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-center space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Smartphone className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Instant Credit</h3>
                            <p className="text-sm text-gray-400 mt-1">Your wallet is credited immediately after successful payment.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <CreditCard className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Multiple Methods</h3>
                            <p className="text-sm text-gray-400 mt-1">Pay via Bank Transfer, Card, or USSD securely.</p>
                        </div>
                    </div>
                </div>
            </div>

            <TransactionHistory />
        </div>
    );
}
