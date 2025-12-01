'use client';

import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
    _id: string;
    amount: number;
    type: 'deposit' | 'withdrawal' | 'order';
    status: 'pending' | 'successful' | 'failed';
    reference: string;
    createdAt: string;
    description: string;
}

export default function TransactionHistory() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await fetch('/api/transactions');
                const data = await res.json();
                if (data.success) {
                    setTransactions(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch transactions', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    if (loading) {
        return <div className="text-center text-gray-400 py-4">Loading transactions...</div>;
    }

    if (transactions.length === 0) {
        return (
            <div className="text-center text-gray-400 py-8 bg-white/5 rounded-xl border border-white/10">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No transactions yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
            <div className="space-y-3">
                {transactions.map((tx) => (
                    <div
                        key={tx._id}
                        className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${tx.type === 'deposit' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                {tx.type === 'deposit' ? (
                                    <ArrowDownLeft className="w-5 h-5" />
                                ) : (
                                    <ArrowUpRight className="w-5 h-5" />
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-white">{tx.description || (tx.type === 'deposit' ? 'Wallet Deposit' : 'Order Payment')}</p>
                                <p className="text-xs text-gray-400">
                                    {format(new Date(tx.createdAt), 'MMM d, yyyy • h:mm a')}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-bold ${tx.type === 'deposit' ? 'text-green-400' : 'text-white'
                                }`}>
                                {tx.type === 'deposit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                            </p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                                {tx.status === 'successful' && <CheckCircle className="w-3 h-3 text-green-400" />}
                                {tx.status === 'failed' && <XCircle className="w-3 h-3 text-red-400" />}
                                {tx.status === 'pending' && <Clock className="w-3 h-3 text-yellow-400" />}
                                <span className={`text-xs capitalize ${tx.status === 'successful' ? 'text-green-400' :
                                        tx.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                                    }`}>
                                    {tx.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
