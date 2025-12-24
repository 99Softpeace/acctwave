'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCircle2, Users, DollarSign, Wallet, ArrowUpRight, Trophy, Gift, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReferralsPage() {
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/user/referrals');
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                } else {
                    toast.error('Failed to load referral data');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const referralLink = data?.referralCode
        ? `https://www.acctwave.com/signup?ref=${data.referralCode}`
        : 'Loading...';

    const copyToClipboard = () => {
        if (!data?.referralCode) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        toast.success('Referral link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const formatNaira = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    const handleWithdraw = async () => {
        if (!data?.referralBalance || data.referralBalance < 1000) {
            toast.error('Minimum withdrawal is ₦1,000');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/user/referrals/withdraw', { method: 'POST' });
            const json = await res.json();

            if (res.ok) {
                toast.success('Earnings transferred to wallet!');
                // Refresh data
                const refresh = await fetch('/api/user/referrals');
                const newData = await refresh.json();
                setData(newData);
            } else {
                toast.error(json.message || 'Withdrawal failed');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Refer & Earn</h1>
                <p className="text-gray-400">Invite friends and earn 2% commission on every deposit they make forever.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Available Commission Card (Highlighted) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 border border-yellow-500/20 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet className="w-16 h-16 text-yellow-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-yellow-500 font-medium mb-1">Available Commission</p>
                        <h2 className="text-3xl font-bold text-white mb-4">{formatNaira(data?.referralBalance || 0)}</h2>
                        <button
                            onClick={handleWithdraw}
                            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-2"
                        >
                            Withdraw <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>

                {/* Total Earnings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl bg-[#131B2C] border border-white/5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-500/10 rounded-xl">
                            <DollarSign className="w-6 h-6 text-green-500" />
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-green-500/10 text-green-500 rounded-lg">Lifetime</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Total Earnings</p>
                    <h2 className="text-2xl font-bold text-white">{formatNaira(data?.totalEarnings || 0)}</h2>
                </motion.div>

                {/* Total Referrals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-[#131B2C] border border-white/5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <Users className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Total Referrals</p>
                    <h2 className="text-2xl font-bold text-white">{data?.totalReferrals || 0}</h2>
                </motion.div>

                {/* Active Referrals */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-2xl bg-[#131B2C] border border-white/5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <Trophy className="w-6 h-6 text-purple-500" />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">Active Users</p>
                    <h2 className="text-2xl font-bold text-white">{data?.activeReferrals || 0}</h2>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Invite Link */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 p-6 rounded-2xl bg-[#131B2C] border border-white/5"
                >
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-yellow-500" />
                        Your Affiliate Link
                    </h3>

                    <div className="bg-[#080B1A] p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4 items-center mb-6">
                        <code className="text-gray-300 font-mono text-sm flex-grow truncate w-full">
                            {referralLink}
                        </code>
                        <button
                            onClick={copyToClipboard}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all w-full md:w-auto justify-center ${copied
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                : 'bg-primary text-white hover:bg-primary/90'
                                }`}
                        >
                            {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold mb-3">1</div>
                            <h4 className="text-white font-medium mb-1">Share Link</h4>
                            <p className="text-xs text-gray-400">Send your unique link to friends or post on social media.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold mb-3">2</div>
                            <h4 className="text-white font-medium mb-1">They Register</h4>
                            <p className="text-xs text-gray-400">They sign up and fund their wallet to start trading.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold mb-3">3</div>
                            <h4 className="text-white font-medium mb-1">You Earn</h4>
                            <p className="text-xs text-gray-400">Get 2% commission instantly on every deposit they make.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Right: Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 rounded-2xl bg-[#131B2C] border border-white/5"
                >
                    <h3 className="text-xl font-bold text-white mb-6">Recent Recruits</h3>
                    <div className="space-y-4">
                        {data?.referrals && data.referrals.length > 0 ? (
                            data.referrals.map((ref: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm">
                                            {ref.user.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm text-white font-medium truncate w-24 md:w-32">{ref.user}</p>
                                            <p className="text-xs text-gray-400">{ref.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-green-400">{ref.earned}</p>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                No referrals yet. Share your link!
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
