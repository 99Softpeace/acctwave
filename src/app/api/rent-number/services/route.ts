
import { NextResponse } from 'next/server';
import { DaisySMS } from '@/lib/daisysms';

export async function GET() {
    try {
        // Switching to DaisySMS as requested
        const services = await DaisySMS.getRentalServices();
        return NextResponse.json({ success: true, data: services });
    } catch (error: any) {
        console.error('Rental Services Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to fetch services' }, { status: 500 });
    }
}
