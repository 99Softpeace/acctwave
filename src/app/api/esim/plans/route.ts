import { NextResponse } from 'next/server';
import { SMSPool } from '@/lib/smspool';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country');

    if (!country) {
        return NextResponse.json({ error: 'Country code is required' }, { status: 400 });
    }

    const plans = await SMSPool.getESIMPlans(country);
    return NextResponse.json(plans);
}
