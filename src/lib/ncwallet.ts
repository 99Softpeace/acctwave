
import { STATIC_DATA_PLANS } from './vtu-plans';

export const DATA_PLANS = STATIC_DATA_PLANS;

const BASE_URL = 'https://ncwallet.africa/api/v1';

// Server-side only check to avoid leaking keys
const API_KEY = process.env.NCWALLET_API_KEY;
const PIN = process.env.NCWALLET_PIN;

if (!API_KEY || !PIN) {
    if (typeof window === 'undefined') { // Only warn on server
        console.warn('NCWallet credentials missing in environment variables');
    }
}

type NetworkID = 1 | 2 | 3 | 4;

export const NETWORKS: Record<string, NetworkID> = {
    'MTN': 1,
    'AIRTEL': 2,
    'GLO': 3,
    '9MOBILE': 4
};

async function request(endpoint: string, method: 'GET' | 'POST', body?: any) {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `nc_afr_apikey${API_KEY}`,
        'trnx_pin': PIN || ''
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || `API Error: ${res.status}`);
    }
    return data;
}

export async function purchaseAirtime(network: string, phone: string, amount: number, ref?: string) {
    const networkId = NETWORKS[network.toUpperCase()];
    if (!networkId) throw new Error('Invalid Network');

    // Auto-generate ref if not provided
    const reference = ref || `AIR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return request('/airtime', 'POST', {
        ref_id: reference,
        network: networkId,
        country_code: 'NG',
        phone_number: phone,
        airtime_type: 'VTU',
        amount: amount.toString(),
        bypass: false // We want normal processing
    });
}

export async function purchaseData(network: string, phone: string, planId: number, ref?: string) {
    const networkId = NETWORKS[network.toUpperCase()];
    if (!networkId) throw new Error('Invalid Network');

    // Auto-generate ref if not provided
    const reference = ref || `DAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return request('/data', 'POST', {
        ref_id: reference,
        country_code: 'NG',
        network: networkId,
        data_plan: planId.toString(),
        phone_number: phone,
        bypass: false
    });
}

// Stub to prevent errors if called, though likely not supported by NCWallet same way
export async function generateDataCard(planId: number, quantity: number, nameOnCard: string) {
    throw new Error('Data Card generation not supported by this provider');
}

// Fetch balance and profile
export async function getBalance() {
    // Expects POST to /user based on docs
    return request('/user', 'POST', {});
}
