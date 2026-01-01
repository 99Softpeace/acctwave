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

// Updated Interface
interface Rental {
    id: string;
    phone: string;
    service: string;
    status: 'active' | 'ready' | 'canceled' | 'completed';
    code?: string;
    expiresAt: number;
    createdAt?: string;
    charge?: number;
    externalId?: string;
    messages?: any[];
}

const DURATIONS = [
    { label: '1 Day', value: 1, unit: 'Days' },
    { label: '1 Week', value: 1, unit: 'Weeks' },
    { label: '1 Month', value: 1, unit: 'Months' }
];

// ... (Keep existing Durations and imports)

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
        fetchActiveRentals();
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

                    if (data.success) {
                        const newStatus = data.data.status === 'completed' ? 'completed' : rental.status;
                        // Merge new data
                        let newRental = { ...rental };
                        if (newStatus !== rental.status) newRental.status = newStatus;
                        if (data.data.code) {
                            newRental.code = data.data.code;
                            // Only show toast if we didn't have a code before
                            if (!rental.code) toast.success(`SMS Received for ${rental.service}!`);
                        }
                        if (data.data.messages) newRental.messages = data.data.messages;

                        return newRental;
                    }
                } catch (e) {
                    console.error('Polling error', e);
                }
                return rental;
            }));

            // Deep comparison to avoid re-renders? Or just check simplified JSON
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

    const fetchActiveRentals = async () => {
        try {
            const res = await fetch('/api/rent-number/active');
            const data = await res.json();
            if (data.success) {
                setActiveRentals(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch active rentals', error);
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
                setActiveRentals(prev => [data.data, ...prev]);
                fetchActiveRentals(); // Refresh list to ensure strict syncing
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

    const formatDate = (dateUnparsed: string | number) => {
        try {
            return new Date(dateUnparsed).toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
            });
        } catch (e) { return 'Just now'; }
    };

    const formatTime = (ms: number) => {
        try {
            return new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        } catch (e) { return '...'; }
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
                                                            ₦{(service.price || 0).toLocaleString()}
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

            {/* Active Rentals Section - Redesigned to Match VirtualNumber UI */}
            {activeRentals.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-lg font-bold text-white px-2">Active Rentals</h3>
                    {activeRentals.map((rental) => (
                        <div key={rental.id} className="glass-card p-5 rounded-xl border border-white/5 space-y-4 relative overflow-hidden">
                            {/* Service Name Header matched to screenshot 'Virtual Number' style */}
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Globe className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">{rental.service}</h4> {/* "Snapchat" */}
                                </div>
                            </div>

                            {/* Phone Number Block */}
                            <div className="flex items-center items-stretch gap-0">
                                <div className="bg-white/5 border border-white/10 rounded-l-lg px-4 py-2 flex items-center">
                                    <span className="text-xl font-mono text-gray-200 tracking-wider">
                                        {rental.phone}
                                    </span>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(rental.phone)}
                                    className="bg-white/5 border-y border-r border-white/10 hover:bg-white/10 px-3 flex items-center justify-center rounded-r-lg transition-colors"
                                >
                                    <Copy className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>

                            {/* Metadata Row (Date only) */}
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500 font-mono">
                                <div className="flex items-center gap-1">
                                    <span>{rental.createdAt ? formatDate(rental.createdAt) : 'Recently'}</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-white/5 my-2" />

                            {/* Status Footer Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex gap-6 text-sm">
                                    <div>
                                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Expires</p>
                                        <p className="font-bold text-white font-mono">{rental.expiresAt ? formatTime(rental.expiresAt) : '--:--'}</p>
                                    </div>
                                    {rental.charge !== undefined && (
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-0.5">Charge</p>
                                            <p className="font-bold text-white font-mono">₦{rental.charge.toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Status Badge */}
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${rental.status === 'completed'
                                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                    : 'bg-green-500/10 border-green-500/20 text-green-400' // 'Active' is also green in screenshot
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${rental.status === 'completed' ? 'bg-green-400' : 'bg-green-400 animate-pulse'}`} />
                                    {rental.status === 'completed' ? 'SMS Received' : 'Active'}
                                </div>
                            </div>

                            {/* Inbox / Messages Section (Collapsible or visible) */}
                            {((rental.messages && rental.messages.length > 0) || rental.code) && (
                                <div className="mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2">
                                    {/* ... (Existing inbox logic but styled cleaner) ... */}
                                    {rental.code ? (
                                        <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-green-400 font-bold uppercase">Verification Code</p>
                                                <code className="text-2xl font-bold text-white tracking-widest">{rental.code}</code>
                                            </div>
                                            <button onClick={() => copyToClipboard(rental.code!)} className="p-2 hover:bg-green-500/20 rounded-lg text-green-400">
                                                <Copy className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {rental.messages?.map((msg: any, i: number) => (
                                                <div key={i} className="bg-white/5 p-2 rounded text-sm text-gray-300">
                                                    {msg.text}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
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
