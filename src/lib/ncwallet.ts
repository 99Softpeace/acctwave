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
    return { status: res.status, data };
}

export async function purchaseAirtime(network: string, phone: string, amount: number, ref: string) {
    const networkId = NETWORKS[network.toUpperCase()];
    if (!networkId) throw new Error('Invalid Network');

    return request('/airtime', 'POST', {
        ref_id: ref,
        network: networkId,
        country_code: 'NG',
        phone_number: phone,
        airtime_type: 'VTU',
        amount: amount.toString(),
        bypass: true // Ensure duplicate check doesn't block legitimate retries if needed, or set false
    });
}

export async function purchaseData(network: string, phone: string, planId: number, ref: string) {
    const networkId = NETWORKS[network.toUpperCase()];
    if (!networkId) throw new Error('Invalid Network');

    return request('/data', 'POST', {
        ref_id: ref,
        country_code: 'NG',
        network: networkId,
        data_plan: planId.toString(),
        phone_number: phone,
        bypass: true // As per docs example
    });
}

// Fetch balance or other services if needed
export async function getBalance() {
    return request('/user/balance', 'GET');
}
