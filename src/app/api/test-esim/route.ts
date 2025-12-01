import { NextResponse } from 'next/server';

const API_KEY = process.env.SMSPOOL_API_KEY || 'mjlrumEoP9qKEQHVGcYWcOq3F8nVT7Vv';
const BASE_URL = 'https://api.smspool.net';

export async function GET() {
    const countries = ['1', 'US', 'United States', '10', '44', 'GB'];
    const results: Record<string, any> = {};

    for (const c of countries) {
        const url = `${BASE_URL}/esim/plans?key=${API_KEY}&country=${c}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            results[c] = data;
        } catch (error: any) {
            results[c] = { error: error.message };
        }
    }

    return NextResponse.json(results);
}
