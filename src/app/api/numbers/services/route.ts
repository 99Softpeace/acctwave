import { NextResponse } from 'next/server';
import { TextVerified } from '@/lib/textverified';
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
        // We manually add US for TextVerified, and fetch others from SMSPool
        const smsPoolCountries = await SMSPool.getCountries();
        // console.log('SMSPool Countries (First 5):', JSON.stringify(smsPoolCountries.slice(0, 5)));

        // Filter out US from SMSPool
        const otherCountries = smsPoolCountries
            .filter((c: any) =>
                c.short_name !== 'US' &&
                c.name !== 'United States' &&
                c.id !== 'US' &&
                c.short_name !== 'US_V' &&
                c.id !== 22 && // ID for United States (Virtual)
                !c.name.includes('United States')
            )
            .map((c: any) => ({
                id: c.id,
                name: c.name,
                code: c.short_name,
                flag: getFlagEmoji(c.short_name)
            }));

        // Sort countries alphabetically
        otherCountries.sort((a: any, b: any) => a.name.localeCompare(b.name));

        countries = otherCountries;

        // Fetch Services based on selected country
        if (countryId === 'US') {
            try {
                // Fetch from TextVerified
                const tvServices = await TextVerified.getServices();

                // Map to unified format
                // TextVerified returns: { id, name, cost }
                // We need: { id, name, price }
                services = tvServices.map(s => ({
                    id: s.id,
                    name: s.name,
                    price: calculatePrice(s.cost)
                }));

            } catch (error) {
                console.error('Error fetching TextVerified services:', error);
                services = [];
            }
        }
        // Logic for other countries (SMSPool)
        else {
            // For other countries...
            const spServices = await SMSPool.getServices(countryId);
            // ... (rest of existing logic for other countries)

            const popularServices = ['WhatsApp', 'Telegram', 'Facebook', 'Instagram', 'Twitter', 'Google', 'TikTok', 'Snapchat', 'Uber', 'Netflix', 'Discord', 'Amazon', 'PayPal', 'LinkedIn', 'Microsoft', 'Yahoo', 'Apple', 'Tinder', 'Viber', 'WeChat'];

            const prioritizedServices = spServices.filter(s => popularServices.some(p => s.name.toLowerCase().includes(p.toLowerCase())));
            const otherServices = spServices.filter(s => !popularServices.some(p => s.name.toLowerCase().includes(p.toLowerCase())));

            const servicesToFetch = [...prioritizedServices, ...otherServices].slice(0, 40);

            console.log(`Fetching prices for ${servicesToFetch.length} services in country ${countryId}...`);

            const servicesWithPrices = await Promise.all(
                servicesToFetch.map(async (s) => {
                    try {
                        const pricePromise = SMSPool.getPrice(countryId, s.id);
                        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000));
                        const priceUSD = await Promise.race([pricePromise, timeoutPromise]) as number;

                        return {
                            id: s.id,
                            name: s.name,
                            price: calculatePrice(priceUSD)
                        };
                    } catch (error) {
                        return {
                            id: s.id,
                            name: s.name,
                            price: calculatePrice(0.5)
                        };
                    }
                })
            );

            services = servicesWithPrices.filter(s => s.price > 0);
        }

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

function calculatePrice(costUSD: number): number {
    const EXCHANGE_RATE = 1750; // Base NGN/USD rate
    const PROFIT_MARGIN_PERCENT = 40; // 40% profit margin
    const multiplier = 1 + (PROFIT_MARGIN_PERCENT / 100); // 1.4x
    return Math.ceil(costUSD * EXCHANGE_RATE * multiplier);
}

function getFlagEmoji(countryCode: string) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}
