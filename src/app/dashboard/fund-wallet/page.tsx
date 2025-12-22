'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Copy, CheckCircle, RefreshCw, Wallet, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface VirtualAccount {
    bankName: string;
    accountNumber: string;
    accountName: string;
}

export default function FundWalletPage() {
    const [account, setAccount] = useState<VirtualAccount | null>(null);
    const [balance, setBalance] = useState<number | null>(null); // Balance from API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAccountDetails();
    }, []);

    const fetchAccountDetails = async () => {
        try {
            const res = await fetch('/api/user/virtual-account');
            const data = await res.json();

            if (data.success) {
                setAccount(data.data);
                setBalance(data.balance); // Set balance from API
            } else {
                setError(data.message || 'Failed to load account details.');
            }
        } catch (err) {
            console.error('Error loading DVA:', err);
            setError('Failed to load account details. Please refresh.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Account number copied!', {
            icon: '📋',
            style: {
                background: '#10B981',
                color: '#fff',
            },
        });
    };

    // Formatter for currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Fund Wallet</h1>
                <p className="text-gray-400 mt-2">Add funds to your wallet instantly via bank transfer.</p>
            </div>

            {loading ? (
                <div className="space-y-6 animate-pulse">
                    <div className="h-40 bg-white/5 rounded-2xl"></div>
                    <div className="h-64 bg-white/5 rounded-2xl"></div>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <>
                    {/* Current Balance Card */}
                    <div className="glass-card p-8 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <p className="text-green-400 font-medium mb-2 relative z-10 flex items-center gap-2">
                            <Wallet className="w-5 h-5" />
                            Current Balance
                        </p>
                        <h2 className="text-5xl font-bold text-white relative z-10 tracking-tight">
                            {balance !== null ? formatCurrency(balance) : '₦0.00'}
                        </h2>
                    </div>

                    {/* Virtual Account Card */}
                    <div className="glass-card p-8 rounded-2xl border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
                                <CreditCard className="w-6 h-6" />
                                Fund Wallet with Virtual Account
                            </h3>
                            <div className="h-px w-full bg-white/10 mt-4"></div>
                        </div>

                        <div className="space-y-6">
                            <p className="text-gray-300">
                                Transfer funds to the following virtual account to automatically update your wallet balance:
                            </p>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Account Name</p>
                                    <p className="text-lg font-semibold text-white">{account?.accountName}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Bank Name</p>
                                    <p className="text-lg font-semibold text-white uppercase">{account?.bankName}</p>
                                </div>
                            </div>

                            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                <p className="text-sm text-gray-500 mb-2">Account Number</p>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xl sm:text-3xl font-mono font-bold text-white tracking-wider">
                                        {account?.accountNumber}
                                    </span>
                                    <button
                                        onClick={() => account && copyToClipboard(account.accountNumber)}
                                        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-black text-sm sm:text-base font-semibold rounded-lg hover:bg-gray-200 transition-colors active:scale-95 shrink-0"
                                    >
                                        <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                                        Copy
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-indigo-200 text-sm">
                                        Funds paid to this virtual account are <span className="font-semibold text-white">automatically credited</span> to your wallet instantly.
                                        Please ensure you send the exact amount you wish to fund.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
