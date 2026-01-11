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
        // The API expects an integer ID.
        // 1. Try to find by short_name (e.g. 'US', 'GB')
        // 2. Try to find by name (e.g. 'United States', 'United Kingdom')
        // 3. Fallback to the provided param if it looks like an ID
        let effectiveCountryId = countryId;

        const countryMatch = countriesData.find((c: any) =>
            c.short_name.toUpperCase() === countryId.toUpperCase() ||
            c.name.toLowerCase() === countryId.toLowerCase() ||
            c.id == countryId
        );

        if (countryMatch) {
            effectiveCountryId = countryMatch.id;
        } else if (countryId.toUpperCase() === 'UK') {
            // Special case for manual "UK" param often used
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

        console.log(`Fetching prices for ${servicesToFetch.length} services in country ${effectiveCountryId} (Req: ${countryId})...`);

        const servicesWithPrices = await Promise.all(
            servicesToFetch.map(async (s) => {
                try {
                    // Timeout race logic
                    const pricePromise = SMSPool.getPrice(effectiveCountryId, s.id);
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000));
                    const priceUSD = await Promise.race([pricePromise, timeoutPromise]) as number;

                    let margin = 70; // Default

                    if (effectiveCountryId === '1') {
                        margin = 600;
                    } else {
                        // Non-US: Increase margin to 800% EXCEPT for WhatsApp and Telegram
                        const nameLower = s.name.toLowerCase();
                        if (!nameLower.includes('whatsapp') && !nameLower.includes('telegram')) {
                            margin = 800;
                        }
                    }

                    let finalPrice = calculatePrice(priceUSD, margin);

                    // Custom Overrides for USA (ID 1)
                    if (effectiveCountryId === '1') {
                        if (s.name.toLowerCase().includes('snapchat')) {
                            finalPrice = 1600;
                        } else if (s.name.toLowerCase().includes('telegram')) {
                            finalPrice = 3800;
                        } else if (s.name.toLowerCase().includes('twitter') || s.name.toLowerCase().includes('x')) {
                            finalPrice = 1380;
                        } else if (s.name.toLowerCase().includes('facebook')) {
                            finalPrice = 2980;
                        } else if (s.name.toLowerCase().includes('discord')) {
                            finalPrice = 1680;
                        } else if (s.name.toLowerCase().includes('whatsapp')) {
                            finalPrice = 3927;
                        } else if (s.name.toLowerCase().includes('signal')) {
                            finalPrice = 1680;
                        }
                    }

                    return {
                        id: s.id,
                        name: s.name,
                        price: finalPrice
                    };
                } catch (error) {
                    let margin = 70; // Default

                    if (effectiveCountryId === '1') {
                        margin = 600;
                    } else {
                        const nameLower = s.name.toLowerCase();
                        if (!nameLower.includes('whatsapp') && !nameLower.includes('telegram')) {
                            margin = 800;
                        }
                    }

                    let fallbackPrice = calculatePrice(0.5, margin);

                    // Custom Overrides for USA (ID 1)
                    if (effectiveCountryId === '1') {
                        if (s.name.toLowerCase().includes('snapchat')) {
                            fallbackPrice = 1600;
                        } else if (s.name.toLowerCase().includes('telegram')) {
                            fallbackPrice = 3800;
                        } else if (s.name.toLowerCase().includes('twitter') || s.name.toLowerCase().includes('x')) {
                            fallbackPrice = 1380;
                        } else if (s.name.toLowerCase().includes('facebook')) {
                            fallbackPrice = 2980;
                        } else if (s.name.toLowerCase().includes('discord')) {
                            fallbackPrice = 1680;
                        } else if (s.name.toLowerCase().includes('whatsapp')) {
                            fallbackPrice = 3927;
                        } else if (s.name.toLowerCase().includes('signal')) {
                            fallbackPrice = 1680;
                        }
                    }

                    return {
                        id: s.id,
                        name: s.name,
                        price: fallbackPrice
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
