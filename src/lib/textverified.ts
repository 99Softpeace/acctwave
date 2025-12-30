import { HttpsProxyAgent } from 'https-proxy-agent';

const API_KEY = process.env.TEXTVERIFIED_API_KEY || '';
const BASE_URL = 'https://www.textverified.com/api/pub/v2';

export interface TVService {
    id: string; // serviceName (string) for V2
    name: string;
    cost: number;
}

export interface TVVerification {
    id: string;
    number: string;
    service: string;
    status: 'Pending' | 'Completed' | 'Timed Out' | 'Cancelled';
    code?: string;
    sms?: string;
    time_remaining?: string;
}

export class TextVerified {
    private static token: string | null = null;
    private static tokenExpiry: number | null = null;
    public static debugLog: string[] = [];

    private static getAgent() {
        // [FIX] Disabled proxy for V2 public API
        return undefined;
    }

    private static async getBearerToken(): Promise<string> {
        const currentToken = this.token;
        if (currentToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return currentToken;
        }

        const email = process.env.TEXTVERIFIED_EMAIL;
        if (!email) {
            throw new Error('TEXTVERIFIED_EMAIL is not set in .env');
        }

        const agent = this.getAgent();

        const response = await fetch(`${BASE_URL}/auth`, {
            method: 'POST',
            headers: {
                'X-API-KEY': API_KEY,
                'X-API-USERNAME': email,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            // @ts-ignore
            agent: agent,
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('TextVerified Auth Error:', response.status, errorText.substring(0, 200));
            throw new Error(`Failed to authenticate with TextVerified: ${response.status} ${errorText.substring(0, 100)}...`);
        }

        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.error('TextVerified Auth JSON Parse Error:', e);
            throw new Error('Auth returned non-JSON response');
        }

        const token = data.token || data.bearer_token;
        if (!token) {
            throw new Error('No token found in TextVerified auth response');
        }

        let expiryTime = Date.now() + (30 * 60 * 1000);
        if (data.expiration) {
            expiryTime = new Date(data.expiration).getTime();
        }

        this.token = token;
        // Expire 1 minute early to be safe
        this.tokenExpiry = expiryTime - (60 * 1000);

        return token;
    }

    private static async request(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<any> {
        let token;
        try {
            token = await this.getBearerToken();
        } catch (error) {
            console.warn('Bearer Token generation failed:', error);
            throw error;
        }

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const agent = this.getAgent();

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            // @ts-ignore
            agent: agent,
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`TextVerified Error (${endpoint}):`, response.status, errorText.substring(0, 200));
            throw new Error(`TextVerified API error: ${response.status} ${errorText.substring(0, 100)}...`);
        }

        try {
            return await response.json();
        } catch (e) {
            console.error('TextVerified JSON Parse Error:', e);
            throw new Error('Failed to parse TextVerified response');
        }
    }

