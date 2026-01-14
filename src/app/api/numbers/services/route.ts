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
        let countriesData = await SMSPool.getCountries();

        // FAILSAFE: If API returns 0 countries (Rate Limit), use Fallback
        if (!countriesData || countriesData.length === 0) {
            console.warn('SMSPool Countries API failed/empty. Using Fallback Countries.');
            countriesData = [
                { id: '1', name: 'United States', short_name: 'US' },
                { id: '44', name: 'United Kingdom', short_name: 'GB' },
                { id: '7', name: 'Russia', short_name: 'RU' },
                { id: '380', name: 'Ukraine', short_name: 'UA' },
                { id: '49', name: 'Germany', short_name: 'DE' },
                { id: '31', name: 'Netherlands', short_name: 'NL' },
                { id: '33', name: 'France', short_name: 'FR' },
                { id: '34', name: 'Spain', short_name: 'ES' },
                { id: '62', name: 'Indonesia', short_name: 'ID' },
                { id: '84', name: 'Vietnam', short_name: 'VN' },
                { id: '234', name: 'Nigeria', short_name: 'NG' }
            ];
        }

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
        let effectiveCountryId = countryId;

        const countryMatch = countriesData.find((c: any) =>
            c.short_name.toUpperCase() === countryId.toUpperCase() ||
            c.name.toLowerCase() === countryId.toLowerCase() ||
            c.id == countryId
        );

        if (countryMatch) {
            effectiveCountryId = countryMatch.id;
        } else if (countryId.toUpperCase() === 'UK') {
            const ukMatch = countriesData.find((c: any) => c.short_name === 'GB' || c.name === 'United Kingdom');
            if (ukMatch) effectiveCountryId = ukMatch.id;
        }

        // Fetch Services using SMSPool for ALL countries (including US)
        const spServices = await SMSPool.getServices(effectiveCountryId);

        const popularServices = ['WhatsApp', 'Telegram', 'Facebook', 'Instagram', 'Twitter', 'Google', 'TikTok', 'Snapchat', 'Uber', 'Netflix', 'Discord', 'Amazon', 'PayPal', 'LinkedIn', 'Microsoft', 'Yahoo', 'Apple', 'Tinder', 'Viber', 'WeChat', 'Signal'];

        const prioritizedServices = spServices.filter(s => popularServices.some(p => s.name.toLowerCase().includes(p.toLowerCase())));
        const otherServices = spServices.filter(s => !popularServices.some(p => s.name.toLowerCase().includes(p.toLowerCase())));

        // Increase limit to 500 to catch more services
        const servicesToFetch = [...prioritizedServices, ...otherServices].slice(0, 500);

        console.log('Countries found:', countries.length);
        console.log('Effective Country ID:', effectiveCountryId);
        console.log('Raw Services found:', spServices.length);
        console.log(`Processing ${servicesToFetch.length} services in country ${effectiveCountryId} (Req: ${countryId})...`);

        // Batch processing helper to avoid timeouts
        const batchSize = 50;
        const results = [];

        // FAILSAFE: If API returns 0 services (e.g. Rate Limit 429), use a Hardcoded Fallback List for US
        // This ensures the main services are ALWAYS visible and purchasable.
        if (effectiveCountryId === '1' && servicesToFetch.length === 0) {
            console.warn('SMSPool API returned 0 services (Rate Limited?). Using Fallback List.');
            const FALLBACK_SERVICES = [
                { id: 'WhatsApp', name: 'WhatsApp', price: 0 },
                { id: 'Telegram', name: 'Telegram', price: 0 },
                { id: 'Facebook', name: 'Facebook', price: 0 },
                { id: 'Instagram', name: 'Instagram', price: 0 },
                { id: 'Twitter', name: 'Twitter / X', price: 0 },
                { id: 'Google', name: 'Google / Gmail', price: 0 },
                { id: 'TikTok', name: 'TikTok', price: 0 },
                { id: 'Discord', name: 'Discord', price: 0 },
                { id: 'Snapchat', name: 'Snapchat', price: 0 },
                { id: 'Uber', name: 'Uber', price: 0 },
                { id: 'Amazon', name: 'Amazon', price: 0 },
                { id: 'Netflix', name: 'Netflix', price: 0 },
                { id: 'PayPal', name: 'PayPal', price: 0 },
                { id: 'Microsoft', name: 'Microsoft', price: 0 },
                { id: 'Yahoo', name: 'Yahoo', price: 0 },
                { id: 'Apple', name: 'Apple', price: 0 },
                { id: 'Signal', name: 'Signal', price: 0 },
                { id: 'Viber', name: 'Viber', price: 0 },
                { id: 'WeChat', name: 'WeChat', price: 0 }
            ];
            servicesToFetch.push(...FALLBACK_SERVICES);
        }

        for (let i = 0; i < servicesToFetch.length; i += batchSize) {
            const batch = servicesToFetch.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(async (s) => {
                    try {
                        let finalPrice = 0;
                        const nameLower = s.name.toLowerCase();

                        // 1. Check for Static Overrides FIRST (Skip API call if matched)
                        // Custom Overrides for USA (ID 1)
                        if (effectiveCountryId === '1') {
                            if (nameLower.includes('snapchat')) {
                                return { id: s.id, name: s.name, price: 1600 };
                            } else if (nameLower.includes('telegram')) {
                                return { id: s.id, name: s.name, price: 3800 };
                            } else if (nameLower.includes('twitter') || nameLower.includes('x')) {
                                return { id: s.id, name: s.name, price: 1380 };
                            } else if (nameLower.includes('facebook')) {
                                return { id: s.id, name: s.name, price: 2980 };
                            } else if (nameLower.includes('discord')) {
                                return { id: s.id, name: s.name, price: 1680 };
                            } else if (nameLower.includes('whatsapp')) {
                                return { id: s.id, name: s.name, price: 3927 };
                            } else if (nameLower.includes('signal')) {
                                return { id: s.id, name: s.name, price: 1680 };
                            }
                        }

                        // 2. If no override, fetch price with timeout
                        const pricePromise = SMSPool.getPrice(effectiveCountryId, s.id);
                        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 4000)); // Increased timeout slightly
                        const priceUSD = await Promise.race([pricePromise, timeoutPromise]) as number;

                        let margin = 70; // Default

                        if (effectiveCountryId === '1') {
                            margin = 600;
                        } else {
                            // Non-US: Increase margin to 800% EXCEPT for WhatsApp and Telegram
                            if (!nameLower.includes('whatsapp') && !nameLower.includes('telegram')) {
                                margin = 800;
                            }
                        }

                        finalPrice = calculatePrice(priceUSD, margin);

                        return {
                            id: s.id,
                            name: s.name,
                            price: finalPrice
                        };
                    } catch (error) {
                        // If fetching fails, DO NOT return a fallback price. 
                        // It is better to filter out the service than show a wrong/fluctuating price.
                        return null;
                    }
                })
            );
            results.push(...batchResults);
        }

        // Filter out nulls (failed fetches) and zero prices
        services = results.filter(s => s && s.price > 0);

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

function calculatePrice(costUSD: number, margin: number = 70): number {
    const EXCHANGE_RATE = 1750; // Base NGN/USD rate
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
