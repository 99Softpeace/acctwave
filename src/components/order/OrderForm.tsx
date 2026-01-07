'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Link as LinkIcon, ShoppingBag, CheckCircle, AlertCircle, ChevronDown, Search } from 'lucide-react';
import { FacebookLogo, InstagramLogo, TikTokLogo, YouTubeLogo, TwitterLogo, TelegramLogo, LinkedInLogo, SpotifyLogo, WhatsappLogo } from '@/components/icons/SocialMediaLogos';

import InsufficientBalanceModal from '@/components/modals/InsufficientBalanceModal';

interface Service {
    service: number;
    name: string;
    type: string;
    category: string;
    rate: string;
    min: string;
    max: string;
    refill: boolean;
    cancel: boolean;
}

// Helper function to format price
const formatPrice = (price: string | number): string => {
    // If it's a string, remove commas before parsing to ensure correct number conversion
    const amount = typeof price === 'string' ? parseFloat(price.replace(/,/g, '')) : price;

    if (isNaN(amount)) return "0.00";

    // Format with commas and 2 decimal places
    return amount.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

export default function OrderForm() {
    const [services, setServices] = useState<Service[]>([]);
    const [loadingServices, setLoadingServices] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedServiceId, setSelectedServiceId] = useState("");
    const [link, setLink] = useState("");
    const [quantity, setQuantity] = useState("");
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState("");
    const [orderId, setOrderId] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPlatform, setSelectedPlatform] = useState("all");
    const [showBalanceModal, setShowBalanceModal] = useState(false);

    // Fetch Services on Mount
    useEffect(() => {
        async function fetchServices() {
            try {
                const res = await fetch('/api/services');
                if (!res.ok) throw new Error('Failed to fetch services');
                const data = await res.json();
                setServices(data);
            } catch (error) {
                console.error('Error loading services:', error);
                setErrorMessage('Failed to load services. Please try again later.');
            } finally {
                setLoadingServices(false);
            }
        }
        fetchServices();
    }, []);

    // Group services by category and prioritize based on user preference
    const categories = useMemo(() => {
        const uniqueCategories = Array.from(new Set(services.map(s => s.category)));

        // Sort with priority: Facebook, Instagram, Whatsapp, TikTok, Spotify, Youtube, Telegram, Twitter, LinkedIn
        return uniqueCategories.sort((a, b) => {
            const priorityOrder = [
                'facebook',
                'instagram',
                'whatsapp',
                'tiktok',
                'spotify',
                'youtube',
                'telegram',
                'twitter',
                'linkedin'
            ];
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();

            const aPriority = priorityOrder.findIndex(p => aLower.includes(p));
            const bPriority = priorityOrder.findIndex(p => bLower.includes(p));

            // If both have priority, sort by priority order
            if (aPriority !== -1 && bPriority !== -1) {
                return aPriority - bPriority;
            }
            // If only a has priority, it comes first
            if (aPriority !== -1) return -1;
            // If only b has priority, it comes first
            if (bPriority !== -1) return 1;
            // Otherwise, sort alphabetically
            return a.localeCompare(b);
        });
    }, [services]);

    // Filter categories based on search AND selected platform
    const filteredCategories = useMemo(() => {
        return categories.filter(category => {
            // Check if category name matches
            const categoryMatches = category.toLowerCase().includes(searchQuery.toLowerCase());

            // Check if ANY service in this category matches
            const servicesInCategory = services.filter(s => s.category === category);
            const hasMatchingService = servicesInCategory.some(s =>
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.service.toString().includes(searchQuery)
            );

            const matchesSearch = categoryMatches || hasMatchingService;

            let matchesPlatform = true;
            if (selectedPlatform === 'all') {
                matchesPlatform = true;
            } else if (selectedPlatform === 'more') {
                // Exclude all main platforms
                const mainPlatforms = ['facebook', 'instagram', 'whatsapp', 'tiktok', 'spotify', 'youtube', 'telegram', 'twitter', 'linkedin'];
                matchesPlatform = !mainPlatforms.some(p => category.toLowerCase().includes(p));
            } else {
                matchesPlatform = category.toLowerCase().includes(selectedPlatform.toLowerCase());
            }

            return matchesSearch && matchesPlatform;
        });
    }, [categories, searchQuery, selectedPlatform, services]);

    // Auto-select first category when platform changes
    useEffect(() => {
        if (filteredCategories.length > 0) {
            setSelectedCategory(filteredCategories[0]);
            setSelectedServiceId("");
            setLink("");
            setQuantity("");
        } else {
            setSelectedCategory("");
        }
    }, [filteredCategories, selectedPlatform]);

    // Filter services based on selected category
    // Filter services based on selected category AND search query
    const filteredServices = useMemo(() => {
        if (!selectedCategory) return [];

        let categoryServices = services.filter(s => s.category === selectedCategory);

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            // If the category name itself matches, we might want to show all (optional), 
            // but usually users expect to see matching services if they typed something specific.
            // Let's filter services that match the query OR if the category name matches, show all?
            // Better UX: Filter services that match. If none match but category matches, maybe show all?
            // Simple approach: Filter services that match name or ID.

            const matchingServices = categoryServices.filter(s =>
                s.name.toLowerCase().includes(lowerQuery) ||
                s.service.toString().includes(lowerQuery)
            );

            // If we found matching services, return them.
            // If NO services match (meaning only the category name matched), return all services in this category.
            if (matchingServices.length > 0) {
                return matchingServices;
            }
        }

        return categoryServices;
    }, [selectedCategory, services, searchQuery]);

    const selectedService = services.find(s => s.service.toString() === selectedServiceId.toString());
    const totalCost = selectedService && quantity
        ? formatPrice((parseFloat(selectedService.rate) * parseInt(quantity) / 1000))
        : "0.00";

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
        setSelectedServiceId(""); // Reset service when category changes
        setLink("");
        setQuantity("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService || !link || !quantity) return;

        setStatus('loading');
        setErrorMessage("");

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: selectedService.service,
                    serviceName: selectedService.name,
                    link,
                    quantity: parseInt(quantity),
                    price: parseFloat(totalCost.replace(/,/g, ''))
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.message === 'Insufficient balance') {
                    setShowBalanceModal(true);
                    setStatus('idle');
                    return;
                }
                throw new Error(data.message || 'Failed to place order');
            }

            setStatus('success');
            setOrderId(data.order.external_order_id);

            // Reset form after 3 seconds
            setTimeout(() => {
                setStatus('idle');
                setSelectedCategory("");
                setSelectedServiceId("");
                setLink("");
                setQuantity("");
                setOrderId("");
            }, 3000);

        } catch (error) {
            console.error('Order error:', error);
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
        }
    };

    // Platform buttons configuration
    const platforms = [
        { id: 'all', name: 'All', icon: ShoppingBag, color: 'text-white' },
        { id: 'facebook', name: 'Facebook', icon: FacebookLogo, color: 'text-blue-600' },
        { id: 'instagram', name: 'Instagram', icon: InstagramLogo, color: 'text-pink-500' },
        { id: 'whatsapp', name: 'WhatsApp', icon: WhatsappLogo, color: 'text-green-500' },
        { id: 'tiktok', name: 'TikTok', icon: TikTokLogo, color: 'text-white' }, // TikTok is usually black/white
        { id: 'spotify', name: 'Spotify', icon: SpotifyLogo, color: 'text-green-500' },
        { id: 'youtube', name: 'Youtube', icon: YouTubeLogo, color: 'text-red-600' },
        { id: 'telegram', name: 'Telegram', icon: TelegramLogo, color: 'text-blue-500' },
        { id: 'twitter', name: 'Twitter', icon: TwitterLogo, color: 'text-sky-500' },
        { id: 'linkedin', name: 'LinkedIn', icon: LinkedInLogo, color: 'text-blue-700' },
        { id: 'more', name: 'More', icon: ChevronDown, color: 'text-gray-400' },
    ];

    return (
        <div className="glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden min-h-[500px]">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-primary" />
                Boost Account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

                {/* Platform Quick Filters */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-6">
                    {platforms.map((platform) => {
                        const Icon = platform.icon;
                        const isSelected = selectedPlatform === platform.id;
                        return (
                            <button
                                key={platform.id}
                                type="button"
                                onClick={() => {
                                    setSelectedPlatform(platform.id);
                                    setSelectedCategory(""); // Reset category
                                    setSelectedServiceId(""); // Reset service
                                    setLink("");
                                    setQuantity("");
                                }}
                                className={`flex flex-col items-center justify-center gap-2 px-2 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all border ${isSelected
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25'
                                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10'
                                    }`}
                            >
                                {platform.id !== 'all' && <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : platform.color}`} />}
                                {platform.id === 'all' && <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />}
                                <span>{platform.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white text-gray-900 border-none rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                </div>

                {/* Step 1: Category Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Category</label>
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleCategorySelect(e.target.value)}
                            className="w-full bg-white text-gray-900 border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer shadow-sm"
                        >
                            <option value="" disabled>Choose a category...</option>
                            {filteredCategories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {/* Step 2: Service Selection */}
                    {selectedCategory && (
                        <motion.div
                            key="service-selection"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Service</label>
                                <div className="relative">
                                    <select
                                        value={selectedServiceId}
                                        onChange={(e) => setSelectedServiceId(e.target.value)}
                                        className="w-full bg-white text-gray-900 border-none rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer shadow-sm"
                                    >
                                        <option value="" disabled>Choose a service...</option>
                                        {filteredServices.map(service => (
                                            <option key={service.service} value={service.service}>
                                                {service.name} - ₦{formatPrice(service.rate)}/1k
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    </div>
                                </div>
                            </div>

                            {selectedService && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-gray-300 space-y-1"
                                >
                                    <p><span className="text-primary font-bold">Min:</span> {selectedService.min}</p>
                                    <p><span className="text-primary font-bold">Max:</span> {selectedService.max}</p>
                                    <p><span className="text-primary font-bold">Rate:</span> ₦{formatPrice(selectedService.rate)} per 1000</p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 3: Order Details */}
                    {selectedService && (
                        <motion.div
                            key="order-details"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Link Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Link</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="url"
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        placeholder="Paste your link here"
                                        className="w-full bg-[#080B1A] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Quantity Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Quantity</label>
                                <div className="relative">
                                    <Calculator className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        min={selectedService?.min}
                                        max={selectedService?.max}
                                        placeholder="1000"
                                        className="w-full bg-[#080B1A] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Total Cost Display */}
                            <div className="bg-[#080B1A] rounded-xl p-4 flex justify-between items-center border border-white/5">
                                <span className="text-gray-400 font-medium">Total Cost</span>
                                <span className="text-2xl font-bold text-white glow-text">₦{totalCost}</span>
                            </div>

                            {/* Error Message */}
                            {errorMessage && (
                                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {errorMessage}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${status === 'loading'
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : status === 'success'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-primary hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(0,122,255,0.4)] hover:shadow-[0_0_30px_rgba(0,122,255,0.6)]'
                                    }`}
                            >
                                {status === 'loading' ? (
                                    <span className="animate-pulse">Processing...</span>
                                ) : status === 'success' ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" /> Order Placed!
                                    </>
                                ) : (
                                    'Submit Order'
                                )}
                            </button>

                            {status === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center text-green-400 text-sm font-medium"
                                >
                                    Order ID: #{orderId}
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>

            <InsufficientBalanceModal
                isOpen={showBalanceModal}
                onClose={() => setShowBalanceModal(false)}
            />
        </div>
    );
}
