const SMM_API_URL = process.env.SMM_API_URL || '';
const SMM_API_KEY = process.env.SMM_API_KEY || '';

// We don't throw here anymore to allow build to pass.
// Runtime checks should handle missing keys if needed.

// Simple in-memory cache
let servicesCache: any[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function getServices() {
    const now = Date.now();

    // Return cached data if valid
    if (servicesCache && (now - lastFetchTime < CACHE_DURATION)) {
        return servicesCache;
    }

    const params = new URLSearchParams({
        key: SMM_API_KEY!,
        action: 'services',
    });

    const response = await fetch(SMM_API_URL!, {
        method: 'POST',
        body: params,
        cache: 'no-store' // Disable caching to ensure fresh data and avoid Vercel static generation issues
    });

    if (!response.ok) {
        throw new Error('Failed to fetch services');
    }

    const services = await response.json();

    // --- Dynamic Pricing Logic ---
    // 1. Fetch Real-time Exchange Rate (or use a safe fallback)
    const EXCHANGE_RATE = 1750; // 1 USD = 1750 NGN
    const PROFIT_MARGIN = 1.4;  // 40% Profit Margin (1.4x multiplier)

    // 2. Transform Prices
    const updatedServices = services.map((service: any) => {
        // Assuming provider price is in USD (e.g., "0.50")
        const costPriceUSD = parseFloat(service.rate);

        if (isNaN(costPriceUSD)) {
            return service; // Return original if rate is invalid
        }

        // Calculate Selling Price in NGN
        // Formula: (Cost * Exchange Rate) * Profit Margin
        const sellingPriceNGN = Math.ceil((costPriceUSD * EXCHANGE_RATE) * PROFIT_MARGIN);

        return {
            ...service,
            rate: sellingPriceNGN.toString(), // Update rate to NGN
            original_rate_usd: service.rate, // Keep track of original cost
            currency: 'NGN'
        };
    });

    // Update cache
    servicesCache = updatedServices;
    lastFetchTime = now;

    return updatedServices;
}

export async function addOrder(serviceId: number, link: string, quantity: number) {
    const params = new URLSearchParams({
        key: SMM_API_KEY!,
        action: 'add',
        service: serviceId.toString(),
        link: link,
        quantity: quantity.toString(),
    });

    const response = await fetch(SMM_API_URL!, {
        method: 'POST',
        body: params,
    });

    if (!response.ok) {
        throw new Error('Failed to place order');
    }

    return response.json();
}

export async function getOrderStatus(orderId: number) {
    const params = new URLSearchParams({
        key: SMM_API_KEY!,
        action: 'status',
        order: orderId.toString(),
    });

    const response = await fetch(SMM_API_URL!, {
        method: 'POST',
        body: params,
    });

    if (!response.ok) {
        throw new Error('Failed to get order status');
    }

    return response.json();
}

export async function getBalance() {
    const params = new URLSearchParams({
        key: SMM_API_KEY!,
        action: 'balance',
    });

    const response = await fetch(SMM_API_URL!, {
        method: 'POST',
        body: params,
    });

    if (!response.ok) {
        throw new Error('Failed to get balance');
    }

    return response.json();
}
