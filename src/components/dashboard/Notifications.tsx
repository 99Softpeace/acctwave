'use client';

import { useState } from 'react';
import { X, Bell, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info';
    time: string;
    read: boolean;
}

interface NotificationsProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Notifications({ isOpen, onClose }: NotificationsProps) {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            title: 'Order Completed',
            message: 'Your order #ORD-7829 for Instagram Followers has been completed successfully.',
            type: 'success',
            time: '2 mins ago',
            read: false,
        },
        {
            id: '2',
            title: 'System Maintenance',
            message: 'Scheduled maintenance on Saturday, 10 PM - 12 AM.',
            type: 'warning',
            time: '1 hour ago',
            read: false,
        },
        {
            id: '3',
            title: 'New Feature Added',
            message: 'You can now purchase virtual numbers directly from your dashboard!',
            type: 'info',
            time: '3 hours ago',
            read: true,
        },
        {
            id: '4',
            title: 'Welcome Bonus',
            message: 'You received a 15% bonus on your recent deposit.',
            type: 'success',
            time: '1 day ago',
            read: true,
        },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                    />

                    {/* Drawer/Modal */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full md:w-96 bg-[#080B1A] border-l border-white/10 z-50 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#080B1A]/50 backdrop-blur-xl sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Bell className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white">Notifications</h2>
                                    <p className="text-xs text-gray-400">
                                        {unreadCount > 0 ? `You have ${unreadCount} unread messages` : 'No new notifications'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 rounded-xl border transition-all ${notification.read
                                        ? 'bg-white/5 border-white/5 opacity-70'
                                        : 'bg-white/10 border-primary/20 shadow-lg shadow-primary/5'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 p-1.5 rounded-full ${notification.read ? 'bg-white/5' : 'bg-black/20'}`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className={`font-medium text-sm ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-[10px] text-gray-500 flex items-center gap-1 whitespace-nowrap">
                                                    <Clock className="w-3 h-3" />
                                                    {notification.time}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 leading-relaxed">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 bg-[#080B1A]/50 backdrop-blur-xl">
                            <button
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0}
                                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-300 transition-colors border border-white/5"
                            >
                                Mark all as read
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
