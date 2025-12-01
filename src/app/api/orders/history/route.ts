import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { authOptions } from '@/lib/auth';
import { getOrderStatus } from '@/lib/smm';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Fetch orders from DB
        const orders = await Order.find({ user: (session.user as any).id })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 orders

        // Optional: Update status from SMM provider for pending orders
        // This is a simple implementation. For production, use a background job or webhook.
        const updatedOrders = await Promise.all(orders.map(async (order) => {
            if (['Pending', 'Processing', 'In progress'].includes(order.status)) {
                try {
                    const statusRes = await getOrderStatus(order.external_order_id);
                    if (statusRes && statusRes.status) {
                        order.status = statusRes.status;
                        order.start_count = statusRes.start_count;
                        order.remains = statusRes.remains;
                        await order.save();
                    }
                } catch (err) {
                    console.error(`Failed to update status for order ${order.external_order_id}`, err);
                }
            }
            return order;
        }));

        return NextResponse.json({
            success: true,
            data: updatedOrders,
        });

    } catch (error: any) {
        console.error('Error fetching order history:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
