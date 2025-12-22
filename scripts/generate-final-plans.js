const fs = require('fs');
const plans = require('../ncwallet_plans.json');

// User Provided Prices
// We map Type + Size -> Method to Price
// Normalizing sizes: '1gb', '500mb', '1.5gb'

const USER_PRICES = {
    'MTN': {
        'AWOOF': {
            '1 GB': 520, '1.0 GB': 520,
            '2 GB': 780, '2.0 GB': 780,
            '2.5 GB': 920,
            '3.5 GB': 1600,
            '6 GB': 2550, '6.0 GB': 2550,
            '11 GB': 3600, '11.0 GB': 3600,
            '12.5 GB': 5550,
            '16.5 GB': 6500,
            '36 GB': 11450, '36.0 GB': 11450,
            '75 GB': 18450
        },
        'CORPORATE GIFTING': {
            '500 MB': 500,
            '1 GB': 780,
            '2 GB': 1500,
            '3 GB': 2150,
            '5 GB': 3600,
            '10 GB': 7050
        }
    },
    'GLO': {
        'SME': {
            '750 MB': 250,
            '1.5 GB': 350,
            '5 GB': 550,
            '10 GB': 2000
        },
        'CORPORATE GIFTING': {
            '1 GB': 350, // 3 days? Check validty logic later, focusing on price
            '3 GB': 850, // 3 days
            '5 GB': 1500, // 3 days
            // '1 GB': 380, // 7 days (DUPLICATE KEY CONFLICT - Will use Logic to distinguish or taking higher?)
            // '3 GB': 1050, // 7 days
            // '5 GB': 1750, // 7 days
            '10 GB': 2000
        },
        'GIFTING': {
            // Normalized string matching might be tricky here due to descriptions
            // "1.1GB + 1.5GB Night": 1020
            // "2GB + 3GB Night": 1500
        }
    },
    'AIRTEL': {
        'SME': {
            '750 MB': 200,
            '1.5 GB': 320,
            '2.5 GB': 550,
            '10 GB': 2000
        },
        'CORPORATE GIFTING': {
            '1 GB': 320,
            '3 GB': 900,
            '5 GB': 1500,
            '10 GB': 4400,
            '200 MB': 100
        }
    },
    '9MOBILE': {
        'SME': {
            '750 MB': 200,
            '1.5 GB': 350,
            '2.5 GB': 520,
            '10 GB': 2000
        },
        'CORPORATE GIFTING': {
            '3 GB': 920,
            '5 GB': 1500,
            '10 GB': 4400
        }
    }
};

// Helper to normalize size string from JSON "1 GB", "500 MB" to match Keys
function normalizeSize(size) {
    return size.trim();
}

// Logic for calculating price if not allowed
function calculatePrice(cost) {
    // Determine markup
    let markup = 0;
    if (cost < 200) markup = 50;
    else if (cost < 500) markup = 80;
    else if (cost < 1000) markup = 150;
    else if (cost < 3000) markup = 300;
    else if (cost < 5000) markup = 500;
    else markup = 800;

    // Round to nearest 10 for cleaner look
    return Math.ceil((cost + markup) / 10) * 10;
}

const finalPlans = [];
const seenIDs = new Set(); // Avoid duplicates if any

// Types mapping: JSON Type -> Our Enum
const TYPE_MAP = {
    'AWOOF': 'AWOOF',
    'CORPORATE GIFTING': 'CG', // User calls it CG
    'GIFTING': 'GIFTING',
    'SME': 'SME',
    'CG2': 'CG' // Treat CG2 as CG if needed
};

// Flatten JSON list
const allPlans = plans.data_list || [];

allPlans.forEach(p => {
    if (p.status !== 'enabled') return;

    // Normalize Network
    const net = p.network.toUpperCase();

    // Normalize Type
    // Map "MTN AWOOF" -> AWOOF
    let type = p.data_type; // e.g., "AWOOF", "CORPORATE GIFTING"

    // Manual overrides for user specific types
    if (type === 'CG2') type = 'CORPORATE GIFTING';

    const ourType = TYPE_MAP[type];
    if (!ourType) return; // Skip unknown types (or map to OTHERS?)

    // Find User Price
    let userPrice = null;
    const sizeKeys = [p.plan_size, p.plan_size.replace(' ', ''), p.plan_size.replace('.0', '')];

    // Check main mapping
    if (USER_PRICES[net] && USER_PRICES[net][type]) {
        for (const k of sizeKeys) {
            if (USER_PRICES[net][type][k]) {
                userPrice = USER_PRICES[net][type][k];
                break;
            }
        }
    }

    // Special handling for GLO Gifting complex names
    if (net === 'GLO' && type === 'GIFTING') {
        // p.plan_size = "1.1GB + 1.5GB Night, 2.6 GB"
        // User: "1.1GB + 1.5GB Night"
        if (p.plan_size.includes('1.1GB')) userPrice = 1020;
        if (p.plan_size.includes('2GB + 3GB')) userPrice = 1500;
        if (p.plan_size.includes('3.15GB')) userPrice = 2000;
        if (p.plan_size.includes('4.25GB')) userPrice = 2500;
        if (p.plan_size.includes('8GB + 2GB')) userPrice = 2950;
        if (p.plan_size.includes('10.5GB')) userPrice = 3950;
        if (p.plan_size.includes('13.5GB')) userPrice = 4900;
        if (p.plan_size.includes('18.5GB')) userPrice = 5900;
        if (p.plan_size.includes('26GB')) userPrice = 7900;
    }

    // Special handling for GLO CG days conflict (3days vs 7days)
    // p.validity = "3 Days" or "1 Week"
    if (net === 'GLO' && type === 'CORPORATE GIFTING') {
        if (p.plan_size === '1 GB') {
            if (p.validity.includes('3')) userPrice = 350;
            else if (p.validity.includes('Week') || p.validity.includes('7')) userPrice = 380;
        }
        if (p.plan_size === '3 GB') {
            if (p.validity.includes('3')) userPrice = 850;
            else if (p.validity.includes('Week')) userPrice = 1050;
        }
        if (p.plan_size === '5 GB') {
            if (p.validity.includes('3')) userPrice = 1500;
            else if (p.validity.includes('Week')) userPrice = 1750;
        }
    }

    // Parse numeric cost from "NGN 1,234.00"
    const cost = parseFloat(p.plan_price.replace(/[^\d.]/g, ''));

    const finalPrice = userPrice || calculatePrice(cost);

    finalPlans.push({
        id: p.plan_id,
        network: net,
        type: ourType,
        name: p.plan_size, // Keep original size string for display
        price: finalPrice,
        size: p.plan_size,
        validity: p.validity
    });
});

// Generate Code
const code = `
export interface DataPlan {
    id: number;
    network: 'MTN' | 'AIRTEL' | 'GLO' | '9MOBILE';
    type: 'AWOOF' | 'CG' | 'GIFTING' | 'SME' | 'DATA CARD';
    name: string;
    price: number;
    size: string;
    validity: string;
}

export const STATIC_DATA_PLANS: DataPlan[] = ${JSON.stringify(finalPlans, null, 4)};
`;

fs.writeFileSync('src/lib/vtu-plans.ts', code);
console.log(`Generated ${finalPlans.length} plans in src/lib/vtu-plans.ts`);
