import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/modded-apps';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { productCode, quantity, price } = await req.json();

        if (!productCode || !quantity || !price) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findById((session.user as any).id);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const totalCost = price * quantity;

        if (user.balance < totalCost) {
            return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
        }

        // Deduct balance
        user.balance -= totalCost;
        await user.save();

        // Place order with provider
        const orderRes = await createOrder(productCode, quantity);

        // Check for both status code AND presence of order ID (data)
        // The API returns 200 even for "insufficient balance", but data is null
        if (orderRes.statusCode !== 200 || !orderRes.data) {
            // Refund if failed
            user.balance += totalCost;
            await user.save();
            return NextResponse.json({ message: orderRes.message || 'Failed to place order (Insufficient Provider Balance)' }, { status: 400 });
        }

        // Save order to DB
        const newOrder = await Order.create({
            user: user._id,
            service_id: productCode,
            service_name: 'Modded App / Account', // You might want to get the actual name
            type: 'boost', // Or a new type 'digital_product'
            quantity: quantity,
            charge: totalCost,
            external_order_id: orderRes.data,
            status: 'Completed', // Instant delivery usually
        });

        return NextResponse.json({ success: true, data: newOrder });

    } catch (error: any) {
        console.error('Order error:', error);
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
    }
}
