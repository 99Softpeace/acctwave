'use client';

import { useState, useEffect } from 'react';
import { Users, ShoppingBag, TrendingUp, Clock, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                const data = await res.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch admin stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const cards = [
        { name: 'Total Revenue', value: `₦${stats?.totalRevenue?.toLocaleString() || '0'}`, icon: TrendingUp, color: 'text-green-500 bg-green-500/10' },
        { name: 'Total Users', value: stats?.totalUsers || '0', icon: Users, color: 'text-blue-500 bg-blue-500/10' },
        { name: 'Total Orders', value: stats?.totalOrders || '0', icon: ShoppingBag, color: 'text-purple-500 bg-purple-500/10' },
        { name: 'Pending Orders', value: stats?.pendingOrders || '0', icon: Clock, color: 'text-yellow-500 bg-yellow-500/10' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-gray-400">System overview and statistics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <div key={card.name} className="glass-card p-6 rounded-2xl border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${card.color}`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{card.value}</h3>
                        <p className="text-sm text-gray-400">{card.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
