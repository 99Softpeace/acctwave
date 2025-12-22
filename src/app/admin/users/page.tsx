'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, User, Calendar, Shield, Wallet, X, CheckCircle, Ban, AlertTriangle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'suspended'

    // Action States
    const [fundModalOpen, setFundModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [fundAmount, setFundAmount] = useState('');
    const [actionLoading, setActionLoading] = useState<string | boolean | null>(null);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        title: string;
        message: string;
        action: (() => Promise<void>) | null;
        color: 'red' | 'green' | 'blue';
    }>({ open: false, title: '', message: '', action: null, color: 'blue' });

    useEffect(() => {
        fetchUsers();
    }, [page, statusFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users?page=${page}&limit=10&status=${statusFilter}`, {
                cache: 'no-store'
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const confirmAction = (title: string, message: string, color: 'red' | 'green' | 'blue', action: () => Promise<void>) => {
        setConfirmModal({ open: true, title, message, color, action });
    };

    const executeConfirmAction = async () => {
        if (!confirmModal.action) return;
        await confirmModal.action();
        setConfirmModal({ ...confirmModal, open: false, action: null });
    };

    const handlePromote = (user: any) => {
        confirmAction(
            'Promote User',
            `Are you sure you want to promote ${user.name} to Admin?`,
            'blue',
            async () => {
                setActionLoading(true);
                try {
                    const res = await fetch('/api/admin/users/promote', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user._id }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                        toast.success(data.message);
                        fetchUsers();
                    } else {
                        toast.error(data.message);
                    }
                } catch (error) {
                    toast.error('Failed to promote user');
                } finally {
                    setActionLoading(false);
                }
            }
        );
    };

    const toggleUserStatus = (userId: string, currentStatus: boolean) => {
        const action = currentStatus ? 'activate' : 'suspend';
        const color = currentStatus ? 'green' : 'red';

        confirmAction(
            `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
            `Are you sure you want to ${action} this user?`,
            color,
            async () => {
                setActionLoading(userId);
                try {
                    const res = await fetch('/api/admin/users/status', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId, isSuspended: !currentStatus })
                    });

                    if (res.ok) {
                        toast.success(`User ${currentStatus ? 'activated' : 'suspended'} successfully`);
                        // Force reload to ensure visuals match server truth
                        window.location.reload();
                    } else {
                        toast.error('Failed to update status');
                    }
                } catch (error) {
                    console.error('Failed to update user status');
                    toast.error('Error updating status');
                } finally {
                    setActionLoading(null);
                }
            }
        );
    };

    const openFundModal = (user: any) => {
        setSelectedUser(user);
        setFundAmount('');
        setFundModalOpen(true);
    };

    const handleFund = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !fundAmount) return;

        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/users/fund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: selectedUser._id, amount: parseFloat(fundAmount) }),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(data.message);
                setFundModalOpen(false);
                fetchUsers();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to fund user');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-8 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
                    <p className="text-gray-400">View and manage registered users.</p>
                </div>

                <div className="flex gap-4">
                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2 text-sm text-white focus:border-primary focus:outline-none cursor-pointer hover:bg-white/10 transition-colors"
                        >
                            <option value="all">All Users</option>
                            <option value="active">Active Only</option>
                            <option value="suspended">Suspended</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
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
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Phone Number</th>
                                <th className="px-6 py-4 font-medium">Balance</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-white/5 transition-colors text-sm text-gray-300">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${user.isSuspended ? 'bg-red-500/20 text-red-500' : 'bg-primary/20 text-primary'}`}>
                                                    {user.name[0]}
                                                </div>
                                                <span className="font-medium text-white">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4 text-gray-400">{user.phoneNumber || '-'}</td>
                                        <td className="px-6 py-4 font-bold text-green-400">₦{user.balance.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            {user.isSuspended ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 uppercase tracking-wider">
                                                    <Ban className="w-4 h-4" /> SUSPENDED
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30 uppercase tracking-wider">
                                                    <CheckCircle className="w-4 h-4" /> ACTIVE
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openFundModal(user)}
                                                    className="p-2 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors"
                                                    title="Fund Wallet"
                                                >
                                                    <Wallet className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleUserStatus(user._id, user.isSuspended)}
                                                    disabled={actionLoading === user._id}
                                                    className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold ${user.isSuspended
                                                        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
                                                        : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                                        }`}
                                                    title={user.isSuspended ? "Activate User" : "Suspend User"}
                                                >
                                                    {actionLoading === user._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : user.isSuspended ? (
                                                        <>
                                                            <CheckCircle className="w-4 h-4" /> UNBAN
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Ban className="w-4 h-4" /> BAN
                                                        </>
                                                    )}
                                                </button>
                                                {user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handlePromote(user)}
                                                        disabled={actionLoading === true}
                                                        className="p-2 hover:bg-purple-500/10 text-purple-400 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Promote to Admin"
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
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

            {/* Fund Modal */}
            {fundModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0B1120] border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setFundModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-1">Fund Wallet</h2>
                        <p className="text-sm text-gray-400 mb-6">Add funds to {selectedUser?.name}'s wallet.</p>

                        <form onSubmit={handleFund} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Amount (₦)</label>
                                <input
                                    type="number"
                                    value={fundAmount}
                                    onChange={(e) => setFundAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                                    required
                                    min="1"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={actionLoading === true}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                {actionLoading === true ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                Confirm Deposit
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.open && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-[#0B1120] border border-white/10 rounded-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in duration-200">
                        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${confirmModal.color === 'red' ? 'bg-red-500/10 text-red-500' :
                            confirmModal.color === 'green' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                            }`}>
                            {confirmModal.color === 'red' ? <AlertTriangle className="w-6 h-6" /> :
                                confirmModal.color === 'green' ? <CheckCircle className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                        </div>

                        <h3 className="text-lg font-bold text-white text-center mb-2">{confirmModal.title}</h3>
                        <p className="text-sm text-gray-400 text-center mb-6">{confirmModal.message}</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal({ ...confirmModal, open: false })}
                                className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeConfirmAction}
                                className={`flex-1 py-2.5 rounded-xl text-white font-medium transition-opacity hover:opacity-90 ${confirmModal.color === 'red' ? 'bg-red-500' :
                                    confirmModal.color === 'green' ? 'bg-green-500' : 'bg-blue-600'
                                    }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
