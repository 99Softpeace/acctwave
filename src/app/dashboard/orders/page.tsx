'use client';

import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, Loader2, ExternalLink, Copy, Smartphone, QrCode, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface Order {
    _id: string;
    type?: 'boost' | 'rental' | 'esim';
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
    // eSIM specific
    qr_code?: string;
    activation_code?: string;
    smdp_address?: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEsim, setSelectedEsim] = useState<Order | null>(null);

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
        <div className="space-y-8 relative">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Orders</h1>
                <p className="text-gray-400">Track your purchases and services</p>
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
                                    <div className={`p-3 rounded-xl mt-1 ${order.type === 'esim' ? 'bg-purple-500/10' : 'bg-primary/10'
                                        }`}>
                                        {order.type === 'esim' ? (
                                            <Smartphone className="w-6 h-6 text-purple-500" />
                                        ) : (
                                            <Package className="w-6 h-6 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">
                                            {order.service_name.replace(' (DaisySMS)', '')}
                                        </h3>

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
                                        ) : order.type === 'esim' ? (
                                            <div className="mb-2">
                                                <button
                                                    onClick={() => setSelectedEsim(order)}
                                                    className="text-xs flex items-center gap-1 bg-purple-500/10 text-purple-400 px-2 py-1 rounded hover:bg-purple-500/20 transition-colors"
                                                >
                                                    <QrCode className="w-3 h-3" />
                                                    View Activation Details
                                                </button>
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
                                            {order.type === 'rental' ? 'Expires' : order.type === 'esim' ? 'Type' : 'Quantity'}
                                        </div>
                                        <div className="font-bold text-white">
                                            {order.type === 'rental' && order.expiresAt
                                                ? format(new Date(order.expiresAt), 'h:mm a')
                                                : order.type === 'esim' ? 'Data Plan'
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

            {/* eSIM Details Modal */}
            {selectedEsim && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">eSIM Activation</h3>
                            <button
                                onClick={() => setSelectedEsim(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 flex flex-col items-center text-center">
                            {selectedEsim.qr_code && (
                                <div className="bg-white p-4 rounded-xl shadow-lg">
                                    <img src={selectedEsim.qr_code} alt="eSIM QR Code" className="w-48 h-48" />
                                </div>
                            )}

                            <div className="w-full space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Activation Code</label>
                                    <button
                                        onClick={() => copyToClipboard(selectedEsim.activation_code || '')}
                                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-sm text-white hover:bg-white/5 transition-colors flex items-center justify-between group"
                                    >
                                        <span className="truncate">{selectedEsim.activation_code || 'N/A'}</span>
                                        <Copy className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                    </button>
                                </div>

                                {selectedEsim.smdp_address && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">SM-DP+ Address</label>
                                        <button
                                            onClick={() => copyToClipboard(selectedEsim.smdp_address || '')}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-sm text-white hover:bg-white/5 transition-colors flex items-center justify-between group"
                                        >
                                            <span className="truncate">{selectedEsim.smdp_address}</span>
                                            <Copy className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-gray-400">
                                Scan the QR code or manually enter the details in your device settings to activate your eSIM.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
