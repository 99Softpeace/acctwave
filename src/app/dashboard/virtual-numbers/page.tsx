'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Globe, Clock, CheckCircle, Loader2, AlertCircle, Copy, Zap, Search, Flag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import InsufficientBalanceModal from '@/components/modals/InsufficientBalanceModal';

interface Service {
    id: string;
    name: string;
    price: number;
}

interface Country {
    id: string;
    name: string;
    code: string;
    flag: string;
}

interface ActiveNumber {
    _id: string;
    number: string;
    serviceName: string;
    countryName: string;
    status: 'active' | 'completed' | 'cancelled';
    smsCode?: string;
    fullSms?: string;
    expiresAt: string;
}

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            const end = new Date(expiresAt).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('Expired');
                return;
            }

            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    return (
        <span className={`${timeLeft === 'Expired' ? 'text-red-400' : 'text-primary'} font-mono font-bold`}>
            {timeLeft === 'Expired' ? 'Expired' : `${timeLeft}`}
        </span>
    );
}

export default function VirtualNumbersPage() {
    const [activeTab, setActiveTab] = useState<'us' | 'international'>('us');

    const [services, setServices] = useState<Service[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [activeNumbers, setActiveNumbers] = useState<ActiveNumber[]>([]);

    const [selectedService, setSelectedService] = useState<string>('');
    const [selectedCountry, setSelectedCountry] = useState<string>('');

    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [serviceSearchQuery, setServiceSearchQuery] = useState('');
    const [countrySearchQuery, setCountrySearchQuery] = useState('');
    const [showBalanceModal, setShowBalanceModal] = useState(false);

    // Fetch initial data
    useEffect(() => {
        fetchData();
    }, []);

    // Handle Tab Change
    useEffect(() => {
        if (activeTab === 'us') {
            // For US tab, country is fixed to US (TextVerified)
            // We fetch services for US immediately
            fetchServices('US');
            setSelectedCountry('US');
        } else {
            // For International tab, reset selection and fetch countries if needed
            // We might want to default to a popular country or just clear
            setSelectedCountry('');
            setServices([]);
            // Ensure countries are loaded (fetched in fetchData)
        }
        setSelectedService('');
    }, [activeTab]);

    // Fetch services when country changes (for International tab)
    useEffect(() => {
        if (activeTab === 'international' && selectedCountry) {
            fetchServices(selectedCountry);
        }
    }, [selectedCountry, activeTab]);

    // Poll for SMS updates (Heartbeat: Every 2 seconds)
    useEffect(() => {
        // If no numbers, no need to poll
        if (activeNumbers.length === 0) return;

        const interval = setInterval(() => {
            // Always poll the backend for updates if we have numbers displayed
            fetchActiveNumbers();
        }, 4000); // Poll every 4 seconds (Safe for Rate Limits)

        return () => clearInterval(interval);
    }, [activeNumbers.length]); // Only reset if the number of items changes

    const fetchData = async () => {
        try {
            const [servicesRes, activeRes] = await Promise.all([
                fetch(`/api/numbers/services?country=US`), // Initial fetch for US
                fetch('/api/numbers/active')
            ]);

            const servicesData = await servicesRes.json();
            const activeData = await activeRes.json();

            if (servicesData.success) {
                // If we are in US tab (default), set services
                if (activeTab === 'us') {
                    setServices(servicesData.services);
                    setSelectedCountry('US');
                }
                // Store countries for International tab
                setCountries(servicesData.countries);
            }

            if (activeData.success) {
                setActiveNumbers(activeData.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async (countryId: string) => {
        setLoading(true);
        try {
            // [FIX] Add timestamp to prevent caching of outdated pricing
            const res = await fetch(`/api/numbers/services?country=${countryId}&t=${Date.now()}`);
            const data = await res.json();
            if (data.success) {
                setServices(data.data || data.services);
                // If switching to international, update countries list if provided
                if (activeTab === 'international' && data.countries) {
                    setCountries(data.countries);
                }
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveNumbers = async () => {
        try {
            const res = await fetch('/api/numbers/active');
            const data = await res.json();
            if (data.success) {
                setActiveNumbers(data.data);
            }
        } catch (error) {
            console.error('Polling error:', error);
        }
    };

    const handleBuyNumber = async () => {
        if (!selectedService || !selectedCountry) return;

        setBuying(true);
        try {
            const service = services.find(s => s.id === selectedService);
            if (!service) return;

            const res = await fetch('/api/numbers/rent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: selectedService,
                    countryId: selectedCountry,
                    maxPrice: service.price
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setActiveNumbers(prev => [data.data, ...prev]);
                toast.success('Number generated successfully!');
            } else {
                if (data.message === 'Insufficient balance') {
                    setShowBalanceModal(true);
                } else {
                    toast.error(data.message || 'Failed to generate number');
                }
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setBuying(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="max-w-xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Foreign Numbers</h1>
                <p className="text-gray-400">Get temporary phone numbers for SMS verification.</p>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-black/20 rounded-xl border border-white/5">
                <button
                    onClick={() => setActiveTab('us')}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'us'
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    USA Premium
                </button>
                <button
                    onClick={() => setActiveTab('international')}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'international'
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Globe className="w-4 h-4" />
                    Other Countries
                </button>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/5 shadow-xl">
                <div className="space-y-6">

                    {/* Country Selection (Only for International) */}
                    {activeTab === 'international' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Select Country</label>
                            <div className="relative">
                                <button
                                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                    className="w-full bg-black/20 border border-white/10 text-white text-lg rounded-xl px-4 py-3 flex items-center justify-between hover:border-primary/50 transition-colors"
                                >
                                    <span className="flex items-center gap-2">
                                        {selectedCountry && countries.find(c => c.id === selectedCountry) ? (
                                            <>
                                                <span className="text-2xl">{countries.find(c => c.id === selectedCountry)?.flag}</span>
                                                <span>{countries.find(c => c.id === selectedCountry)?.name}</span>
                                            </>
                                        ) : 'Select a country...'}
                                    </span>
                                    <Globe className="w-5 h-5 text-gray-400" />
                                </button>

                                {isCountryDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsCountryDropdownOpen(false)} />
                                        <div className="absolute z-50 w-full mt-2 bg-[#1a1b1e] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-hidden flex flex-col">
                                            <div className="p-2 border-b border-white/5 sticky top-0 bg-[#1a1b1e]">
                                                <input
                                                    type="text"
                                                    placeholder="Search countries..."
                                                    value={countrySearchQuery}
                                                    onChange={(e) => setCountrySearchQuery(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary placeholder:text-gray-600"
                                                    autoFocus
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                            <div className="overflow-y-auto flex-1 custom-scrollbar">
                                                {countries
                                                    .filter(c => c.name.toLowerCase().includes(countrySearchQuery.toLowerCase()))
                                                    .map((country) => (
                                                        <button
                                                            key={country.id}
                                                            onClick={() => {
                                                                setSelectedCountry(country.id);
                                                                setIsCountryDropdownOpen(false);
                                                                setCountrySearchQuery('');
                                                            }}
                                                            className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center gap-3 ${selectedCountry === country.id ? 'bg-primary/20 text-white' : 'text-gray-400'
                                                                }`}
                                                        >
                                                            <span className="text-2xl">{country.flag}</span>
                                                            <span>{country.name}</span>
                                                        </button>
                                                    ))}
                                                {countries.filter(c => c.name.toLowerCase().includes(countrySearchQuery.toLowerCase())).length === 0 && (
                                                    <div className="p-4 text-center text-gray-500 text-sm">
                                                        No countries found
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Service Selection */}
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Select Service</label>
                        {loading ? (
                            <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
                        ) : (
                            <div className="relative">
                                <button
                                    onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                                    disabled={activeTab === 'international' && !selectedCountry}
                                    className="w-full bg-black/20 border border-white/10 text-white text-lg rounded-xl px-4 py-3 flex items-center justify-between hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className={selectedService ? 'text-white' : 'text-gray-400'}>
                                        {selectedService
                                            ? services.find(s => s.id === selectedService)?.name
                                            : (activeTab === 'international' && !selectedCountry ? 'Select a country first' : (services.length === 0 ? 'No services available' : 'Select a service...'))}
                                    </span>
                                    <Search className="w-5 h-5 text-gray-400" />
                                </button>

                                {isServiceDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsServiceDropdownOpen(false)} />
                                        <div className="absolute z-50 w-full mt-2 bg-[#1a1b1e] border border-white/10 rounded-xl shadow-2xl max-h-80 overflow-hidden flex flex-col">
                                            <div className="p-2 border-b border-white/5 sticky top-0 bg-[#1a1b1e]">
                                                <input
                                                    type="text"
                                                    placeholder="Search services..."
                                                    value={serviceSearchQuery}
                                                    onChange={(e) => setServiceSearchQuery(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary placeholder:text-gray-600"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
                                                {services
                                                    .filter(s => s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()))
                                                    .slice(0, 50)
                                                    .map((service) => (
                                                        <button
                                                            key={service.id}
                                                            onClick={() => {
                                                                setSelectedService(service.id);
                                                                setIsServiceDropdownOpen(false);
                                                                setServiceSearchQuery('');
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
                                                {services.length === 0 && (
                                                    <div className="p-4 text-center text-gray-500 text-sm">
                                                        No services available for this country
                                                    </div>
                                                )}
                                                {services.length > 0 && services.filter(s => s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())).length === 0 && (
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

                    {/* Price Display */}
                    {selectedService && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                            <div>
                                <p className="text-gray-400 text-sm">Selected Service</p>
                                <p className="text-white font-bold text-lg">
                                    {services.find(s => s.id === selectedService)?.name}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-sm">Price</p>
                                <p className="text-primary font-bold mt-1">
                                    <span className="text-2xl">₦{(services.find(s => s.id === selectedService)?.price || 0).toLocaleString()}</span>
                                    {activeTab === 'us' && <span className="text-xs text-gray-500 block font-normal">Premium</span>}
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleBuyNumber}
                        disabled={buying || loading || !selectedService || !selectedCountry}
                        className="w-full bg-primary hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
                    >
                        {buying ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-current" />}
                        {buying ? 'Generating Number...' : 'Buy Number'}
                    </button>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-200/80">
                            <p className="font-bold text-yellow-500 mb-1">Important Note:</p>
                            <p>Numbers are valid for <strong>15 minutes</strong>. Please ensure you are ready to request the SMS code immediately after generating the number.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Numbers Section */}
            {activeNumbers.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-lg font-bold text-white px-2">Active Numbers</h3>
                    {activeNumbers.map((rental) => {
                        if (!rental) return null;
                        return (
                            <div key={rental._id || Math.random()} className="glass-card p-4 rounded-xl border border-white/5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold text-white flex items-center gap-2">
                                        <Smartphone className="w-4 h-4 text-primary" />
                                        {rental.serviceName}
                                        <span className="text-gray-500 text-xs">• {rental.countryName}</span>
                                    </span>
                                    <span className={`text-xs font-mono flex items-center gap-1 px-2 py-1 rounded-full ${rental.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {rental.status === 'completed' ? <CheckCircle className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin" />}
                                        {rental.status}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 mb-3 bg-black/20 p-3 rounded-lg border border-white/5">
                                    <code className="text-xl text-blue-300 font-mono flex-1 tracking-wide">{rental.number}</code>
                                    <button onClick={() => copyToClipboard(rental.number)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>

                                {rental.smsCode ? (
                                    <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg animate-in zoom-in duration-300">
                                        <p className="text-xs text-green-400 mb-1 font-bold uppercase tracking-wider">SMS Code Received</p>
                                        <div className="flex items-center gap-2">
                                            <code className="text-3xl font-bold text-white tracking-[0.2em]">{rental.smsCode}</code>
                                            <button onClick={() => copyToClipboard(rental.smsCode!)} className="ml-auto p-2 hover:bg-green-500/20 rounded-lg transition-colors text-green-400">
                                                <Copy className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2">{rental.fullSms}</div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between text-xs text-gray-500 px-1 mt-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-2 animate-pulse text-yellow-500/80">
                                                <Clock className="w-3 h-3" />
                                                <span>Waiting...</span>
                                            </div>
                                            <span className="text-gray-600">|</span>
                                            <CountdownTimer expiresAt={rental.expiresAt} />
                                        </div>

                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (!confirm('Are you sure you want to cancel this number and refund remaining balance?')) return;

                                                const toastId = toast.loading('Cancelling...');
                                                try {
                                                    const res = await fetch('/api/numbers/cancel', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ numberId: rental._id })
                                                    });
                                                    const data = await res.json();
                                                    if (res.ok && data.success) {
                                                        toast.success('Order cancelled & refunded', { id: toastId });
                                                        setActiveNumbers(prev => prev.filter(n => n._id !== rental._id));
                                                    } else {
                                                        toast.error(data.message || 'Failed to cancel', { id: toastId });
                                                    }
                                                } catch (err) {
                                                    toast.error('Error cancelling order', { id: toastId });
                                                }
                                            }}
                                            className="flex items-center gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1 rounded transition-colors"
                                        >
                                            <Flag className="w-3 h-3" />
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <InsufficientBalanceModal
                isOpen={showBalanceModal}
                onClose={() => setShowBalanceModal(false)}
            />
        </div>
    );
}
