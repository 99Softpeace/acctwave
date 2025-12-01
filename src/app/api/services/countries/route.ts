import { NextResponse } from 'next/server';
import { SMSPool } from '@/lib/smspool';

export async function GET() {
    try {
        const countries = await SMSPool.getCountries();
        return NextResponse.json(countries);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 });
    }
}
