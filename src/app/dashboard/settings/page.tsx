'use client';

import { useState, useEffect } from 'react';
import { Lock, Save, User, Mail, Shield, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
    const { data: session, update } = useSession();

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Profile State
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    useEffect(() => {
        if (session?.user?.name) {
            setName(session.user.name);
        }
        if ((session?.user as any)?.phoneNumber) {
            setPhoneNumber((session?.user as any)?.phoneNumber);
        }
    }, [session]);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setPasswordLoading(true);
        try {
            const res = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Password updated successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(data.error || 'Failed to update password');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);

        try {
            const res = await fetch('/api/user/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phoneNumber }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Profile updated successfully');
                await update({ name, phoneNumber }); // Update session
            } else {
                toast.error(data.error || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setProfileLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
                <p className="text-gray-400">Manage your profile and security preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Navigation/Profile Summary */}
                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold mb-4 uppercase">
                            {session?.user?.name?.charAt(0) || 'U'}
                        </div>
                        <h2 className="text-xl font-bold text-white">{session?.user?.name || 'User'}</h2>
                        <p className="text-gray-400 text-sm">{session?.user?.email || 'email@example.com'}</p>
                        <div className="mt-4 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                            Verified Account
                        </div>
                    </div>

                    <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-2">
                        <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 text-primary font-medium transition-colors">
                            <Shield className="w-5 h-5" />
                            Security
                        </button>
                        {/* 
                        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                            <User className="w-5 h-5" />
                            Profile Details
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                            <Mail className="w-5 h-5" />
                            Email Preferences
                        </button>
                        */}
                    </div>
                </div>

                {/* Right Column: Forms */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Profile Details */}
                    <div className="glass-card p-8 rounded-2xl border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Profile Details
                        </h3>

                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="Enter your phone number"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={session?.user?.email || ''}
                                    disabled
                                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={profileLoading}
                                    className="px-6 py-3 bg-primary hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-lg shadow-primary/25 transition-all flex items-center gap-2"
                                >
                                    {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password */}
                    <div className="glass-card p-8 rounded-2xl border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-primary" />
                            Change Password
                        </h3>

                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="px-6 py-3 bg-primary hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-lg shadow-primary/25 transition-all flex items-center gap-2"
                                >
                                    {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
