'use client';

import TransactionHistory from '@/components/dashboard/TransactionHistory';

export default function TransactionsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
                <p className="text-gray-400">View your wallet funding history and transactions.</p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10">
                <TransactionHistory />
            </div>
        </div>
    );
}
