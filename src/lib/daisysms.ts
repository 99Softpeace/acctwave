

const API_KEY = process.env.DAISYSMS_API_KEY || '';
const BASE_URL = 'https://daisysms.com/stubs/handler_api.php';

export interface DaisyService {
    id: string;
    name: string;
    price: number;
    category?: string;
}

export interface DaisyRental {
    id: string;
    phone: string;
    service: string;
    status: 'active' | 'ready' | 'canceled' | 'completed';
    code?: string;
    expiresAt: number;
}

export class DaisySMS {
    private static async request(params: Record<string, string>): Promise<string> {
        if (!API_KEY) {
            console.warn('DAISYSMS_API_KEY is not set');
            throw new Error('API configuration missing');
        }

        try {
            const url = new URL(BASE_URL);
            url.searchParams.append('api_key', API_KEY);
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

            console.log('DaisySMS Request URL:', url.toString().replace(API_KEY, '***'));
            console.log('DaisySMS API Key Loaded:', !!API_KEY);

            const response = await fetch(url.toString());

            if (!response.ok) {
                const errorText = await response.text();
                console.error('DaisySMS HTTP Error:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const text = await response.text();
            return text;
        } catch (error: any) {
            console.error('DaisySMS API Error:', error.message);
            throw new Error(`Failed to communicate with SMS provider: ${error.message}`);
        }
    }


    static async getBalance(): Promise<number> {
        const response = await this.request({ action: 'getBalance' });
        // Response: ACCESS_BALANCE:50.30
        if (response.startsWith('ACCESS_BALANCE:')) {
            return parseFloat(response.split(':')[1]);
        }
        throw new Error(`Failed to get balance: ${response}`);
    }

    static readonly COUNTRIES: Record<string, { name: string; flag: string }> = {
        '187': { name: 'United States', flag: '🇺🇸' },
        '16': { name: 'United Kingdom', flag: '🇬🇧' },
        '15': { name: 'Canada', flag: '🇨🇦' },
        '6': { name: 'Germany', flag: '🇩🇪' },
        '73': { name: 'Netherlands', flag: '🇳🇱' },
        '139': { name: 'Nigeria', flag: '🇳🇬' }
    };

    static async getCountries(): Promise<DaisyService[]> { // Reusing DaisyService interface for simplicity or create new
        return Object.entries(this.COUNTRIES).map(([id, data]) => ({
            id,
            name: data.name,
            price: 0, // Not used for countries
            category: data.flag
        }));
    }

    static async getServices(countryId: string = '187'): Promise<DaisyService[]> {
        try {
            console.log(`[DaisySMS] Fetching services for country ${countryId}...`);
            const responseText = await this.request({ action: 'getPrices' });

            // Log first 100 chars to verify response structure
            console.log(`[DaisySMS] Raw Response (snippet): ${responseText.slice(0, 100)}`);

            const data = JSON.parse(responseText);
            const countryServices = data[countryId];

            if (!countryServices) {
                console.warn(`[DaisySMS] No services found for country ${countryId}. Available countries in response: ${Object.keys(data).join(', ')}`);
                return [];
            }

            const services: DaisyService[] = Object.entries(countryServices).map(([id, details]: [string, any]) => {
                const costUSD = parseFloat(details.cost);
                const EXCHANGE_RATE = 1750; // Base NGN/USD rate
                const PROFIT_MARGIN_PERCENT = 40; // 40% profit margin
                const multiplier = 1 + (PROFIT_MARGIN_PERCENT / 100); // 1.4x

                return {
                    id: id,
                    name: details.name,
                    // Price = Cost(USD) * ExchangeRate * (1 + Margin%)
                    price: Math.ceil(costUSD * EXCHANGE_RATE * multiplier)
                };
            });

            console.log(`[DaisySMS] Found ${services.length} services for country ${countryId}`);
            // Sort alphabetically by name
            return services.sort((a, b) => a.name.localeCompare(b.name));

        } catch (e) {
            console.error('[DaisySMS] Error parsing services', e);
            return [];
        }
    }

    static async rentNumber(service: string, maxPrice: number): Promise<DaisyRental> {
        // We use a high max_price (e.g. $5.00) to ensure the rental goes through.
        // The user is only charged the actual market price by DaisySMS.
        // The 'maxPrice' argument is kept for compatibility but overridden for the API call.
        const SAFE_MAX_PRICE = '5.00';

        const response = await this.request({
            action: 'getNumber',
            service,
            max_price: SAFE_MAX_PRICE
        });

        // Response: ACCESS_NUMBER:ID:PHONE
        if (response.startsWith('ACCESS_NUMBER:')) {
            const parts = response.split(':');
            return {
                id: parts[1],
                phone: parts[2],
                service,
                status: 'active',
                expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes default
            };
        }

        throw new Error(`Failed to rent number: ${response}`);
    }

    static async getStatus(id: string): Promise<{ status: string; code?: string }> {
        const response = await this.request({
            action: 'getStatus',
            id
        });

        // Responses:
        // STATUS_WAIT_CODE
        // STATUS_OK:CODE
        // STATUS_CANCEL

        if (response === 'STATUS_WAIT_CODE') {
            return { status: 'waiting' };
        }

        if (response.startsWith('STATUS_OK:')) {
            return {
                status: 'completed',
                code: response.split(':')[1]
            };
        }

        if (response === 'STATUS_CANCEL') {
            return { status: 'canceled' };
        }

        return { status: 'unknown' };
    }

    static async setStatus(id: string, status: 1 | 6 | 8): Promise<boolean> {
        // 1: Ready (already done by default?)
        // 6: Complete (ACCESS_ACTIVATION)
        // 8: Cancel (ACCESS_CANCEL)

        const response = await this.request({
            action: 'setStatus',
            id,
            status: status.toString()
        });

        return response === 'ACCESS_ACTIVATION' || response === 'ACCESS_CANCEL';
    }
    // --- Rental Methods ---

    static async getRentalServices(): Promise<any[]> {
        // DaisySMS doesn't have a specific "rental services" endpoint like TextVerified.
        // Usually, you rent a specific service for a duration.
        // However, we can fetch available services and filter/mark them.
        // For now, we'll return the standard services but adapted for rental UI.
        try {
            const services = await this.getServices();
            return services.map(s => ({
                id: s.id,
                name: s.name,
                price: s.price // Use the calculated price from getServices
            }));
        } catch (error) {
            console.error('Failed to fetch DaisySMS rental services:', error);
            return [];
        }
    }

    static async purchaseRental(serviceId: string, duration: number, unit: 'Days' | 'Weeks' | 'Months', areaCode?: string): Promise<any> {
        // DaisySMS primarily supports short-term rentals (activations) via API.
        // Long-term rentals are not standard via the 'handler_api.php' endpoint.
        // We will use the standard 'getNumber' for now, which gives a number for ~15-20 mins.

        // Note: The 'duration' parameter is largely ignored for standard activations 
        // as they are fixed time, but we keep the signature for compatibility.

        const SAFE_MAX_PRICE = '5.00'; // Allow up to $5, actual cost is deducted

        const params: Record<string, string> = {
            action: 'getNumber',
            service: serviceId,
            max_price: SAFE_MAX_PRICE
        };

        if (areaCode) {
            params.area = areaCode;
        }

        const response = await this.request(params);

        // Response: ACCESS_NUMBER:ID:PHONE
        if (response.startsWith('ACCESS_NUMBER')) {
            const parts = response.split(':');
            return {
                id: parts[1],
                phone: parts[2], // Changed from 'number' to 'phone' to match interface
                service: serviceId,
                status: 'active',
                expiresAt: Date.now() + (20 * 60 * 1000) // ~20 mins default for activations
            };
        }

        if (response === 'NO_NUMBERS') {
            throw new Error('No numbers available for this service currently.');
        }

        if (response === 'NO_BALANCE') {
            throw new Error('Insufficient funds on DaisySMS account.');
        }

        throw new Error(`DaisySMS Rental Error: ${response}`);
    }

    static async getRental(id: string): Promise<any> {
        // [MODIFIED] Check Activation Status instead of Rental Status
        // Since purchaseRental uses 'getNumber' (Standard Activation), we must use 'getStatus'
        try {
            const statusData = await this.getStatus(id);

            // Map Activation Status to Rental Interface
            if (statusData.status === 'completed' && statusData.code) {
                return {
                    id,
                    status: 'completed',
                    code: statusData.code,
                    messages: [{
                        id: Date.now().toString(),
                        sender: 'Service',
                        date: new Date().toISOString(),
                        text: `Your verification code is: ${statusData.code}`
                    }]
                };
            } else if (statusData.status === 'canceled') {
                return { id, status: 'canceled', messages: [] };
            } else {
                // STATUS_WAIT_CODE or similar
                return { id, status: 'active', messages: [] };
            }

        } catch (error) {
            console.error('Failed to get rental status:', error);
            return {
                id,
                status: 'error',
                messages: []
            };
        }
    }
}
