import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import { DaisySMS } from '@/lib/daisysms';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { service, duration, unit, areaCode } = await req.json();

        await dbConnect();

        // 1. Get User Balance
        const user = await User.findById((session.user as any).id);
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // 2. Get Service Price
        // We need to fetch the services to find the price of the selected service
        const services = await DaisySMS.getServices();
        const selectedService = services.find(s => s.id === service);

        if (!selectedService) {
            return NextResponse.json({ success: false, error: 'Service not found' }, { status: 400 });
        }

        const price = selectedService.price;

        // 3. Check Balance
        if (user.balance < price) {
            return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
        }

        // 4. Place Order with DaisySMS
        const rental = await DaisySMS.purchaseRental(service, duration, unit, areaCode);

        // 5. Deduct Balance & Save Order
        // Use a transaction or careful ordering to ensure consistency
        user.balance -= price;
        await user.save();

        const newOrder = await Order.create({
            user: user._id,
            type: 'rental',
            service_id: service,
            service_name: `Rental: ${selectedService.name}`,
            charge: price,
            external_order_id: rental.id,
            status: 'Active',
            phone: rental.phone,
            expiresAt: rental.expiresAt,
            createdAt: new Date(),
        });

        return NextResponse.json({ success: true, data: rental });

    } catch (error: any) {
        console.error('Rental Order Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to purchase rental' }, { status: 500 });
    }
}
