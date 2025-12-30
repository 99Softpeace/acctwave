'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Globe, Clock, CheckCircle, Calendar, Loader2, AlertCircle, Copy, Zap, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import InsufficientBalanceModal from '@/components/modals/InsufficientBalanceModal';

interface Service {
    id: string;
    name: string;
    price: number;
}

interface Rental {
    id: string;
    phone: string;
    service: string;
    status: 'active' | 'ready' | 'canceled' | 'completed';
    code?: string;
    expiresAt: number;
}

const DURATIONS = [
    { label: '1 Day', value: 1, unit: 'Days' },
    { label: '1 Week', value: 1, unit: 'Weeks' },
    { label: '1 Month', value: 1, unit: 'Months' }
];

export default function RentNumberPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [renting, setRenting] = useState(false);
    const [selectedService, setSelectedService] = useState<string>('');
    const [activeRentals, setActiveRentals] = useState<Rental[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // New State for Rental Options
    const [selectedDuration, setSelectedDuration] = useState(DURATIONS[0]);
    const [areaCode, setAreaCode] = useState('');
    const [showBalanceModal, setShowBalanceModal] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    // Poll for status updates on active rentals
    useEffect(() => {
        if (activeRentals.length === 0) return;

        const interval = setInterval(async () => {
            const updatedRentals = await Promise.all(activeRentals.map(async (rental) => {
                if (rental.status !== 'active') return rental;

                try {
                    const res = await fetch(`/api/rent-number/status?id=${rental.id}`);
                    const data = await res.json();

                    if (data.success && data.data.status === 'completed') {
                        toast.success(`SMS Received for ${rental.service}!`);
                        return { ...rental, status: 'completed', code: data.data.code };
                    }
                    // Update messages if available
                    if (data.success && data.data.messages) {
                        return { ...rental, messages: data.data.messages };
                    }
                } catch (e) {
                    console.error('Polling error', e);
                }
                return rental;
            }));

            // Only update state if something changed to avoid re-renders
            if (JSON.stringify(updatedRentals) !== JSON.stringify(activeRentals)) {
                setActiveRentals(updatedRentals as Rental[]);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [activeRentals]);

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/rent-number/services');
            const data = await res.json();
            if (data.success) {
                setServices(data.data);
                if (data.data.length > 0) setSelectedService(data.data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch services', error);
            toast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const handleRent = async () => {
        if (!selectedService) return;
        setRenting(true);

        try {
            const service = services.find(s => s.id === selectedService);
            if (!service) return;

            const res = await fetch('/api/rent-number/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service: service.id,
                    duration: selectedDuration.value || 1, // Default to 1 if empty
                    unit: selectedDuration.unit,
                    areaCode: areaCode || undefined
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Number rented successfully!');
                // Ensure we map the response correctly if needed, though data.data should match Rental interface
                setActiveRentals(prev => [data.data, ...prev]);
            } else {
                if (data.error === 'Insufficient balance' || data.message === 'Insufficient balance') {
                    setShowBalanceModal(true);
                } else {
                    toast.error(data.error || 'Failed to rent number');
                }
            }
        } catch (error) {
            console.error('Rent error', error);
            toast.error('An error occurred');
        } finally {
            setRenting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="max-w-xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Rent USA Virtual Number</h1>
                <p className="text-gray-400">Get a dedicated phone number for long-term SMS verification.</p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/5 shadow-xl space-y-6">

                {/* Service Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Select a Service</label>
                    {loading ? (
                        <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
                    ) : (
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full bg-black/20 border border-white/10 text-white text-lg rounded-xl px-4 py-3 flex items-center justify-between hover:border-primary/50 transition-colors"
                            >
                                <span className={selectedService ? 'text-white' : 'text-gray-400'}>
                                    {selectedService
                                        ? services.find(s => s.id === selectedService)?.name
                                        : 'Select a service...'}
                                </span>
                                <Globe className="w-5 h-5 text-gray-400" />
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                                    <div className="absolute z-50 w-full mt-2 bg-[#1a1b1e] border border-white/10 rounded-xl shadow-2xl max-h-80 overflow-hidden flex flex-col">
                                        <div className="p-2 border-b border-white/5 sticky top-0 bg-[#1a1b1e]">
                                            <input
                                                type="text"
                                                placeholder="Search services..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary placeholder:text-gray-600"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
                                            {services
                                                .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                .slice(0, 50)
                                                .map((service) => (
                                                    <button
                                                        key={service.id}
                                                        onClick={() => {
                                                            setSelectedService(service.id);
                                                            setIsDropdownOpen(false);
                                                            setSearchQuery('');
                                                        }}
                                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between group ${selectedService === service.id
                                                            ? 'bg-primary/20 text-white'
                                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                            }`}
                                                    >
                                                        <span>{service.name}</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${selectedService === service.id
                                                            ? 'bg-primary/20 text-primary'
                                                            : 'bg-white/5 text-gray-500 group-hover:bg-white/10'
                                                            }`}>
                                                            ₦{service.price.toLocaleString()}
                                                        </span>
                                                    </button>
                                                ))}
                                            {services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                                <div className="p-4 text-center text-gray-500 text-sm">
                                                    No services found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Duration Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Duration</label>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <input
                                type="number"
                                min="1"
                                value={selectedDuration.value || ''}
                                onChange={(e) => setSelectedDuration({ ...selectedDuration, value: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })}
                                className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                            />
                            <div className="absolute right-3 top-3.5 text-gray-500 text-sm pointer-events-none">
                                {selectedDuration.value === 1 ? selectedDuration.unit.slice(0, -1) : selectedDuration.unit}
                            </div>
                        </div>
                        <div className="w-1/3">
                            <select
                                value={selectedDuration.unit}
                                onChange={(e) => setSelectedDuration({ ...selectedDuration, unit: e.target.value as 'Days' | 'Weeks' | 'Months' })}
                                className="w-full h-full bg-black/20 border border-white/10 text-white rounded-xl px-4 focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                            >
                                <option value="Days">Days</option>
                                <option value="Weeks">Weeks</option>
                                <option value="Months">Months</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Area Code Input (Optional) */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Area Code <span className="text-gray-600 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="e.g. 212"
                            value={areaCode}
                            onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            className="w-full bg-black/20 border border-white/10 text-white rounded-xl px-4 py-3 pl-11 focus:outline-none focus:border-primary transition-colors placeholder:text-gray-600"
                        />
                        <MapPin className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" />
                    </div>
                </div>
            </div>

            {/* Selected Service Price Display */}
            {selectedService && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div>
                        <p className="text-gray-400 text-sm">Estimated Cost</p>
                        <p className="text-xs text-gray-500">Based on selected duration</p>
                    </div>
                    <div className="text-right">
                        <p className="text-primary font-bold text-2xl">
                            ₦{(() => {
                                const basePrice = services.find(s => s.id === selectedService)?.price || 0;
                                let multiplier = selectedDuration.value;
                                if (selectedDuration.unit === 'Weeks') multiplier *= 7;
                                if (selectedDuration.unit === 'Months') multiplier *= 30;
                                return (basePrice * multiplier).toLocaleString();
                            })()}
                        </p>
                    </div>
                </div>
            )}

            <button
                onClick={handleRent}
                disabled={renting || loading || !selectedService}
                className="w-full bg-primary hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
            >
                {renting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-current" />}
                {renting ? 'Processing Rental...' : 'Rent Number'}
            </button>

            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-200/80">
                    <p className="font-bold text-yellow-500 mb-1">Important Note:</p>
                    <p>Rental costs are deducted from your wallet immediately. Please ensure you have sufficient funds.</p>
                </div>
            </div>
            {/* Active Rentals Section */}
            {activeRentals.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-lg font-bold text-white px-2">Active Rentals</h3>
                    {activeRentals.map((rental) => (
                        <div key={rental.id} className="glass-card p-4 rounded-xl border border-white/5 space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-white flex items-center gap-2">
                                    <Smartphone className="w-4 h-4 text-primary" />
                                    {rental.service}
                                </span>
                                <span className={`text-xs font-mono flex items-center gap-1 px-2 py-1 rounded-full ${rental.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {rental.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin" />}
                                    {rental.status}
                                </span>
                            </div>

                            {/* Phone Number */}
                            <div className="flex items-center gap-2 bg-black/20 p-3 rounded-lg border border-white/5">
                                <code className="text-xl text-blue-300 font-mono flex-1 tracking-wide">{rental.phone}</code>
                                <button onClick={() => copyToClipboard(rental.phone)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Inbox / Messages */}
                            <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                                <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs font-medium text-gray-400">Inbox</span>
                                </div>

                                <div className="p-4 space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                                    {/* Check for messages in rental object (if updated) or fallback to code */}
                                    {(rental as any).messages && (rental as any).messages.length > 0 ? (
                                        (rental as any).messages.map((msg: any, idx: number) => (
                                            <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/5 animate-in slide-in-from-right-2">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-bold text-primary">{msg.sender || 'Service'}</span>
                                                    <span className="text-[10px] text-gray-500">{msg.date}</span>
                                                </div>
                                                <p className="text-sm text-gray-300 break-words">{msg.text}</p>
                                                {/* Extract code if possible */}
                                                {msg.text.match(/\b\d{4,8}\b/) && (
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <code className="bg-black/30 px-2 py-1 rounded text-green-400 font-mono text-sm">
                                                            {msg.text.match(/\b\d{4,8}\b/)[0]}
                                                        </code>
                                                        <button
                                                            onClick={() => copyToClipboard(msg.text.match(/\b\d{4,8}\b/)[0])}
                                                            className="text-gray-500 hover:text-white transition-colors"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : rental.code ? (
                                        <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg animate-in zoom-in duration-300">
                                            <p className="text-xs text-green-400 mb-1 font-bold uppercase tracking-wider">SMS Code Received</p>
                                            <div className="flex items-center gap-2">
                                                <code className="text-3xl font-bold text-white tracking-[0.2em]">{rental.code}</code>
                                                <button onClick={() => copyToClipboard(rental.code!)} className="ml-auto p-2 hover:bg-green-500/20 rounded-lg transition-colors text-green-400">
                                                    <Copy className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-gray-500 gap-2">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                                                <div className="relative bg-black/50 p-2 rounded-full border border-white/10">
                                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                                </div>
                                            </div>
                                            <p className="text-xs">Waiting for messages...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <InsufficientBalanceModal
                isOpen={showBalanceModal}
                onClose={() => setShowBalanceModal(false)}
            />
        </div>
    );
}
