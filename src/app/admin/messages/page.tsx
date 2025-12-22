'use client';

import { useState, useEffect } from 'react';
import { Send, MessageSquare, Users, History, AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminMessagesPage() {
    const [message, setMessage] = useState('');
    const [title, setTitle] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [stats, setStats] = useState({ count: 0 });
    const [recipientType, setRecipientType] = useState<'all' | 'specific'>('all');
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [channels, setChannels] = useState<{ sms: boolean; email: boolean }>({ sms: true, email: false });
    const [emailContent, setEmailContent] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats/audience');
            const data = await res.json();
            if (res.ok) {
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users?limit=100'); // Fetch enough users for selection
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch users list');
        }
    };

    const handleSendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        const toastId = toast.loading('Sending broadcast...');

        try {
            let successMsg = '';

            // 1. Send Email Broadcast
            if (channels.email) {
                // Get selected emails if specific
                const targetEmails = recipientType === 'specific'
                    ? users.filter((u: any) => selectedUsers.includes(u._id)).map((u: any) => u.email)
                    : [];

                const res = await fetch('/api/admin/broadcast/email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        recipientType,
                        specificEmails: targetEmails,
                        subject: title,
                        message: emailContent
                    })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Email broadcast failed');
                successMsg += `Email sent to ${data.count} users. `;
            }

            // 2. Send SMS Broadcast (Stub)
            if (channels.sms) {
                // Placeholder for future SMS API
                console.log('SMS broadcast triggered for:', recipientType);
            }

            toast.dismiss(toastId);
            toast.success(successMsg || 'Broadcast sent successfully!', {
                duration: 5000,
                icon: '🚀'
            });

            // Reset Form
            setIsSending(false);
            setMessage('');
            setTitle('');
            setEmailContent('');
            setSelectedUsers([]);

        } catch (error: any) {
            toast.dismiss(toastId);
            setIsSending(false);
            toast.error(error.message || 'Failed to send broadcast');
        }
    };

    return (
        <div className="space-y-8 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Messaging & Broadcasts</h1>
                    <p className="text-gray-400">Send announcements and updates to user phone numbers.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Compose Broadcast */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6 rounded-2xl border border-white/5">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Send className="w-5 h-5 text-primary" />
                            Compose New Broadcast
                        </h2>

                        <form onSubmit={handleSendBroadcast} className="space-y-6">
                            {/* Recipient Selection */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-400">Recipients</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div
                                        onClick={() => setRecipientType('all')}
                                        className={`cursor-pointer p-4 rounded-xl border transition-all ${recipientType === 'all' ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${recipientType === 'all' ? 'border-primary' : 'border-gray-500'}`}>
                                                {recipientType === 'all' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">All Active Users</div>
                                                <div className="text-xs text-gray-400">Send to all {stats.count} registered users</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => {
                                            setRecipientType('specific');
                                            if (users.length === 0) fetchUsers();
                                        }}
                                        className={`cursor-pointer p-4 rounded-xl border transition-all ${recipientType === 'specific' ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${recipientType === 'specific' ? 'border-primary' : 'border-gray-500'}`}>
                                                {recipientType === 'specific' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">Specific Users</div>
                                                <div className="text-xs text-gray-400">Select manually</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* User Selection List */}
                            {recipientType === 'specific' && (
                                <div className="bg-black/20 rounded-xl border border-white/10 p-4 max-h-60 overflow-y-auto space-y-2">
                                    {users.map((user: any) => (
                                        <div
                                            key={user._id}
                                            onClick={() => {
                                                if (selectedUsers.includes(user._id)) {
                                                    setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                                                } else {
                                                    setSelectedUsers([...selectedUsers, user._id]);
                                                }
                                            }}
                                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${selectedUsers.includes(user._id) ? 'bg-primary/20 border-primary/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">{user.name}</div>
                                                    <div className="text-xs text-gray-400">{user.email}</div>
                                                </div>
                                            </div>
                                            {selectedUsers.includes(user._id) && <CheckCircle className="w-5 h-5 text-primary" />}
                                        </div>
                                    ))}
                                    {users.length === 0 && (
                                        <div className="text-center text-gray-500 py-4 text-sm">Loading users...</div>
                                    )}
                                </div>
                            )}

                            {/* Channel Selection */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-400">Channels</label>
                                <div className="flex gap-4">
                                    <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${channels.sms ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${channels.sms ? 'bg-primary border-primary' : 'border-gray-500'}`}>
                                            {channels.sms && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={channels.sms}
                                            onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                                            className="hidden"
                                        />
                                        <div className="font-bold text-white flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            SMS Broadcast
                                        </div>
                                    </label>
                                    <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${channels.email ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${channels.email ? 'bg-primary border-primary' : 'border-gray-500'}`}>
                                            {channels.email && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={channels.email}
                                            onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
                                            className="hidden"
                                        />
                                        <div className="font-bold text-white flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            Email Newsletter
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    {channels.email ? 'Subject / Title' : 'Message Title (Internal Use)'}
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={channels.email ? "e.g. Monthly Newsletter" : "e.g. Christmas Promo"}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary placeholder-gray-600"
                                />
                            </div>

                            {channels.sms && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">SMS Content</label>
                                    <div className="relative">
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Type your SMS here..."
                                            rows={4}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary placeholder-gray-600 resize-none"
                                        />
                                        <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                                            {message.length} chars
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-yellow-500/80 flex items-center gap-1.5">
                                        <AlertCircle className="w-3 h-3" />
                                        SMS charges apply per 160 chars.
                                    </p>
                                </div>
                            )}

                            {channels.email && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Content (HTML supported)</label>
                                    <textarea
                                        value={emailContent}
                                        onChange={(e) => setEmailContent(e.target.value)}
                                        placeholder="Type your email content here..."
                                        rows={8}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary placeholder-gray-600 resize-none font-mono text-sm"
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSending || (!channels.sms && !channels.email) || (channels.sms && !message) || (channels.email && !emailContent) || (recipientType === 'specific' && selectedUsers.length === 0)}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(0,122,255,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Broadcast {recipientType === 'specific' && selectedUsers.length > 0 && `(${selectedUsers.length})`}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Stats & History */}
                <div className="space-y-6">
                    {/* Audience Stats */}
                    <div className="glass-card p-6 rounded-2xl border border-white/5">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-green-400" />
                            Target Audience
                        </h3>
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-4xl font-bold text-white">
                                {recipientType === 'all' ? stats.count : selectedUsers.length}
                            </span>
                            <span className="text-sm text-gray-400 mb-1">recipients selected</span>
                        </div>
                        <p className="text-xs text-gray-500">
                            {recipientType === 'all'
                                ? 'Users with valid phone numbers in database.'
                                : 'Manually selected users.'}
                        </p>
                    </div>

                    {/* Recent History Placeholder */}
                    <div className="glass-card p-6 rounded-2xl border border-white/5 opacity-60 pointer-events-none">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <History className="w-4 h-4 text-purple-400" />
                            Recent History
                        </h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
                                    <div className="h-3 w-full bg-white/5 rounded"></div>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-4">No broadcasts sent yet.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
