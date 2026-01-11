'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Filter, ExternalLink } from 'lucide-react';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/orders?page=${page}&limit=10&status=${statusFilter}`);
            const data = await res.json();
            if (data.success) {
                setOrders(data.data);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'Pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'Processing': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'In progress': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            case 'Canceled': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Order Management</h1>
                    <p className="text-gray-400">View and manage user orders.</p>
                </div>

                <div className="flex gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-primary focus:outline-none"
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="In progress">In progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Canceled">Canceled</option>
                    </select>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-primary focus:outline-none w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium">ID</th>
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Service</th>
                                <th className="px-6 py-4 font-medium">Link</th>
                                <th className="px-6 py-4 font-medium">Quantity</th>
                                <th className="px-6 py-4 font-medium">Charge</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-white/5 transition-colors text-sm text-gray-300">
                                        <td className="px-6 py-4 font-mono text-xs">
                                            #{order.external_order_id || order._id.toString().slice(-6)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white">{order.user?.name || 'Unknown'}</span>
                                                <span className="text-xs text-gray-500">{order.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col max-w-[200px]">
                                                <span className="truncate" title={order.service_name}>{order.service_name}</span>
                                                {order.details && <span className="text-xs text-gray-500 truncate" title={order.details}>{order.details}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.link && (order.link.startsWith('http') ? (
                                                <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-blue-400 flex items-center gap-1">
                                                    Link <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 font-mono text-xs">{order.link}</span>
                                            ))}
                                            {!order.link && <span className="text-gray-600">-</span>}
                                        </td>
                                        <td className="px-6 py-4">{order.quantity}</td>
                                        <td className="px-6 py-4 font-bold text-white">₦{order.charge?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(order.createdAt).toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true
                                            })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-white/5 flex justify-between items-center">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-white"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-white"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
