// Mock Virtual Number Provider Logic

export const SERVICES = [
    { id: 'whatsapp', name: 'WhatsApp', price: 450, icon: 'MessageCircle' },
    { id: 'telegram', name: 'Telegram', price: 400, icon: 'Send' },
    { id: 'facebook', name: 'Facebook', price: 300, icon: 'Facebook' },
    { id: 'instagram', name: 'Instagram', price: 350, icon: 'Instagram' },
    { id: 'tiktok', name: 'TikTok', price: 500, icon: 'Video' },
    { id: 'google', name: 'Google / Gmail', price: 250, icon: 'Mail' },
    { id: 'twitter', name: 'Twitter / X', price: 300, icon: 'Twitter' },
    { id: 'netflix', name: 'Netflix', price: 200, icon: 'Tv' },
];

export const COUNTRIES = [
    { id: 'usa', name: 'United States', code: '+1', flag: '🇺🇸' },
    { id: 'uk', name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    { id: 'nigeria', name: 'Nigeria', code: '+234', flag: '🇳🇬' },
    { id: 'canada', name: 'Canada', code: '+1', flag: '🇨🇦' },
    { id: 'netherlands', name: 'Netherlands', code: '+31', flag: '🇳🇱' },
];

export async function mockRentNumber(serviceId: string, countryId: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const country = COUNTRIES.find(c => c.id === countryId);
    if (!country) throw new Error('Invalid country');

    // Generate random number
    const randomDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    const number = `${country.code}${randomDigits}`;

    return {
        id: `mock-${Date.now()}`,
        number: number,
        expiresIn: 1200, // 20 minutes in seconds
    };
}

export async function mockCheckSms(externalId: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Randomly simulate receiving an SMS (10% chance per check)
    const shouldReceive = Math.random() < 0.1;

    if (shouldReceive) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        return {
            status: 'RECEIVED',
            code: code,
            text: `Your verification code is ${code}. Do not share it with anyone.`,
        };
    }

    return { status: 'WAITING' };
}
