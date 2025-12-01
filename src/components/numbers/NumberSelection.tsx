'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Globe, Search, Loader2, Copy, Check } from 'lucide-react';

// Mock Data
const countries = [
    { id: 'us', name: 'United States', flag: '🇺🇸', price: 1.50 },
    { id: 'gb', name: 'United Kingdom', flag: '🇬🇧', price: 2.00 },
    { id: 'ng', name: 'Nigeria', flag: '🇳🇬', price: 0.80 },
    { id: 'ca', name: 'Canada', flag: '🇨🇦', price: 1.80 },
    { id: 'de', name: 'Germany', flag: '🇩🇪', price: 2.20 },
];

const services = [
    { id: 'whatsapp', name: 'WhatsApp', icon: '📱' },
    { id: 'telegram', name: 'Telegram', icon: '✈️' },
    { id: 'google', name: 'Google / Gmail', icon: '📧' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'twitter', name: 'Twitter / X', icon: '🐦' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
];

export default function NumberSelection() {
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);
    const [selectedService, setSelectedService] = useState(services[0]);
    const [status, setStatus] = useState<'idle' | 'generating' | 'ready'>('idle');
    const [generatedNumber, setGeneratedNumber] = useState("");
    const [copied, setCopied] = useState(false);

    const handleGenerate = () => {
        setStatus('generating');
        setTimeout(() => {
            setGeneratedNumber(`+${selectedCountry.id === 'us' ? '1' : '234'} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`);
            setStatus('ready');
        }, 2000);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Generate Number</h2>
                    <p className="text-gray-400 text-sm">Select country and service to get started</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Country Selection */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Select Country
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {countries.map((country) => (
                            <button
                                key={country.id}
                                onClick={() => setSelectedCountry(country)}
                                className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${selectedCountry.id === country.id
                                        ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(0,122,255,0.3)]'
                                        : 'bg-[#080B1A] border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                                    }`}
                            >
                                <span className="text-2xl">{country.flag}</span>
                                <span className="text-xs font-medium">{country.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Service Selection */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Search className="w-4 h-4" /> Select Service
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {services.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => setSelectedService(service)}
                                className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${selectedService.id === service.id
                                        ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(0,122,255,0.3)]'
                                        : 'bg-[#080B1A] border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                                    }`}
                            >
                                <span className="text-xl">{service.icon}</span>
                                <span className="text-sm font-medium">{service.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cost Summary */}
                <div className="bg-[#080B1A] rounded-xl p-4 flex justify-between items-center border border-white/5">
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-sm">Estimated Cost</span>
                        <span className="text-xs text-gray-500">Valid for 20 minutes</span>
                    </div>
                    <span className="text-2xl font-bold text-white glow-text">${selectedCountry.price.toFixed(2)}</span>
                </div>

                {/* Action Button */}
                {status === 'ready' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center space-y-4"
                    >
                        <p className="text-green-400 text-sm font-medium">Number Generated Successfully!</p>
                        <div className="flex items-center justify-center gap-4">
                            <span className="text-3xl font-mono font-bold text-white tracking-wider">{generatedNumber}</span>
                            <button
                                onClick={copyToClipboard}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="text-xs text-gray-400 animate-pulse">
                            Waiting for SMS code...
                        </div>
                    </motion.div>
                ) : (
                    <button
                        onClick={handleGenerate}
                        disabled={status === 'generating'}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${status === 'generating'
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-primary hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(0,122,255,0.4)] hover:shadow-[0_0_30px_rgba(0,122,255,0.6)]'
                            }`}
                    >
                        {status === 'generating' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                            </>
                        ) : (
                            'Generate Number'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
