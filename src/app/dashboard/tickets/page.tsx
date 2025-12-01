'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function TicketsPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await fetch('/api/tickets');
                const data = await res.json();
                if (data.success) {
                    setTickets(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch tickets', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'Answered': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'Closed': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    if (loading) {
        return <div className="text-center text-gray-400 py-12">Loading tickets...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
                    <p className="text-gray-400">Get help with your orders and account.</p>
                </div>
                <Link
                    href="/dashboard/tickets/new"
                    className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Ticket
                </Link>
            </div>

            {tickets.length === 0 ? (
                <div className="glass-card p-12 rounded-2xl border border-white/5 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No tickets found</h3>
                    <p className="text-gray-400 mb-6">You haven't created any support tickets yet.</p>
                    <Link
                        href="/dashboard/tickets/new"
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors"
                    >
                        Create your first ticket
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {tickets.map((ticket) => (
                        <Link
                            key={ticket._id}
                            href={`/dashboard/tickets/${ticket._id}`}
                            className="glass-card p-6 rounded-2xl border border-white/5 hover:border-primary/50 transition-colors flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(ticket.status)}`}>
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white group-hover:text-primary transition-colors">{ticket.subject}</h3>
                                    <p className="text-sm text-gray-400">
                                        Last updated: {new Date(ticket.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