    static async getServices(): Promise<TVService[]> {
        try {
            // [FIX] V2 returns { serviceName, capability } but no serviceId/cost sometimes
            const data = await this.request('/services?reservationType=verification&numberType=mobile');

            if (!Array.isArray(data)) return [];

            return data
                .filter((item: any) => item.serviceName || item.serviceId || item.targetId)
                .map((item: any) => {
                    const id = (item.serviceId || item.targetId || item.serviceName || '').toString();
                    const name = item.name || item.serviceName || item.targetName || 'Unknown';
                    // [FIX] Use manual pricing map for common services to ensure variance
                    // default to 2.50 if not found
                    const COST_MAP: { [key: string]: number } = {
                        'amazon': 2.0, 'whatsapp': 3.5, 'telegram': 3.0, 'google': 2.5,
                        'facebook': 2.0, 'instagram': 2.0, 'tiktok': 1.5, 'uber': 2.0,
                        'twitter': 2.0, 'snapchat': 1.5, 'linkedin': 2.0, 'microsoft': 2.0,
                        'discord': 1.5, 'openai': 2.5, 'chatgpt': 2.5, 'netflix': 1.5,
                        'coinbase': 2.5, 'venmo': 2.5, 'paypal': 2.5, 'apple': 2.0,
                        'tinder': 2.0, 'bumble': 2.0, 'hinge': 2.0, 'grindr': 2.0,
                        'kakao': 1.5, 'kakaotalk': 1.5, 'viber': 1.5, 'wechat': 3.0,
                        'line': 1.5, 'signal': 1.5, 'botim': 1.5, 'imo': 1.5
                    };

                    const lookupName = (item.serviceName || item.name || '').toLowerCase();
                    const cost = COST_MAP[lookupName] || item.cost || item.price || 2.50;

                    if (lookupName === 'whatsapp') {
                        TextVerified.debugLog.push(`[TV DEBUG] Found WhatsApp. Lookup: '${lookupName}'. Cost Map value: ${COST_MAP[lookupName]}. Final Cost: ${cost}`);
                    }

                    return { id, name, cost };
                })
                // [FIX] Deduplicate by name to prevent React key errors
                .filter((item, index, self) =>
                    index === self.findIndex((t) => t.name === item.name)
                )
                .sort((a: TVService, b: TVService) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error('Failed to fetch TextVerified services:', error);
            return [];
        }
    }

    static async createVerification(targetId: string): Promise<TVVerification> {
        // [FIX] V2 uses serviceName (string) as ID. Do NOT parseInt.
        // Send 'id' as the service identifier.
        const data = await this.request('/verifications', 'POST', {
            id: targetId
        });

        return {
            id: data.id,
            number: data.number,
            service: data.service_name || data.target_name || 'Unknown',
            status: data.status,
            time_remaining: data.time_remaining
        };
    }

    static async getVerification(id: string): Promise<TVVerification> {
        const data = await this.request(`/verifications/${id}`);

        return {
            id: data.id,
            number: data.number,
            service: data.service_name || data.target_name,
            status: data.status,
            code: data.code,
            sms: data.sms,
            time_remaining: data.time_remaining
        };
    }

    static async cancelVerification(id: string): Promise<void> {
        await this.request(`/verifications/${id}/cancel`, 'POST');
    }

    static async getRentalServices(): Promise<TVService[]> {
        try {
            const data = await this.request('/services?reservationType=renewable&numberType=mobile');

            if (!Array.isArray(data)) return [];

            return data
                .filter((item: any) => item.serviceName || item.serviceId || item.targetId)
                .map((item: any) => {
                    const id = (item.serviceId || item.targetId || item.serviceName || '').toString();
                    const name = item.name || item.serviceName || 'Unknown';
                    // [FIX] Default cost to 4.0 for rentals (Approximation since API hides it)
                    const cost = item.cost || 4.0;
                    return { id, name, cost };
                })
                // [FIX] Deduplicate by name to prevent React key errors
                .filter((item, index, self) =>
                    index === self.findIndex((t) => t.name === item.name)
                )
                .sort((a: TVService, b: TVService) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error('Failed to fetch TextVerified rental services:', error);
            return [];
        }
    }

    static async purchaseRental(targetId: string, duration: number, unit: 'Days' | 'Weeks' | 'Months', areaCode?: string): Promise<TVVerification> {
        // [FIX] Use string ID for V2
        const payload: any = {
            id: targetId,
            duration,
            unit
        };

        if (areaCode) {
            payload.areaCode = areaCode;
        }

        const data = await this.request('/rentals', 'POST', payload);

        return {
            id: data.id,
            number: data.number,
            service: data.service_name || 'Unknown',
            status: 'Pending',
            time_remaining: 'Calculating...'
        };
    }

    static async getRental(id: string): Promise<TVVerification> {
        const data = await this.request(`/rentals/${id}`);
        return {
            id: data.id,
            number: data.number,
            service: data.service_name,
            status: data.status,
            code: data.messages?.[0]?.message,
            sms: data.messages?.[0]?.message,
            time_remaining: data.time_remaining
        };
    }
}
