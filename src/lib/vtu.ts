const VTU_API_KEY = process.env.VTU_API_KEY;
const VTU_API_URL = process.env.VTU_API_URL || 'https://gladtidingsdata.com/api';

if (!VTU_API_KEY) {
    console.warn('VTU_API_KEY is not defined in environment variables');
}

// --- Types ---
export interface DataPlan {
    id: number;
    network: string;
    name: string;
    price: number;
    size: string;
    validity: string;
}

// --- API Functions ---

async function request(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Token ${VTU_API_KEY}`
    };

    const response = await fetch(`${VTU_API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`VTU API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
}

export async function getUserDetails() {
    // Based on "SaveUser" GET request in docs
    return request('/user/');
}

export async function purchaseAirtime(network: string, phone: string, amount: number) {
    // Assumed endpoint based on common patterns. 
    // User only provided DataCard docs, but asked for Airtime/Data.
    // We'll try /topup/ which is common for these platforms.
    return request('/topup/', 'POST', {
        network: getNetworkId(network),
        amount,
        mobile_number: phone,
        Ported_number: true,
        airtime_type: 'VTU'
    });
}

export async function purchaseData(network: string, phone: string, planId: number) {
    // Assumed endpoint
    return request('/data/', 'POST', {
        network: getNetworkId(network),
        mobile_number: phone,
        plan: planId,
        Ported_number: true
    });
}

export async function generateDataCard(planId: number, quantity: number, nameOnCard: string) {
    // Confirmed endpoint from docs
    return request('/data-card/', 'POST', {
        plan: planId,
        quantity,
        name_on_card: nameOnCard
    });
}

// --- Helpers ---

function getNetworkId(networkName: string): number {
    // Map network names to IDs (Common IDs, might need adjustment)
    const map: Record<string, number> = {
        'MTN': 1,
        'GLO': 2,
        'AIRTEL': 3,
        '9MOBILE': 4
    };
    return map[networkName.toUpperCase()] || 1;
}

import { STATIC_DATA_PLANS } from './vtu-plans';

// ... (existing code)

// Mock Data Plans (Using comprehensive static list)
export const DATA_PLANS = STATIC_DATA_PLANS;

