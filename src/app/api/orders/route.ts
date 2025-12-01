import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { addOrder } from '@/lib/smm';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import { authOptions } from '@/lib/auth'; // Import auth options

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { serviceId, serviceName, link, quantity, price } = await req.json();

        if (!serviceId || !link || !quantity || !price) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // 1. Check User Balance
        const user = await User.findById((session.user as any).id);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (user.balance < price) {
            return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
        }

        // 2. Place Order on SMM Panel
        const smmResponse = await addOrder(serviceId, link, quantity);

        if (smmResponse.error) {
            return NextResponse.json({ message: smmResponse.error }, { status: 400 });
        }

        // 3. Deduct Balance
        user.balance -= price;
        await user.save();

        // 4. Save Order to Database
        const order = await Order.create({
            user: user._id,
            service_id: serviceId,
            service_name: serviceName,
            link,
            quantity,
            charge: price,
            external_order_id: smmResponse.order,
            status: 'Pending', // Initial status
        });

        return NextResponse.json({ message: 'Order placed successfully', order }, { status: 201 });

    } catch (error) {
        console.error('Error placing order:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
