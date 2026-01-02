'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Loader2, CheckCircle, AlertCircle, Instagram, Facebook, Twitter, Mail, Music, Tv, Shield, Gamepad2, Search, ArrowLeft, Filter, ChevronRight, MessageCircle, Linkedin, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Icon mapping for dynamic categories
const CATEGORY_CONFIG: Record<string, any> = {
    'social': { name: 'Social Media', icon: Instagram },
    'messaging': { name: 'Messaging', icon: MessageCircle },
    'email': { name: 'Email Services', icon: Mail },
    'streaming': { name: 'Streaming & VPN', icon: Tv },
    'games': { name: 'Games', icon: Gamepad2 },
    'software': { name: 'Software & Other', icon: Shield },
};

export default function ModdedAppsPage() {
    const [activeCategory, setActiveCategory] = useState<string>('social');
    const [viewMode, setViewMode] = useState<'list' | 'details'>('list');

    // Dynamic Data State
    const [catalog, setCatalog] = useState<Record<string, any[]>>({});
    const [loadingCatalog, setLoadingCatalog] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

    // Purchase State
    const [quantity, setQuantity] = useState(1);
    const [purchasing, setPurchasing] = useState(false);

    // Fetch Catalog on Mount
    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const res = await fetch('/api/modded-apps/catalog');
                const json = await res.json();
                if (json.success) {
                    setCatalog(json.data);
                } else {
                    toast.error('Failed to load product catalog');
                }
            } catch (error) {
                console.error(error);
                toast.error('Error connecting to server');
            } finally {
                setLoadingCatalog(false);
            }
        };

        fetchCatalog();
    }, []);

    const handleProductClick = (product: any) => {
        setSelectedProduct(product);
        setViewMode('details');
        setQuantity(product.min || 1);
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedProduct(null);
    };

    const handlePurchase = async () => {
        if (!selectedProduct) return;
        setPurchasing(true);
        try {
            const res = await fetch('/api/modded-apps/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productCode: selectedProduct.code,
                    quantity: quantity,
                    price: selectedProduct.price
                }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success('Purchase successful! Check your email/dashboard for details.');
                handleBackToList();
            } else {
                toast.error(data.message || 'Purchase failed');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setPurchasing(false);
        }
    };

    // Calculate active products
    const activeProducts = catalog[activeCategory] || [];

    // DETAILS VIEW
    if (viewMode === 'details' && selectedProduct) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <button
                    onClick={handleBackToList}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Catalog
                </button>

                <div className="glass-card p-8 rounded-2xl border border-white/10">
                    <div className="grid lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div>
                                <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-sm font-medium text-gray-300 mb-4">
                                    {selectedProduct.groupName}
                                </span>
                                <h1 className="text-3xl font-bold text-white mb-2">{selectedProduct.name}</h1>

                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${selectedProduct.inStock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {selectedProduct.inStock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                    <span className="text-sm text-gray-400">{selectedProduct.inStock} units available</span>
                                </div>
                            </div>

                            {/* Product Description (HTML) if available */}
                            {selectedProduct.description && (
                                <div
                                    className="text-gray-400 text-sm border-t border-white/5 pt-4 prose prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: selectedProduct.description }}
                                />
                            )}

                            <div className="p-6 bg-black/20 rounded-2xl border border-white/5 space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                    <span className="text-gray-400">Price per unit</span>
                                    <span className="text-3xl font-bold text-primary">₦{selectedProduct.price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Minimum Order</span>
                                    <span className="text-white font-medium">{selectedProduct.min} Units</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Delivery</span>
                                    <span className="text-green-400 font-medium flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4" /> Instant
                                    </span>
                                </div>
                            </div>

                            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                                <div className="text-sm text-yellow-200">
                                    <p className="font-bold mb-1">Important Note:</p>
                                    <p>Please ensure you read any specific instructions. Accounts are checked before delivery.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8 lg:border-l lg:border-white/5 lg:pl-12">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">Purchase Configuration</h3>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Select Quantity</label>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setQuantity(Math.max(selectedProduct.min || 1, quantity - 1))}
                                                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors border border-white/10"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min={selectedProduct.min || 1}
                                                max={selectedProduct.inStock}
                                                value={quantity}
                                                onChange={(e) => setQuantity(parseInt(e.target.value) || selectedProduct.min || 1)}
                                                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-center text-xl font-bold text-white focus:outline-none focus:border-primary/50"
                                            />
                                            <button
                                                onClick={() => setQuantity(Math.min(selectedProduct.inStock, quantity + 1))}
                                                className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors border border-white/10"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 p-6 rounded-xl space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Subtotal</span>
                                            <span className="text-white">₦{(selectedProduct.price * quantity).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Service Fee</span>
                                            <span className="text-white">₦0.00</span>
                                        </div>
                                        <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                            <span className="font-bold text-white">Total</span>
                                            <span className="text-2xl font-bold text-primary">₦{(selectedProduct.price * quantity).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handlePurchase}
                                        disabled={purchasing || selectedProduct.inStock === 0}
                                        className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                                    >
                                        {purchasing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShoppingCart className="w-6 h-6" />}
                                        {selectedProduct.inStock > 0 ? 'Confirm Purchase' : 'Out of Stock'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // LIST VIEW
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Premium Logs & Accounts</h1>
                <p className="text-gray-400">High-quality aged accounts, social media logs, and premium subscriptions.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Categories */}
                <div className="lg:col-span-3 space-y-2">
                    <div className="glass-card p-4 rounded-xl border border-white/5">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 px-2">Categories</h3>

                        {loadingCatalog ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                                    const Icon = config.icon;
                                    const count = (catalog[key] || []).length;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setActiveCategory(key);
                                                setViewMode('list');
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeCategory === key
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {config.name}
                                            <span className="ml-auto text-xs opacity-60">
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-9">
                    <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                        {/* Table Header */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                {CATEGORY_CONFIG[activeCategory]?.name}
                                {!loadingCatalog && (
                                    <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                                        {activeProducts.length} Items
                                    </span>
                                )}
                            </h2>
                        </div>

                        {/* Product Table */}
                        <div className="overflow-x-auto">
                            {loadingCatalog ? (
                                <div className="p-8 text-center space-y-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                    <p className="text-gray-400">Loading catalog from live server...</p>
                                </div>
                            ) : activeProducts.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">
                                    <p>No products available in this category right now.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-xs uppercase text-gray-400 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Product Name</th>
                                            <th className="px-6 py-4">Price</th>
                                            <th className="px-6 py-4">Stock</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {activeProducts.map((product: any) => (
                                            <tr
                                                key={product.code}
                                                className="hover:bg-white/5 transition-colors cursor-pointer group"
                                                onClick={() => handleProductClick(product)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-white group-hover:text-primary transition-colors line-clamp-2">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">{product.groupName}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-primary font-bold">₦{product.price.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.inStock > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                        }`}>
                                                        {product.inStock} left
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 ml-auto">
                                                        Buy <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
