import { unstable_noStore as noStore } from 'next/cache';

const MODDED_APPS_API_URL = process.env.MODDED_APPS_API_URL || 'https://bulkacc.com';
const MODDED_APPS_API_KEY = process.env.MODDED_APPS_API_KEY || '';

// Simple in-memory cache
let catalogCache: {
    data: any[];
    timestamp: number;
} | null = null;

const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

// 1 USD = 1650 NGN (Configurable)
const EXCHANGE_RATE = 1650;
const MARKUP = 1.4; // 40% profit

export interface BulkAccProduct {
    code: string;
    name: string;
    price: number; // In NGN after conversion
    originalPrice?: number; // In USD
    inStock: number;
    min: number;
    groupName: string;
    categoryName?: string;
    description?: string;
}

export function calculatePrice(usdPrice: number): number {
    // USD -> NGN -> Markup -> Round Up to nearest 10
    const base = usdPrice * EXCHANGE_RATE;
    const withMarkup = base * MARKUP;
    return Math.ceil(withMarkup / 10) * 10;
}

export async function fetchFullCatalog(): Promise<BulkAccProduct[]> {
    // Prevent Next.js from caching this fetch statically at build time
    noStore();

    const now = Date.now();
    if (catalogCache && (now - catalogCache.timestamp < CACHE_TTL)) {
        console.log('Serving catalog from cache');
        return catalogCache.data;
    }

    console.log('Fetching fresh catalog from BulkAcc...');
    let allItems: BulkAccProduct[] = [];
    let page = 1;
    let hasMore = true;
    // Safety limit to prevent infinite loops
    const MAX_PAGES = 50;

    while (hasMore && page <= MAX_PAGES) {
        try {
            const url = `${MODDED_APPS_API_URL}/api/products/list?apiKey=${MODDED_APPS_API_KEY}&pageIndex=${page}&pageSize=100`;
            const res = await fetch(url, {
                // Ensure fresh data on refetch
                cache: 'no-store',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0'
                }
            });

            if (!res.ok) {
                console.error(`Failed to fetch page ${page}: ${res.status}`);
                break;
            }

            const json = await res.json();

            if (json.data && json.data.items && json.data.items.length > 0) {
                // Transform items immediately
                const mappedItems = json.data.items.map((item: any) => ({
                    ...item,
                    originalPrice: item.price,
                    price: calculatePrice(item.price)
                }));
                allItems = allItems.concat(mappedItems);

                if (json.data.pageIndex >= json.data.totalPage) {
                    hasMore = false;
                } else {
                    page++;
                }
            } else {
                hasMore = false;
            }
        } catch (error) {
            console.error('Error fetching catalog page', page, error);
            hasMore = false;
        }
    }

    // Update cache
    if (allItems.length > 0) {
        catalogCache = {
            data: allItems,
            timestamp: now
        };
    }

    return allItems;
}

export async function fetchProduct(code: string): Promise<BulkAccProduct | null> {
    const catalog = await fetchFullCatalog();
    const product = catalog.find(p => p.code === code);
    return product || null;
}

// Helper to categorize products for the UI
export function categorizeProducts(products: BulkAccProduct[]) {
    // Map BulkAcc GroupNames (from audit) to our UI IDs
    // Groups seen in audit: Instagram, Facebook, TikTok, Twitter, Snapchat, Discord, etc.

    // UI Structure matches the buy-logs page
    const categories: Record<string, BulkAccProduct[]> = {
        'social': [],
        'messaging': [],
        'email': [],
        'streaming': [],
        'games': [],
        'software': [],
    };

    products.forEach(p => {
        // Skip if out of stock (optional, or we can include them)
        // For now, let's include everything so user sees what exists

        const group = (p.groupName || '').toLowerCase();
        const name = (p.name || '').toLowerCase();

        if (group.includes('instagram') || group.includes('facebook') || group.includes('tiktok') || group.includes('twitter') || group.includes('linkedin') || group.includes('pinterest') || group.includes('reddit') || group.includes('youtube')) {
            categories['social'].push(p);
        } else if (group.includes('discord') || group.includes('telegram') || group.includes('whatsapp') || name.includes('discord') || name.includes('telegram')) {
            categories['messaging'].push(p);
        } else if (group.includes('gmail') || group.includes('outlook') || group.includes('yahoo') || group.includes('mail')) {
            categories['email'].push(p);
        } else if (group.includes('netflix') || group.includes('spotify') || group.includes('prime') || group.includes('hbo') || group.includes('vpn')) {
            categories['streaming'].push(p);
        } else if (group.includes('steam') || group.includes('fortnite') || group.includes('roblox') || group.includes('game') || group.includes('minecraft')) {
            categories['games'].push(p);
        } else if (group.includes('canva') || group.includes('adobe') || group.includes('window') || group.includes('office') || group.includes('gpt') || group.includes('ai') || group.includes('review')) {
            categories['software'].push(p);
        }
    });

    return categories;
}
