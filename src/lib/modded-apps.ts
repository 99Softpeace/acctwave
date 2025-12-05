const MODDED_APPS_API_URL = process.env.MODDED_APPS_API_URL || 'https://bulkacc.com';
const MODDED_APPS_API_KEY = process.env.MODDED_APPS_API_KEY || '';

if (!MODDED_APPS_API_URL) {
    throw new Error('MODDED_APPS_API_URL must be defined');
}

// Centralized Mock Data
const MOCK_PRODUCTS: Record<string, any> = {
    // --- INSTAGRAM ---
    '300004': { name: 'Instagram Account (Random)', price: 1600, inStock: 150, min: 1, code: '300004' },
    '300005': { name: 'Instagram Aged (2018-2022)', price: 8000, inStock: 45, min: 1, code: '300005' },
    '300006': { name: 'Instagram PVA (Phone Verified)', price: 3840, inStock: 80, min: 1, code: '300006' },
    '300007': { name: 'Instagram with 100+ Followers', price: 16000, inStock: 20, min: 1, code: '300007' },
    '300008': { name: 'Instagram Business Account', price: 11200, inStock: 30, min: 1, code: '300008' },
    '300009': { name: 'Instagram Aged + Posts', price: 12800, inStock: 15, min: 1, code: '300009' },

    // --- FACEBOOK ---
    '100001': { name: 'Facebook Account (New)', price: 960, inStock: 200, min: 1, code: '100001' },
    '100002': { name: 'Facebook Marketplace Enabled', price: 16000, inStock: 12, min: 1, code: '100002' },
    '100003': { name: 'Facebook Business Manager (BM1)', price: 48000, inStock: 5, min: 1, code: '100003' },
    '100004': { name: 'Facebook Business Manager (BM5)', price: 144000, inStock: 2, min: 1, code: '100004' },
    '100005': { name: 'Facebook Aged (2010-2019)', price: 25600, inStock: 25, min: 1, code: '100005' },
    '100006': { name: 'Facebook with Friends (100+)', price: 19200, inStock: 10, min: 1, code: '100006' },
    '100007': { name: 'Facebook Ads Reinstated', price: 80000, inStock: 3, min: 1, code: '100007' },

    // --- TWITTER / X ---
    '200001': { name: 'X (Twitter) Account (New)', price: 1280, inStock: 100, min: 1, code: '200001' },
    '200002': { name: 'X (Twitter) Aged (2015-2020)', price: 9600, inStock: 30, min: 1, code: '200002' },
    '200003': { name: 'X (Twitter) NFT Profile', price: 6400, inStock: 50, min: 1, code: '200003' },
    '200004': { name: 'X (Twitter) Blue Tick Eligible', price: 32000, inStock: 5, min: 1, code: '200004' },

    // --- TIKTOK ---
    '700001': { name: 'TikTok Account (New)', price: 1600, inStock: 300, min: 1, code: '700001' },
    '700002': { name: 'TikTok Ads Account', price: 38400, inStock: 8, min: 1, code: '700002' },
    '700003': { name: 'TikTok 1k+ Followers (Live Enabled)', price: 48000, inStock: 10, min: 1, code: '700003' },
    '700004': { name: 'TikTok US Region', price: 6400, inStock: 50, min: 1, code: '700004' },

    // --- SNAPCHAT ---
    '800001': { name: 'Snapchat Account (New)', price: 1920, inStock: 150, min: 1, code: '800001' },
    '800002': { name: 'Snapchat High Score (10k+)', price: 14400, inStock: 20, min: 1, code: '800002' },
    '800003': { name: 'Snapchat Aged', price: 8000, inStock: 40, min: 1, code: '800003' },

    // --- LINKEDIN ---
    '900001': { name: 'LinkedIn Account (New)', price: 3200, inStock: 50, min: 1, code: '900001' },
    '900002': { name: 'LinkedIn Aged + 500 Connections', price: 48000, inStock: 5, min: 1, code: '900002' },
    '900003': { name: 'LinkedIn Business Page', price: 16000, inStock: 10, min: 1, code: '900003' },

    // --- YOUTUBE & GOOGLE ---
    '150001': { name: 'YouTube Channel (New)', price: 3200, inStock: 100, min: 1, code: '150001' },
    '150002': { name: 'YouTube Channel (Aged 2010-2015)', price: 32000, inStock: 15, min: 1, code: '150002' },
    '150003': { name: 'YouTube Channel (1k Subs + Monetization)', price: 480000, inStock: 2, min: 1, code: '150003' },
    '150004': { name: 'Google Voice Number', price: 9600, inStock: 50, min: 1, code: '150004' },

    // --- REDDIT ---
    '160001': { name: 'Reddit Account (New)', price: 1600, inStock: 200, min: 1, code: '160001' },
    '160002': { name: 'Reddit Account (Aged 1 Year+)', price: 16000, inStock: 30, min: 1, code: '160002' },
    '160003': { name: 'Reddit Account (1k+ Karma)', price: 48000, inStock: 10, min: 1, code: '160003' },

    // --- MESSAGING ---
    '110001': { name: 'Telegram Account (TData)', price: 4800, inStock: 100, min: 1, code: '110001' },
    '110002': { name: 'Telegram Session + Json', price: 3840, inStock: 120, min: 1, code: '110002' },
    '110003': { name: 'Telegram Aged', price: 9600, inStock: 40, min: 1, code: '110003' },
    '120001': { name: 'Discord Token (Aged)', price: 2560, inStock: 200, min: 1, code: '120001' },
    '120002': { name: 'Discord Token (Verified)', price: 4800, inStock: 80, min: 1, code: '120002' },
    '120003': { name: 'Discord Nitro (3 Months)', price: 16000, inStock: 20, min: 1, code: '120003' },
    '130001': { name: 'WhatsApp Hash Channel', price: 6400, inStock: 50, min: 5, code: '130001' },
    '130002': { name: 'WhatsApp Business Account', price: 25600, inStock: 10, min: 1, code: '130002' },

    // --- EMAIL ---
    '400001': { name: 'Gmail Account (New)', price: 640, inStock: 500, min: 5, code: '400001' },
    '400002': { name: 'Gmail Aged (2015-2019)', price: 4800, inStock: 60, min: 1, code: '400002' },
    '400003': { name: 'Outlook Account', price: 320, inStock: 1000, min: 10, code: '400003' },
    '400004': { name: 'Yahoo Mail (Aged)', price: 1600, inStock: 100, min: 1, code: '400004' },
    '400005': { name: 'ProtonMail Account', price: 3200, inStock: 50, min: 1, code: '400005' },
    '400006': { name: 'Edu Email (Student)', price: 16000, inStock: 15, min: 1, code: '400006' },

    // --- STREAMING ---
    '500001': { name: 'Netflix Premium (1 Month)', price: 11200, inStock: 20, min: 1, code: '500001' },
    '500002': { name: 'Spotify Premium (Individual)', price: 6400, inStock: 50, min: 1, code: '500002' },
    '500003': { name: 'Spotify Premium (Family Owner)', price: 16000, inStock: 10, min: 1, code: '500003' },
    '500004': { name: 'Disney+ Premium', price: 9600, inStock: 25, min: 1, code: '500004' },
    '500005': { name: 'HBO Max', price: 11200, inStock: 15, min: 1, code: '500005' },
    '500006': { name: 'Prime Video', price: 8000, inStock: 30, min: 1, code: '500006' },
    '500007': { name: 'Crunchyroll Premium', price: 6400, inStock: 40, min: 1, code: '500007' },

    // --- VPN & SECURITY ---
    '600001': { name: 'NordVPN Premium (2024)', price: 8000, inStock: 40, min: 1, code: '600001' },
    '600002': { name: 'ExpressVPN (Mobile)', price: 9600, inStock: 25, min: 1, code: '600002' },
    '600003': { name: 'Surfshark VPN', price: 6400, inStock: 30, min: 1, code: '600003' },
    '600004': { name: 'IPVanish VPN', price: 6400, inStock: 20, min: 1, code: '600004' },
    '600005': { name: 'VyprVPN', price: 8000, inStock: 15, min: 1, code: '600005' },

    // --- GAMES ---
    '140001': { name: 'Steam Account (Random Game)', price: 3200, inStock: 100, min: 1, code: '140001' },
    '140002': { name: 'Steam Account (CS2 Prime)', price: 48000, inStock: 5, min: 1, code: '140002' },
    '140003': { name: 'Minecraft Java Edition', price: 25600, inStock: 10, min: 1, code: '140003' },
    '140004': { name: 'Roblox Account (Random)', price: 1600, inStock: 200, min: 1, code: '140004' },
    '140005': { name: 'Fortnite Account (Random Skins)', price: 6400, inStock: 50, min: 1, code: '140005' },
    '140006': { name: 'Valorant Account (Ranked Ready)', price: 16000, inStock: 20, min: 1, code: '140006' },

    // --- OTHER / SOFTWARE ---
    '170001': { name: 'GitHub Account (Aged)', price: 6400, inStock: 40, min: 1, code: '170001' },
    '170002': { name: 'GitHub Student Developer Pack', price: 32000, inStock: 5, min: 1, code: '170002' },
    '180001': { name: 'Apple ID (USA)', price: 3200, inStock: 100, min: 1, code: '180001' },
    '190001': { name: 'ChatGPT Plus (Shared)', price: 16000, inStock: 20, min: 1, code: '190001' },
    '190002': { name: 'OpenAI API Key ($120 Credit)', price: 48000, inStock: 5, min: 1, code: '190002' },
    '230001': { name: 'Canva Pro (Lifetime)', price: 16000, inStock: 50, min: 1, code: '230001' },
    '230002': { name: 'Adobe Creative Cloud (1 Month)', price: 32000, inStock: 10, min: 1, code: '230002' },
    '230003': { name: 'Windows 10/11 Pro Key', price: 9600, inStock: 200, min: 1, code: '230003' },
    '230004': { name: 'Office 365 Account', price: 6400, inStock: 100, min: 1, code: '230004' },
    '230005': { name: 'Trustpilot Reviews', price: 6400, inStock: 1000, min: 5, code: '230005' },
    '230006': { name: 'Tripadvisor Reviews', price: 8000, inStock: 1000, min: 5, code: '230006' },
};

