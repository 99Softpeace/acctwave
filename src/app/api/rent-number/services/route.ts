
import { NextResponse } from 'next/server';
import { TextVerified } from '@/lib/textverified';

export async function GET() {
    try {
        // Since Rent Number page is currently "Rent USA Virtual Number",
        // we fetch services from TextVerified.
        const services = await TextVerified.getRentalServices();
        return NextResponse.json({ success: true, data: services });
    } catch (error: any) {
        console.error('Rental Services Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to fetch services' }, { status: 500 });
    }
}
