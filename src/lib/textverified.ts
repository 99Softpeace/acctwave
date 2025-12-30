
const API_KEY = process.env.TEXTVERIFIED_API_KEY || '';
const BASE_URL = 'https://www.textverified.com/api/v2';

export interface TVService {
    id: string; // targetId
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

    private static async getBearerToken(): Promise<string> {
        // If we have a valid token, use it
        const currentToken = this.token;
        if (currentToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return currentToken;
        }

        const email = process.env.TEXTVERIFIED_EMAIL;
        if (!email) {
            throw new Error('TEXTVERIFIED_EMAIL is not set in .env');
        }
        if (!API_KEY) {
            throw new Error('TEXTVERIFIED_API_KEY is not set');
        }

        console.log('Generating new TextVerified Bearer Token...');

        const authString = Buffer.from(`${email}:${API_KEY}`).toString('base64');
        const response = await fetch(`${BASE_URL}/authentication`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json' // Even if no body, usually good practice
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('TextVerified Auth Error:', response.status, errorText.substring(0, 200));
            throw new Error(`Failed to authenticate with TextVerified: ${response.status} ${errorText.substring(0, 100)}...`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('TextVerified Auth Invalid Content-Type:', contentType, text.substring(0, 200));
            throw new Error('Auth returned non-JSON response');
        }

        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.error('TextVerified Auth JSON Parse Error:', e);
            throw new Error('Failed to parse Auth response');
        }

        // Use token or bearer_token depending on response structure.
        // Documentation implies 'token' or 'bearer_token'. 
        // We'll check both or dump response if debugging needed.
        // Assuming standard response: { "token": "...", "expiration": "..." } or similar

        const token = data.bearer_token || data.token || data.access_token;
        if (!token) {
            console.error('TextVerified Auth Response:', data);
            throw new Error('No token found in TextVerified auth response');
        }

        // Set expiry (default 24h if not provided, or parse valid_until/expiration)
        // Usually data.expiration is ISO string. 
        // Let's assume 30 mins to be safe if unknown, or parse it.
        let expiryTime = Date.now() + (30 * 60 * 1000); // 30 mins default
        if (data.expiration) {
            expiryTime = new Date(data.expiration).getTime();
        } else if (data.valid_until) {
            expiryTime = new Date(data.valid_until).getTime();
        }

        this.token = token;
        this.tokenExpiry = expiryTime - (60 * 1000); // Expire 1 min early

        console.log('TextVerified Bearer Token generated successfully');
        return token;
    }

    private static async request(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<any> {
        if (!API_KEY) {
            throw new Error('TEXTVERIFIED_API_KEY is not set');
        }

        // Get Token
        let token;
        try {
            token = await this.getBearerToken();
        } catch (error) {
            // Fallback: Try using API Key directly if Auth fails (Legacy/Simple Auth)
            // But log the error clearly
            console.warn('Bearer Token generation failed, falling back to Simple Auth (API Key):', error);
            token = API_KEY;
            // Note: If using API Key directly, the prefix is usually 'Bearer' still, or 'Simple'? 
            // Docs say "Simple Authentication uses your access token... as a Bearer token". 
            // So if `token` is just API_KEY, usage below `Bearer ${token}` is likely correct for Simple Auth too.
        }

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log(`TextVerified Request: ${method} ${BASE_URL}${endpoint}`);

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`TextVerified Error (${endpoint}):`, response.status, errorText.substring(0, 200)); // Log only start clearly
            throw new Error(`TextVerified API error: ${response.status} ${errorText.substring(0, 100)}...`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error(`TextVerified Invalid Content-Type (${endpoint}): ${contentType}`, text.substring(0, 200));
            throw new Error(`TextVerified returned non-JSON response (likely Cloudflare block): ${text.substring(0, 50)}...`);
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
            const data = await this.request('/targets');
            return data.map((item: any) => ({
                id: item.targetId.toString(),
                name: item.name,
                cost: item.cost
            })).sort((a: TVService, b: TVService) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error('Failed to fetch TextVerified services:', error);
            return [];
        }
    }

    static async createVerification(targetId: string): Promise<TVVerification> {
        const data = await this.request('/verifications', 'POST', {
            id: parseInt(targetId)
        });

        return {
            id: data.id,
            number: data.number,
            service: data.target_name || 'Unknown',
            status: data.status,
            time_remaining: data.time_remaining
        };
    }

    static async getVerification(id: string): Promise<TVVerification> {
        const data = await this.request(`/verifications/${id}`);

        return {
            id: data.id,
            number: data.number,
            service: data.target_name,
            status: data.status,
            code: data.code,
            sms: data.sms,
            time_remaining: data.time_remaining
        };
    }

    static async cancelVerification(id: string): Promise<void> {
        await this.request(`/verifications/${id}/cancel`, 'POST');
    }

    // --- Rental Methods ---

    static async getRentalServices(): Promise<TVService[]> {
        try {
            console.log('Fetching TextVerified rental targets...');
            // Attempting to fetch from /targets first as a fallback if /rental/targets doesn't exist,
            // but ideally we want specific rental targets.
            // Let's try /targets?type=rental if possible, or just /targets and assume all are available?
            // No, rentals are distinct.
            // Let's try the assumed endpoint.
            const data = await this.request('/rental/targets');
            console.log(`Fetched ${data.length} rental targets`);

            return data.map((item: any) => ({
                id: item.id.toString(),
                name: item.name,
                cost: item.cost
            })).sort((a: TVService, b: TVService) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error('Failed to fetch TextVerified rental services:', error);
            return [];
        }
    }

    static async purchaseRental(targetId: string, duration: number, unit: 'Days' | 'Weeks' | 'Months', areaCode?: string): Promise<TVVerification> {
        const payload: any = {
            targetId: parseInt(targetId),
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
            service: data.target_name || 'Unknown',
            status: 'Pending',
            time_remaining: 'Calculating...'
        };
    }

    static async getRental(id: string): Promise<TVVerification> {
        const data = await this.request(`/rentals/${id}`);
        return {
            id: data.id,
            number: data.number,
            service: data.target_name,
            status: data.status,
            code: data.messages?.[0]?.message,
            sms: data.messages?.[0]?.message,
            time_remaining: data.time_remaining
        };
    }
}
