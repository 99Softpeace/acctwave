import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import VirtualNumber from '@/models/VirtualNumber';
import { authOptions } from '@/lib/auth';
import { getOrderStatus } from '@/lib/smm';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Fetch Boost orders
        const boostOrders = await Order.find({ user: (session.user as any).id })
            .lean();

        // Fetch Virtual Number rentals
        const rentalOrders = await VirtualNumber.find({ user: (session.user as any).id })
            .lean();

        // Normalize and Combine
        const normalizedBoosts = boostOrders.map((o: any) => ({
            _id: o._id,
            type: 'boost',
            service_name: o.service_name,
            link: o.link,
            quantity: o.quantity,
            charge: o.charge,
            status: o.status,
            start_count: o.start_count,
            remains: o.remains,
            createdAt: o.createdAt,
            external_order_id: o.external_order_id
        }));

        const normalizedRentals = rentalOrders.map((r: any) => ({
            _id: r._id,
            type: 'rental',
            service_name: r.serviceName || 'Virtual Number',
            phone: r.number,
            code: r.smsCode,
            charge: r.price,
            status: r.status === 'active' ? 'Active' : r.status === 'completed' ? 'Completed' : 'Canceled',
            createdAt: r.createdAt,
            expiresAt: r.expiresAt,
            external_order_id: r.externalId
        }));

        const allOrders = [...normalizedBoosts, ...normalizedRentals].sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Optional: Update status from SMM provider for pending orders (Only for Boosts)
        // ... (We can skip re-checking rentals here as active/route handles that)

        return NextResponse.json({
            success: true,
            data: allOrders,
        });

    } catch (error: any) {
        console.error('Error fetching order history:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
