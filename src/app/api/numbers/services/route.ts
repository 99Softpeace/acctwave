import { NextResponse } from 'next/server';
import { TextVerified } from '@/lib/textverified';
import { SMSPool } from '@/lib/smspool';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('country') || 'US'; // Default to US

    try {
        let services = [];
        let countries = [];

        // Fetch Countries
        // We manually add US for TextVerified, and fetch others from SMSPool
        const smsPoolCountries = await SMSPool.getCountries();
        console.log('SMSPool Countries (First 5):', JSON.stringify(smsPoolCountries.slice(0, 5)));

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
            console.log('Fetching TextVerified services for US...');
            const tvServices = await TextVerified.getServices();
            console.log(`Fetched ${tvServices.length} TextVerified services`);

            if (tvServices.length > 0) {
                services = tvServices.map(s => ({
                    id: s.id,
                    name: s.name,
                    price: calculatePrice(s.cost)
                }));
            } else {
                console.log('TextVerified returned empty, falling back to SMSPool for US');
                // Find US ID from SMSPool countries
                const usCountry = smsPoolCountries.find((c: any) => c.short_name === 'US' || c.name === 'United States');
                const usId = usCountry ? usCountry.id : '1'; // Default to 1 if not found

                console.log(`Fetching SMSPool services for US (ID: ${usId})`);
                const spServices = await SMSPool.getServices(usId);

                // Prioritize popular services
                const popularServices = ['WhatsApp', 'Telegram', 'Facebook', 'Instagram', 'Twitter', 'Google', 'TikTok', 'Snapchat', 'Uber', 'Netflix', 'Discord', 'Amazon', 'PayPal', 'LinkedIn', 'Microsoft', 'Yahoo', 'Apple', 'Tinder', 'Viber', 'WeChat'];

                const prioritizedServices = spServices.filter(s => popularServices.some(p => s.name.toLowerCase().includes(p.toLowerCase())));
                const otherServices = spServices.filter(s => !popularServices.some(p => s.name.toLowerCase().includes(p.toLowerCase())));

                // Combine: Popular services first, then others up to a limit
                // Fetch prices for up to 40 services total to prevent timeout
                const servicesToFetch = [...prioritizedServices, ...otherServices].slice(0, 40);

                console.log(`Fetching prices for ${servicesToFetch.length} services (including ${prioritizedServices.length} popular ones)...`);

                const servicesWithPrices = await Promise.all(
                    servicesToFetch.map(async (s) => {
                        try {
                            // Add a timeout to the price fetch to prevent hanging
                            const pricePromise = SMSPool.getPrice(usId, s.id);
                            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000));

                            const priceUSD = await Promise.race([pricePromise, timeoutPromise]) as number;

                            return {
                                id: s.id,
                                name: s.name,
                                price: calculatePrice(priceUSD)
                            };
                        } catch (error) {
                            console.error(`Failed to fetch price for service ${s.name}:`, error);
                            // Use a default price if fetching fails or times out
                            return {
                                id: s.id,
                                name: s.name,
                                price: calculatePrice(0.5) // Default $0.50 USD
                            };
                        }
                    })
                );

                services = servicesWithPrices.filter(s => s.price > 0);
            }
        } else {
            // For other countries, fetch services and their prices
            const spServices = await SMSPool.getServices(countryId);

            // Prioritize popular services
            const popularServices = ['WhatsApp', 'Telegram', 'Facebook', 'Instagram', 'Twitter', 'Google', 'TikTok', 'Snapchat', 'Uber', 'Netflix', 'Discord', 'Amazon', 'PayPal', 'LinkedIn', 'Microsoft', 'Yahoo', 'Apple', 'Tinder', 'Viber', 'WeChat'];

            const prioritizedServices = spServices.filter(s => popularServices.some(p => s.name.toLowerCase().includes(p.toLowerCase())));
            const otherServices = spServices.filter(s => !popularServices.some(p => s.name.toLowerCase().includes(p.toLowerCase())));

            // Combine: Popular services first, then others up to a limit
            // Fetch prices for up to 40 services total to prevent timeout
            const servicesToFetch = [...prioritizedServices, ...otherServices].slice(0, 40);

            console.log(`Fetching prices for ${servicesToFetch.length} services in country ${countryId} (including ${prioritizedServices.length} popular ones)...`);

            // Fetch prices
            const servicesWithPrices = await Promise.all(
                servicesToFetch.map(async (s) => {
                    try {
                        // Add a timeout to the price fetch to prevent hanging
                        const pricePromise = SMSPool.getPrice(countryId, s.id);
                        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000));

                        const priceUSD = await Promise.race([pricePromise, timeoutPromise]) as number;

                        return {
                            id: s.id,
                            name: s.name,
                            price: calculatePrice(priceUSD)
                        };
                    } catch (error) {
                        console.error(`Failed to fetch price for service ${s.name}:`, error);
                        return {
                            id: s.id,
                            name: s.name,
                            price: calculatePrice(0.5) // Default $0.50 USD
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