export async function getProductInfo(productCode: string) {
    // Mock Data for Demo
    const product = MOCK_PRODUCTS[productCode];

    if (product) {
        // Apply 40% profit margin
        const adjustedPrice = Math.ceil(product.price * 1.4);
        return {
            statusCode: 200,
            data: { ...product, price: adjustedPrice }
        };
    }

    // Fallback for unknown codes
    return {
        statusCode: 200,
        data: {
            name: 'Unknown Product',
            price: 1.0,
            inStock: 0,
            min: 1,
            code: productCode
        }
    };
}

export async function createOrder(productCode: string, quantity: number) {
    // Directly call the real API
    // This allows the order to go through if the user has funded their account
    try {
        const response = await fetch(`${MODDED_APPS_API_URL}/api/orders?apiKey=${MODDED_APPS_API_KEY}&productCode=${productCode}&quantity=${quantity}`, {
            method: 'POST',
        });

        if (!response.ok) {
            // Try to get error message from API
            const errorData = await response.json().catch(() => ({ message: 'Failed to create order' }));
            return {
                statusCode: response.status,
                message: errorData.message || 'Failed to create order'
            };
        }

        return response.json();
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Internal Server Error'
        };
    }
}

export async function getOrder(orderCode: string) {
    // Mock order check
    if (orderCode.startsWith('MOCK-ORDER-')) {
        return {
            statusCode: 200,
            data: [
                { accountInformation: `user${Math.floor(Math.random() * 1000)}:pass${Math.floor(Math.random() * 1000)}|recovery_email:test@example.com` }
            ]
        };
    }

    const response = await fetch(`${MODDED_APPS_API_URL}/api/orders?apiKey=${MODDED_APPS_API_KEY}&orderCode=${orderCode}`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error('Failed to get order');
    }

    return response.json();
}
