
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
    private static async request(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<any> {
        if (!API_KEY) {
            throw new Error('TEXTVERIFIED_API_KEY is not set');
        }

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${API_KEY}`,
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
            console.error(`TextVerified Error (${endpoint}):`, response.status, errorText);
            throw new Error(`TextVerified API error: ${response.status} ${errorText}`);
        }

        return response.json();
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
