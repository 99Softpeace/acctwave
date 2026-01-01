import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Fetch active rentals (Orders of type 'rental' with status 'Active')
        // We also want 'completed' if you want to see them? The screenshot showed 'Active'.
        // Let's assume we want 'Active' and maybe recently 'completed' ones?
        // User's page is "Rent USA Virtual Number", implying active session.
        // DaisySMS rentals expire in ~15 mins.

        const rentals = await Order.find({
            user: (session.user as any).id,
            type: 'rental',
            status: { $in: ['Active', 'active', 'completed'] } // Fetch active and recently completed
        }).sort({ createdAt: -1 });

        const formattedRentals = rentals.map(order => ({
            id: order._id,
            phone: order.phone,
            service: order.service_name.replace('Rental: ', '').replace(' (DaisySMS)', ''), // Clean name on read too just in case
            status: order.status.toLowerCase(),
            code: null, // Fetched via status poll if needed, or maybe stored? Order model doesn't store code usually? 
            // Wait, Order model might not store 'smsCode'. 
            // status/route.ts doesn't fetch code from Order, it calls DaisySMS.getStatus.
            // But we should return what we have.
            expiresAt: order.expiresAt ? new Date(order.expiresAt).getTime() : 0,
            createdAt: order.createdAt,
            charge: order.charge,
            externalId: order.external_order_id,
            // If the status check found a code, how is it saved?
            // status/route.ts DOES NOT save the code to the Order model?
            // Checking status/route.ts:
            // It calls `DaisySMS.getRental` or `getStatus`.
            // It DOES NOT update `Order` with the code in the DB (unlike VirtualNumber logic).
            // This is a limitation of the legacy Order model usage here.
            // But for now, we just list them. The frontend polls for status anyway.
        }));

        return NextResponse.json({ success: true, data: formattedRentals });

    } catch (error: any) {
        console.error('Fetch Active Rentals Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch rentals' }, { status: 500 });
    }
}
