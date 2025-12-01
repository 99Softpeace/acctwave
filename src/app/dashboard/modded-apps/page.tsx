'use client';

import { useState } from 'react';
import { ShoppingCart, Loader2, CheckCircle, AlertCircle, Instagram, Facebook, Twitter, Mail, Music, Tv, Shield, Gamepad2, Search, ArrowLeft, Filter, ChevronRight, MessageCircle, Linkedin, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Expanded Catalog
const CATALOG = [
    {
        id: 'social',
        name: 'Social Media',
        icon: Instagram,
        products: [
            // Instagram
            { name: 'Instagram Account (Random)', code: '300004', type: 'Instagram' },
            { name: 'Instagram Aged (2018-2022)', code: '300005', type: 'Instagram' },
            { name: 'Instagram PVA (Phone Verified)', code: '300006', type: 'Instagram' },
            { name: 'Instagram with 100+ Followers', code: '300007', type: 'Instagram' },
            { name: 'Instagram Business Account', code: '300008', type: 'Instagram' },
            { name: 'Instagram Aged + Posts', code: '300009', type: 'Instagram' },
            // Facebook
            { name: 'Facebook Account (New)', code: '100001', type: 'Facebook' },
            { name: 'Facebook Marketplace Enabled', code: '100002', type: 'Facebook' },
            { name: 'Facebook Business Manager (BM1)', code: '100003', type: 'Facebook' },
            { name: 'Facebook Business Manager (BM5)', code: '100004', type: 'Facebook' },
            { name: 'Facebook Aged (2010-2019)', code: '100005', type: 'Facebook' },
            { name: 'Facebook with Friends (100+)', code: '100006', type: 'Facebook' },
            { name: 'Facebook Ads Reinstated', code: '100007', type: 'Facebook' },
            // Twitter
            { name: 'X (Twitter) Account (New)', code: '200001', type: 'Twitter' },
            { name: 'X (Twitter) Aged (2015-2020)', code: '200002', type: 'Twitter' },
            { name: 'X (Twitter) NFT Profile', code: '200003', type: 'Twitter' },
            { name: 'X (Twitter) Blue Tick Eligible', code: '200004', type: 'Twitter' },
            // TikTok
            { name: 'TikTok Account (New)', code: '700001', type: 'TikTok' },
            { name: 'TikTok Ads Account', code: '700002', type: 'TikTok' },
            { name: 'TikTok 1k+ Followers (Live)', code: '700003', type: 'TikTok' },
            { name: 'TikTok US Region', code: '700004', type: 'TikTok' },
            // Snapchat
            { name: 'Snapchat Account (New)', code: '800001', type: 'Snapchat' },
            { name: 'Snapchat High Score (10k+)', code: '800002', type: 'Snapchat' },
            { name: 'Snapchat Aged', code: '800003', type: 'Snapchat' },
            // LinkedIn
            { name: 'LinkedIn Account (New)', code: '900001', type: 'LinkedIn' },
            { name: 'LinkedIn Aged + Connections', code: '900002', type: 'LinkedIn' },
            { name: 'LinkedIn Business Page', code: '900003', type: 'LinkedIn' },
            // YouTube & Google
            { name: 'YouTube Channel (New)', code: '150001', type: 'YouTube' },
            { name: 'YouTube Channel (Aged)', code: '150002', type: 'YouTube' },
            { name: 'YouTube Monetized', code: '150003', type: 'YouTube' },
            { name: 'Google Voice Number', code: '150004', type: 'Google' },
            // Reddit
            { name: 'Reddit Account (New)', code: '160001', type: 'Reddit' },
            { name: 'Reddit Account (Aged)', code: '160002', type: 'Reddit' },
            { name: 'Reddit Account (High Karma)', code: '160003', type: 'Reddit' },
        ]
    },
    {
        id: 'messaging',
        name: 'Messaging',
        icon: MessageCircle,
        products: [
            { name: 'Telegram Account (TData)', code: '110001', type: 'Telegram' },
            { name: 'Telegram Session + Json', code: '110002', type: 'Telegram' },
            { name: 'Telegram Aged', code: '110003', type: 'Telegram' },
            { name: 'Discord Token (Aged)', code: '120001', type: 'Discord' },
            { name: 'Discord Token (Verified)', code: '120002', type: 'Discord' },
            { name: 'Discord Nitro (3 Months)', code: '120003', type: 'Discord' },
            { name: 'WhatsApp Hash Channel', code: '130001', type: 'WhatsApp' },
            { name: 'WhatsApp Business Account', code: '130002', type: 'WhatsApp' },
        ]
    },
    {
        id: 'email',
        name: 'Email Services',
        icon: Mail,
        products: [
            { name: 'Gmail Account (New)', code: '400001', type: 'Gmail' },
            { name: 'Gmail Aged (2015-2019)', code: '400002', type: 'Gmail' },
            { name: 'Outlook Account', code: '400003', type: 'Outlook' },
            { name: 'Yahoo Mail (Aged)', code: '400004', type: 'Yahoo' },
            { name: 'ProtonMail Account', code: '400005', type: 'ProtonMail' },
            { name: 'Edu Email (Student)', code: '400006', type: 'Edu' },
        ]
    },
    {
        id: 'streaming',
        name: 'Streaming & VPN',
        icon: Tv,
        products: [
            { name: 'Netflix Premium (1 Month)', code: '500001', type: 'Netflix' },
            { name: 'Spotify Premium (Individual)', code: '500002', type: 'Spotify' },
            { name: 'Spotify Premium (Family Owner)', code: '500003', type: 'Spotify' },
            { name: 'Disney+ Premium', code: '500004', type: 'Disney+' },
            { name: 'HBO Max', code: '500005', type: 'HBO' },
            { name: 'Prime Video', code: '500006', type: 'Amazon' },
            { name: 'Crunchyroll Premium', code: '500007', type: 'Crunchyroll' },
            { name: 'NordVPN Premium (2024)', code: '600001', type: 'VPN' },
            { name: 'ExpressVPN (Mobile)', code: '600002', type: 'VPN' },
            { name: 'Surfshark VPN', code: '600003', type: 'VPN' },
            { name: 'IPVanish VPN', code: '600004', type: 'VPN' },
            { name: 'VyprVPN', code: '600005', type: 'VPN' },
        ]
    },
    {
        id: 'games',
        name: 'Games',
        icon: Gamepad2,
        products: [
            { name: 'Steam Account (Random Game)', code: '140001', type: 'Steam' },
            { name: 'Steam Account (CS2 Prime)', code: '140002', type: 'Steam' },
            { name: 'Minecraft Java Edition', code: '140003', type: 'Minecraft' },
            { name: 'Roblox Account (Random)', code: '140004', type: 'Roblox' },
            { name: 'Fortnite Account (Random Skins)', code: '140005', type: 'Fortnite' },
            { name: 'Valorant Account (Ranked Ready)', code: '140006', type: 'Valorant' },
        ]
    },
    {
        id: 'software',
        name: 'Software & Other',
        icon: Shield,
        products: [
            { name: 'GitHub Account (Aged)', code: '170001', type: 'GitHub' },
            { name: 'GitHub Student Pack', code: '170002', type: 'GitHub' },
            { name: 'Apple ID (USA)', code: '180001', type: 'Apple' },
            { name: 'ChatGPT Plus (Shared)', code: '190001', type: 'AI' },
            { name: 'OpenAI API Key', code: '190002', type: 'AI' },
            { name: 'Canva Pro (Lifetime)', code: '230001', type: 'Design' },
            { name: 'Adobe Creative Cloud', code: '230002', type: 'Design' },
            { name: 'Windows 10/11 Pro Key', code: '230003', type: 'Software' },
            { name: 'Office 365 Account', code: '230004', type: 'Software' },
            { name: 'Trustpilot Reviews', code: '230005', type: 'Reviews' },
            { name: 'Tripadvisor Reviews', code: '230006', type: 'Reviews' },
        ]
    },
];

export default function ModdedAppsPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>('social');
    const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

    // Purchase State
    const [quantity, setQuantity] = useState(1);
    const [productInfo, setProductInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [purchasing, setPurchasing] = useState(false);

    const fetchProductInfo = async (code: string) => {
        setLoading(true);
        setProductInfo(null);
        try {
            const res = await fetch(`/api/modded-apps/product?productCode=${code}`);
            const data = await res.json();
            if (data.statusCode === 200) {
                setProductInfo(data.data);
            } else {
                toast.error(data.message || 'Product not found');
            }
        } catch (error) {
            toast.error('Failed to fetch product info');
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (product: any) => {
        setSelectedProduct(product);
        setViewMode('details');
        setQuantity(1);
        fetchProductInfo(product.code);
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedProduct(null);
        setProductInfo(null);
    };

    const handlePurchase = async () => {
        if (!productInfo) return;
        setPurchasing(true);
        try {
            const res = await fetch('/api/modded-apps/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productCode: productInfo.code,
                    quantity: quantity,
                    price: productInfo.price
                }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success('Purchase successful!');
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

    const activeCategoryData = CATALOG.find(c => c.id === selectedCategory);

    // DETAILS VIEW (Simulated Page)
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
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                            <p className="text-gray-400">Loading product details...</p>
                        </div>
                    ) : productInfo ? (
                        <div className="grid lg:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div>
                                    <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-sm font-medium text-gray-300 mb-4">
                                        {selectedProduct.type}
                                    </span>
                                    <h1 className="text-3xl font-bold text-white mb-2">{productInfo.name}</h1>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${productInfo.inStock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {productInfo.inStock > 0 ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                        <span className="text-sm text-gray-400">{productInfo.inStock} units available</span>
                                    </div>
                                </div>

                                <div className="p-6 bg-black/20 rounded-2xl border border-white/5 space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                        <span className="text-gray-400">Price per unit</span>
                                        <span className="text-3xl font-bold text-primary">₦{productInfo.price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Minimum Order</span>
                                        <span className="text-white font-medium">{productInfo.min} Units</span>
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
                                        <p>Please ensure you read the product description and usage terms. Accounts are checked before delivery.</p>
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
                                                    onClick={() => setQuantity(Math.max(productInfo.min, quantity - 1))}
                                                    className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors border border-white/10"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    min={productInfo.min}
                                                    max={productInfo.inStock}
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(parseInt(e.target.value) || productInfo.min)}
                                                    className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-center text-xl font-bold text-white focus:outline-none focus:border-primary/50"
                                                />
                                                <button
                                                    onClick={() => setQuantity(Math.min(productInfo.inStock, quantity + 1))}
                                                    className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors border border-white/10"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 p-6 rounded-xl space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Subtotal</span>
                                                <span className="text-white">₦{(productInfo.price * quantity).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Service Fee</span>
                                                <span className="text-white">₦0.00</span>
                                            </div>
                                            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                                <span className="font-bold text-white">Total</span>
                                                <span className="text-2xl font-bold text-primary">₦{(productInfo.price * quantity).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handlePurchase}
                                            disabled={purchasing || productInfo.inStock === 0}
                                            className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                                        >
                                            {purchasing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShoppingCart className="w-6 h-6" />}
                                            {productInfo.inStock > 0 ? 'Confirm Purchase' : 'Out of Stock'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-red-400">
                            <p>Failed to load product details. Please try again.</p>
                            <button onClick={handleBackToList} className="mt-4 text-sm underline">Go Back</button>
                        </div>
                    )}
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
                        <div className="space-y-1">
                            {CATALOG.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setSelectedCategory(cat.id);
                                        setSelectedProduct(null);
                                        setProductInfo(null);
                                        setViewMode('list'); // Ensure we are in list mode when changing category
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat.id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <cat.icon className="w-4 h-4" />
                                    {cat.name}
                                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${selectedCategory === cat.id ? 'rotate-90' : ''}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-9">
                    <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                        {/* Table Header */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                {activeCategoryData?.name}
                                <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                                    {activeCategoryData?.products.length} Items
                                </span>
                            </h2>
                        </div>

                        {/* Product Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-xs uppercase text-gray-400 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Product Name</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {activeCategoryData?.products.map((product) => (
                                        <tr
                                            key={product.code}
                                            className="hover:bg-white/5 transition-colors cursor-pointer group"
                                            onClick={() => handleProductClick(product)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white group-hover:text-primary transition-colors">{product.name}</div>
                                                <div className="text-xs text-gray-500">Code: {product.code}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-gray-300">
                                                    {product.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 ml-auto">
                                                    View Details <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
