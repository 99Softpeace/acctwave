'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, ArrowLeft, User, Shield } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

import { useParams } from 'next/navigation';

export default function TicketDetailsPage() {
    const params = useParams();
    const id = params?.id as string;
    const { data: session } = useSession();
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchTicket = async () => {
        try {
            const res = await fetch(`/api/tickets/${id}`);
            const data = await res.json();
            if (data.success) {
                setTicket(data.data);
            } else {
                toast.error('Ticket not found');
            }
        } catch (error) {
            console.error('Failed to fetch ticket', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ticket?.messages]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        setSending(true);
        try {
            const res = await fetch(`/api/tickets/${id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: replyMessage }),
            });

            const data = await res.json();

            if (data.success) {
                setTicket(data.data);
                setReplyMessage('');
            } else {
                toast.error(data.error || 'Failed to send reply');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return <div className="text-center text-gray-400 py-12">Loading ticket...</div>;
    }

    if (!ticket) {
        return <div className="text-center text-gray-400 py-12">Ticket not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/tickets" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-3">
                            {ticket.subject}
                            <span className={`text-xs px-2 py-1 rounded-full border ${ticket.status === 'Open' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
                                ticket.status === 'Answered' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
                                    'text-gray-400 bg-gray-400/10 border-gray-400/20'
                                }`}>
                                {ticket.status}
                            </span>
                        </h1>
                        <p className="text-sm text-gray-400">Ticket ID: #{ticket._id.slice(-6)}</p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {ticket.messages.map((msg: any, index: number) => {
                        const isMe = msg.sender === 'user';
                        return (
                            <div key={index} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-primary/20 text-primary' : 'bg-purple-500/20 text-purple-500'
                                    }`}>
                                    {isMe ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                </div>
                                <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end flex flex-col' : ''}`}>
                                    <div className={`p-4 rounded-2xl ${isMe
                                        ? 'bg-primary text-white rounded-tr-none'
                                        : 'bg-white/10 text-gray-200 rounded-tl-none'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/5 bg-black/20">
                    <form onSubmit={handleReply} className="flex gap-4">
                        <input
                            type="text"
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder="Type your reply..."
                            className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={sending || !replyMessage.trim()}
                            className="bg-primary hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-xl shadow-lg shadow-primary/25 transition-all"
                        >
                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
