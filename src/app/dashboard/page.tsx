'use client';

import { useSession } from 'next-auth/react';
import { Wallet, ShoppingBag, TrendingUp, ArrowUpRight, Clock, CheckCircle, XCircle, Smartphone, Wifi, Tv, Zap, AppWindow, History, Bell, Eye, EyeOff, Plus, MessageSquare, Loader2, Rocket, FileText, Users, Send, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import Notifications from '@/components/dashboard/Notifications';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [showBalance, setShowBalance] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        name: "User",
        balance: 0,
        totalSpent: 0,
        activeOrders: 0,
        totalOrders: 0,
        recentOrders: [] as any[]
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/user/stats');
                const data = await res.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchStats();
        } else if (status === 'unauthenticated') {
            setLoading(false);
        }
    }, [status]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'Processing': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'Pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'Canceled': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const quickActions = [
        // Row 1
        { name: 'Boost Account', icon: <Rocket className="w-6 h-6 text-blue-500" />, href: '/dashboard/boost-account', color: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
        { name: 'Foreign Number', icon: <MessageSquare className="w-6 h-6 text-orange-500" />, href: '/dashboard/virtual-numbers', color: 'bg-orange-500/10', borderColor: 'border-orange-500/20' },
        { name: 'Rent Number', icon: <Clock className="w-6 h-6 text-teal-500" />, href: '/dashboard/rent-number', color: 'bg-teal-500/10', borderColor: 'border-teal-500/20' },
        { name: 'Buy Log', icon: <FileText className="w-6 h-6 text-yellow-500" />, href: '/dashboard/modded-apps', color: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' },
        // Row 2
        { name: 'Airtime', icon: <Smartphone className="w-6 h-6 text-green-500" />, href: '/dashboard/vtu', color: 'bg-green-500/10', borderColor: 'border-green-500/20' },
        { name: 'Data', icon: <Wifi className="w-6 h-6 text-purple-500" />, href: '/dashboard/vtu', color: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
        { name: 'eSIM', icon: <Smartphone className="w-6 h-6 text-pink-500" />, href: '/dashboard/esim', color: 'bg-pink-500/10', borderColor: 'border-pink-500/20' },
    ];

    // Helper to render a quick action item
    const renderQuickAction = (action: any) => (
        <Link key={action.name} href={action.href} className="flex flex-col items-center gap-3 group">
            <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center group-hover:scale-105 transition-transform border ${action.borderColor}`}>
                {action.icon}
            </div>
            <span className="text-[10px] text-gray-400 font-medium text-center leading-tight">{action.name}</span>
        </Link>
    );

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="h-8 w-48 bg-white/5 rounded-lg"></div>
                    <div className="h-10 w-32 bg-white/5 rounded-xl"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-40 bg-white/5 rounded-2xl border border-white/5"></div>
                    ))}
                </div>
                <div className="h-64 bg-white/5 rounded-2xl border border-white/5"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

            {/* MOBILE VIEW */}
            <div className="md:hidden space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {stats.name[0]}
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Welcome back,</p>
                            <h2 className="font-bold text-white">{stats.name}</h2>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowNotifications(true)}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 relative"
                    >
                        <Bell className="w-5 h-5 text-gray-300" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#080B1A]" />
                    </button>
                </div>

                {/* Balance Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-6 shadow-lg shadow-primary/20">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet className="w-32 h-32 text-white" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-blue-100 text-sm font-medium">Total Balance</span>
                            <button onClick={() => setShowBalance(!showBalance)} className="text-blue-100 hover:text-white">
                                {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-6">
                            {showBalance ? `₦${stats.balance.toLocaleString()}` : '****'}
                        </h3>
                        <div className="flex gap-3">
                            <Link href="/dashboard/fund-wallet" className="flex-1 bg-white text-primary py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Add Money
                            </Link>
                            <Link href="/dashboard/transactions" className="flex-1 bg-white/20 text-white py-2.5 rounded-xl text-sm font-bold backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center gap-2">
                                <History className="w-4 h-4" /> History
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div>
                    <h3 className="text-white font-bold mb-4">Quick Actions</h3>
                    <div className="space-y-6">
                        {/* Row 1: 4 items */}
                        <div className="grid grid-cols-4 gap-4">
                            {quickActions.slice(0, 4).map(renderQuickAction)}
                        </div>
                        {/* Row 2: 3 items */}
                        <div className="grid grid-cols-4 gap-4">
                            {quickActions.slice(4, 7).map(renderQuickAction)}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-card p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold">Recent Activity</h3>
                        <Link href="/dashboard/orders" className="text-xs text-primary">View All</Link>
                    </div>
                    <div className="space-y-3">
                        {stats.recentOrders.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-4">No recent activity</p>
                        ) : (
                            stats.recentOrders.slice(0, 3).map((order: any) => (
                                <div key={order.id} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(order.status)}`}>
                                            <ShoppingBag className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{order.service}</p>
                                            <p className="text-xs text-gray-500">{order.date}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Join Community Banner (Mobile) */}
                {/* Netflix Log Banner (Mobile) */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-900/40 to-red-950/40 border border-red-500/20 p-5 group mb-6">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all duration-500"></div>

                    <div className="relative flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/20">
                                <Tv className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Get Netflix Log</h3>
                                <p className="text-xs text-red-200/80">Premium accounts available</p>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/modded-apps"
                            className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl border border-white/10 transition-colors"
                        >
                            <ArrowUpRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                {/* Join Community Banner (Mobile) */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/20 p-5 group">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-500/20 rounded-full blur-3xl group-hover:bg-green-500/30 transition-all duration-500"></div>

                    <div className="relative flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/20">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Join VIP Community</h3>
                                <p className="text-xs text-green-200/80">Get exclusive updates & tips</p>
                            </div>
                        </div>
                        <Link
                            href="https://chat.whatsapp.com/placeholder"
                            target="_blank"
                            className="animate-shine bg-gradient-to-r from-white via-green-100 to-white text-green-700 p-2.5 rounded-xl shadow-lg shadow-black/20 hover:scale-105 transition-transform active:scale-95 border border-green-100"
                        >
                            <MessageCircle className="w-5 h-5 fill-current" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden md:block space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">
                            Dashboard Overview
                        </h1>
                        <p className="text-gray-400">Welcome back, {stats.name}. Here's what's happening today.</p>
                    </div>
                    <Link href="/dashboard/orders" className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary/25 flex items-center gap-2 w-fit">
                        <ShoppingBag className="w-5 h-5" />
                        My Orders
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Balance */}
                    <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Wallet className="w-16 h-16 text-primary" />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <span className="text-gray-400 font-medium">Available Balance</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">₦{stats.balance.toLocaleString()}</h3>
                        <div className="flex items-center gap-2 text-sm text-green-400">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>+15% deposit bonus</span>
                        </div>
                    </div>

                    {/* Total Spent */}
                    <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="w-16 h-16 text-purple-500" />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <span className="text-gray-400 font-medium">Total Spent</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">₦{stats.totalSpent.toLocaleString()}</h3>
                        <p className="text-sm text-gray-500">Lifetime expenditure</p>
                    </div>

                    {/* Active Orders */}
                    <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Clock className="w-16 h-16 text-yellow-500" />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                                <Clock className="w-6 h-6" />
                            </div>
                            <span className="text-gray-400 font-medium">Active Orders</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{stats.activeOrders}</h3>
                        <p className="text-sm text-gray-500">Currently processing</p>
                    </div>

                    {/* Total Orders */}
                    <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <CheckCircle className="w-16 h-16 text-green-500" />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <span className="text-gray-400 font-medium">Total Orders</span>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{stats.totalOrders}</h3>
                        <p className="text-sm text-gray-500">Lifetime orders</p>
                    </div>
                </div>

                {/* Recent Orders Table */}
                <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">Recent Orders</h3>
                        <Link href="/dashboard/orders" className="text-sm text-primary hover:text-blue-400 transition-colors">
                            View All
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-medium">ID</th>
                                    <th className="px-6 py-4 font-medium">Service</th>
                                    <th className="px-6 py-4 font-medium">Link</th>
                                    <th className="px-6 py-4 font-medium">Quantity</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats.recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                            No recent orders found
                                        </td>
                                    </tr>
                                ) : (
                                    stats.recentOrders.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-white/5 transition-colors text-sm text-gray-300">
                                            <td className="px-6 py-4 font-medium text-white">{order.id}</td>
                                            <td className="px-6 py-4">{order.service}</td>
                                            <td className="px-6 py-4 truncate max-w-[150px]">{order.link}</td>
                                            <td className="px-6 py-4">{order.quantity}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{order.date}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Join Community Banner (Desktop) */}
                {/* Netflix Log Banner (Desktop) */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-900/40 via-red-950/40 to-black border border-red-500/20 p-8 group mb-8">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all duration-500"></div>

                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl shadow-red-500/20 group-hover:scale-110 transition-transform duration-300">
                                <Tv className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1">Get Netflix Log</h3>
                                <p className="text-red-200/80 max-w-md">
                                    Access premium Netflix accounts instantly. High quality, secure, and ready to use.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/modded-apps"
                            className="group/btn relative overflow-hidden bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold transition-all border border-white/10 hover:border-white/20"
                        >
                            <div className="relative flex items-center gap-3">
                                <Tv className="w-5 h-5" />
                                <span>Get Access Now</span>
                                <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Join Community Banner (Desktop) */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-900/40 via-emerald-900/40 to-black border border-green-500/20 p-8 group">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all duration-500"></div>

                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl shadow-green-500/20 group-hover:scale-110 transition-transform duration-300">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1">Join our VIP Community</h3>
                                <p className="text-green-200/80 max-w-md">
                                    Connect with top earners, get exclusive updates, and receive 24/7 priority support directly on WhatsApp.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="https://chat.whatsapp.com/placeholder"
                            target="_blank"
                            className="group/btn relative overflow-hidden animate-shine bg-gradient-to-r from-white via-green-100 to-white text-green-800 px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-green-900/20 hover:shadow-green-500/20 hover:-translate-y-1 border border-green-200"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-100 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                            <div className="relative flex items-center gap-3">
                                <MessageCircle className="w-5 h-5 fill-current" />
                                <span>Join WhatsApp Now</span>
                                <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
