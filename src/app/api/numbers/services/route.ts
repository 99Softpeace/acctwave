import { NextResponse } from 'next/server';

import { SMSPool } from '@/lib/smspool';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable all caching

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('country') || 'US'; // Default to US

    try {
        let services: any[] = [];
        let countries = [];

        // Fetch Countries
        const countriesData = await SMSPool.getCountries();

        // Filter and Map
        countries = countriesData
            .map((c: any) => ({
                id: c.id, // e.g. '1' for US
                name: c.name,
                code: c.short_name,
                flag: getFlagEmoji(c.short_name)
            }))
            .sort((a: any, b: any) => a.name.localeCompare(b.name));

        // Determine effective Country ID for SMSPool
        // If frontend sends 'US', map it to '1' (SMSPool United States)
        let effectiveCountryId = countryId;
        if (countryId === 'US') {
            effectiveCountryId = '1';
        }

        // Fetch Services using SMSPool for ALL countries (including US)
        const spServices = await SMSPool.getServices(effectiveCountryId);

        const popularServices = ['WhatsApp', 'Telegram', 'Facebook', 'Instagram', 'Twitter', 'Google', 'TikTok', 'Snapchat', 'Uber', 'Netflix', 'Discord', 'Amazon', 'PayPal', 'LinkedIn', 'Microsoft', 'Yahoo', 'Apple', 'Tinder', 'Viber', 'WeChat'];

        const prioritizedServices = spServices.filter(s => popularServices.some(p => s.name.toLowerCase().includes(p.toLowerCase())));
        const otherServices = spServices.filter(s => !popularServices.some(p => s.name.toLowerCase().includes(p.toLowerCase())));

        const servicesToFetch = [...prioritizedServices, ...otherServices].slice(0, 40);

        console.log(`Fetching prices for ${servicesToFetch.length} services in country ${effectiveCountryId} (Req: ${countryId})...`);

        const servicesWithPrices = await Promise.all(
            servicesToFetch.map(async (s) => {
                try {
                    // Timeout race logic
                    const pricePromise = SMSPool.getPrice(effectiveCountryId, s.id);
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000));
                    const priceUSD = await Promise.race([pricePromise, timeoutPromise]) as number;

                    return {
                        id: s.id,
                        name: s.name,
                        price: calculatePrice(priceUSD, 'SMSPOOL')
                    };
                } catch (error) {
                    return {
                        id: s.id,
                        name: s.name,
                        price: calculatePrice(0.5, 'SMSPOOL') // Fallback
                    };
                }
            })
        );

        services = servicesWithPrices.filter(s => s.price > 0);

        return NextResponse.json({
            success: true,
            services,
            countries
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch services' }, { status: 500 });
    }
}

function calculatePrice(costUSD: number, provider: 'TV' | 'SMSPOOL' = 'TV'): number {
    const EXCHANGE_RATE = 1750; // Base NGN/USD rate

    let margin = 70; // Default 70% for SMSPool/Others
    if (provider === 'TV') {
        margin = 400; // 400% for TextVerified (USA Premium)
    }

    const multiplier = 1 + (margin / 100);
    return Math.ceil(costUSD * EXCHANGE_RATE * multiplier);
}

function getFlagEmoji(countryCode: string) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}
