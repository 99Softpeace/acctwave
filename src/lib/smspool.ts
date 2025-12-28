
const API_KEY = process.env.SMSPOOL_API_KEY || '';
const BASE_URL = 'https://api.smspool.net';

export interface SPCountry {
    id: string; // Country ID (e.g., '1' for US, '44' for UK)
    name: string;
    short_name: string; // 'US', 'GB'
}

export interface SPService {
    id: string; // Service ID (e.g., '123')
    name: string;
    price: number; // Price in USD usually
}

export interface SPOrder {
    order_id: string;
    number: string;
    country: string;
    service: string;
    status: string;
    code?: string;
    full_code?: string;
    expiry?: number;
}

export class SMSPool {
    private static async request(endpoint: string, params: Record<string, string> = {}): Promise<any> {
        // Log key presence (masked)
        if (!API_KEY) {
            console.error('SMSPOOL_API_KEY is missing in process.env');
            throw new Error('SMSPOOL_API_KEY is not set');
        } else {
            console.log('SMSPOOL_API_KEY is present');
        }

        const url = new URL(`${BASE_URL}${endpoint}`);
        url.searchParams.append('key', API_KEY);
        Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

        console.log(`SMSPool Request: ${url.toString().replace(API_KEY, '***')}`);

        const response = await fetch(url.toString(), { cache: 'no-store' });

        if (!response.ok) {
            throw new Error(`SMSPool API error: ${response.status}`);
        }

        const data = await response.json();

        // SMSPool often returns { success: 0, message: '...' } on error
        if (data.success === 0) {
            throw new Error(data.message || 'Unknown SMSPool error');
        }

        return data;
    }

    static async getCountries(): Promise<SPCountry[]> {
        try {
            console.log('Fetching SMSPool countries...');
            // Endpoint: /country/retrieve_all
            const data = await this.request('/country/retrieve_all');
            console.log(`Fetched ${data.length} countries from SMSPool`);

            // Response is array of objects
            return data.map((item: any) => ({
                id: item.ID,
                name: item.name,
                short_name: item.short_name
            }));
        } catch (error) {
            console.error('Failed to fetch SMSPool countries:', error);
            return [];
        }
    }

    static async getServices(countryId: string): Promise<SPService[]> {
        try {
            // Endpoint: /service/retrieve_all?country=ID
            // Note: SMSPool documentation says /service/retrieve_all returns a list of services.
            // The price field might be 'rate' or 'cost' or 'price'. 
            // Based on common API patterns, let's try to be robust.
            const data = await this.request('/service/retrieve_all');

            console.log('=== SMSPool getServices DEBUG ===');
            console.log('Total services received:', data.length);
            if (data.length > 0) {
                console.log('First service raw data:', JSON.stringify(data[0], null, 2));
                console.log('Available fields:', Object.keys(data[0]));
            }

            // Map to common format
            const services = data.map((item: any) => {
                const priceValue = item.rate || item.price || item.cost || '0';
                const parsedPrice = parseFloat(priceValue);

                if (data.indexOf(item) < 3) {
                    console.log(`Service "${item.name}": rate=${item.rate}, price=${item.price}, cost=${item.cost}, parsed=${parsedPrice}`);
                }

                return {
                    id: item.ID,
                    name: item.name,
                    price: parsedPrice
                };
            }).sort((a: SPService, b: SPService) => a.name.localeCompare(b.name));

            console.log('=== END DEBUG ===');
            return services;
        } catch (error) {
            console.error('Failed to fetch SMSPool services:', error);
            return [];
        }
    }

    static async getPrice(countryId: string, serviceId: string): Promise<number> {
        try {
            const data = await this.request('/request/price', {
                country: countryId,
                service: serviceId
            });
            return parseFloat(data.price);
        } catch (error) {
            return 0;
        }
    }

    static async orderSMS(countryId: string, serviceId: string): Promise<SPOrder> {
        // Endpoint: /purchase/sms
        const data = await this.request('/purchase/sms', {
            country: countryId,
            service: serviceId
        });

        return {
            order_id: data.order_id,
            number: data.number,
            country: data.country,
            service: data.service,
            status: 'pending',
            expiry: data.expiry
        };
    }

    static async checkOrder(orderId: string): Promise<SPOrder> {
        // Endpoint: /sms/check
        const data = await this.request('/sms/check', {
            orderid: orderId
        });

        return {
            order_id: orderId,
            number: data.number, // Might not be in check response
            country: '',
            service: '',
            status: mapStatus(data.status, data.sms || data.code), // Map numeric to string
            code: data.sms || data.code || data.verification_code || data.otp,
            full_code: data.full_sms || data.text || data.message || data.sms_content
        };
    }

    static async cancelOrder(orderId: string): Promise<void> {
        await this.request('/cancel/sms', {
            orderid: orderId
        });
    }
    static async getESIMPlans(countryCode: string): Promise<any[]> {
        try {
            // Endpoint: /esim/plans?country=CODE
            const data = await this.request('/esim/plans', {
                country: countryCode
            });

            // Parse network string if present
            return data.map((plan: any) => ({
                ...plan,
                network: typeof plan.network === 'string' ? JSON.parse(plan.network) : plan.network
            }));
        } catch (error) {
            console.error('Failed to fetch SMSPool eSIM plans:', error);
            return [];
        }
    }

    static async purchaseESIM(planId: string | number): Promise<any> {
        // Endpoint: /esim/purchase
        const data = await this.request('/esim/purchase', {
            plan: planId.toString()
        });
        return data;
    }
}

function mapStatus(status: number | string, code?: string): string {
    // If code exists, it's completed regardless of status
    if (code) return 'COMPLETED';

    // Map numeric status from SMSPool
    // 1 = Pending
    // 6 = Refunded/Cancelled (Inferred)
    // 3 = Completed ??
    // 13 = Expired ??

    // We treat 'waiting' in frontend as 'active'
    if (status == 1) return 'PENDING';
    if (status == 6) return 'REFUNDED';
    if (status == 13) return 'EXPIRED'; // Often 13 is used
    if (status == 3) return 'COMPLETED';

    // Fallback for strings
    if (typeof status === 'string') return status;

    return 'PENDING'; // Default to pending if unknown
}
