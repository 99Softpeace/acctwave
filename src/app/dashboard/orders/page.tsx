'use client';

import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, Loader2, ExternalLink, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface Order {
    _id: string;
    type?: 'boost' | 'rental';
    service_name: string;
    link?: string;
    quantity?: number;
    charge: number;
    status: string;
    start_count?: number;
    remains?: number;
    createdAt: string;
    external_order_id: string;
    phone?: string;
    code?: string;
    expiresAt?: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders/history');
                const data = await res.json();
                if (data.success) {
                    setOrders(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch orders', error);
                toast.error('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Orders</h1>
                <p className="text-gray-400">Track your social media boost orders</p>
            </div>

            {orders.length === 0 ? (
                <div className="glass-card p-12 rounded-2xl border border-white/10 text-center">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-bold text-white mb-2">No Orders Yet</h3>
                    <p className="text-gray-400 mb-6">You haven't placed any orders yet.</p>
                    <a
                        href="/dashboard/new-order"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-all"
                    >
                        Boost Account Now
                    </a>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="glass-card p-6 rounded-xl border border-white/10 hover:border-primary/30 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 rounded-xl mt-1">
                                        <Package className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">{order.service_name}</h3>

                                        {/* Render based on Order Type */}
                                        {order.type === 'rental' ? (
                                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                                <span className="text-white font-mono bg-white/10 px-2 py-1 rounded">
                                                    {order.phone}
                                                </span>
                                                <button
                                                    onClick={() => copyToClipboard(order.phone || '')}
                                                    className="p-1 hover:bg-white/10 rounded"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                                {order.code && (
                                                    <span className="text-green-400 font-bold ml-2">Code: {order.code}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                                <a
                                                    href={order.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:text-primary flex items-center gap-1 truncate max-w-[200px] md:max-w-[300px]"
                                                >
                                                    {order.link}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                                <button
                                                    onClick={() => copyToClipboard(order.link || '')}
                                                    className="p-1 hover:bg-white/10 rounded"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span>ID: {order.external_order_id}</span>
                                            <span>•</span>
                                            <span>{format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 md:min-w-[300px]">
                                    <div className="text-right">
                                        <div className="text-sm text-gray-400">
                                            {order.type === 'rental' ? 'Expires' : 'Quantity'}
                                        </div>
                                        <div className="font-bold text-white">
                                            {order.type === 'rental' && order.expiresAt
                                                ? format(new Date(order.expiresAt), 'h:mm a')
                                                : order.quantity?.toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-400">Charge</div>
                                        <div className="font-bold text-white">₦{order.charge.toLocaleString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${order.status === 'Completed' || order.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                            order.status === 'Pending' || order.status === 'Processing' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                order.status === 'Canceled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            }`}>
                                            {(order.status === 'Completed' || order.status === 'Active') && <CheckCircle className="w-3 h-3" />}
                                            {order.status === 'Canceled' && <XCircle className="w-3 h-3" />}
                                            {(order.status === 'Pending' || order.status === 'Processing') && <Clock className="w-3 h-3" />}
                                            {order.status}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
