'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
                setIsLoading(false);
            } else {
                // Success - redirect to dashboard
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center pt-20 pb-10 px-4 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Wet Glass Container */}
                <div className="relative rounded-3xl overflow-hidden backdrop-blur-[2px] bg-transparent border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]">
                    {/* Condensation Texture */}
                    <motion.div
                        animate={{ backgroundPosition: ["0% 0%", "0% 100%"] }}
                        transition={{
                            duration: 20,
                            ease: "linear",
                            repeat: Infinity
                        }}
                        className="absolute inset-0 bg-[url('/images/water_droplets.png')] bg-cover opacity-30 mix-blend-overlay pointer-events-none z-20"
                    />

                    {/* Internal Wave Animation */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 opacity-30 pointer-events-none z-0 overflow-hidden">
                        <div className="absolute bottom-0 w-[200%] h-full animate-wave bg-gradient-to-t from-primary/40 to-transparent" />
                        <div className="absolute bottom-0 w-[200%] h-full animate-wave-slow bg-gradient-to-t from-secondary/30 to-transparent" style={{ animationDelay: '-2s' }} />
                    </div>

                    <div className="relative z-30 p-8">
                        <div className="text-center mb-8">
                            <Link href="/" className="inline-block mb-4">
                                <div className="flex items-center justify-center gap-2">
                                    <Image
                                        src="/acctwave_logo.png"
                                        alt="Acctwave"
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 drop-shadow-lg"
                                    />
                                    <span className="text-2xl font-bold text-white drop-shadow-md">Acctwave</span>
                                </div>
                            </Link>
                            <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-md">Welcome Back</h1>
                            <p className="text-gray-200 text-sm font-medium drop-shadow-sm">Sign in to continue boosting your presence.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider drop-shadow-sm">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-transparent border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider drop-shadow-sm">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-transparent border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary/90 hover:bg-primary text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(0,122,255,0.3)] hover:shadow-[0_0_30px_rgba(0,122,255,0.5)] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed backdrop-blur-sm"
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-300 text-sm font-medium drop-shadow-sm">
                                Don't have an account?{' '}
                                <Link href="/signup" className="text-primary hover:text-blue-400 font-bold transition-colors">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
