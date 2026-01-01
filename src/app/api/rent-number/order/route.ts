import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order'; // We will keep using Order model for now, but fill external_order_id correctly
import { TextVerified } from '@/lib/textverified';
import { SMSPool } from '@/lib/smspool';
import { DaisySMS } from '@/lib/daisysms'; // Keep for price check fallbacks if needed, or remove if fully deprecated

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { service, duration, unit, areaCode } = await req.json();

        // Standardize service ID: if it looks like just an ID, assume US/TextVerified unless context implies otherwise?
        // The frontend 'Rent Number' page sends: service (id), duration, unit, areaCode.
        // It doesn't send country.
        // BUT, the frontend "Rent USA Virtual Number" title implies it's US only.
        // So we will default to TextVerified (US).

        await dbConnect();

        // 1. Get User Balance
        const user = await User.findById((session.user as any).id);
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // 2. Get Service Price
        // Using DaisySMS as requested
        const services = await DaisySMS.getRentalServices();
        const selectedService = services.find(s => s.id === service);

        if (!selectedService) {
            console.error(`Service ${service} not found in DaisySMS rentals`);
            return NextResponse.json({ success: false, error: 'Service not found in Rental list' }, { status: 400 });
        }

        const price = selectedService.price;

        // 3. Check Balance
        if (user.balance < price) {
            return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
        }

        // 4. Place Order with DaisySMS
        const rental = await DaisySMS.purchaseRental(service, duration, unit, areaCode);

        // 5. Deduct Balance & Save Order
        user.balance -= price;
        await user.save();

        // Create Order record with DS prefix
        const newOrder = await Order.create({
            user: user._id,
            type: 'rental',
            service_id: service,
            service_name: `Rental: ${selectedService.name} (DaisySMS)`,
            charge: price,
            external_order_id: `DS:${rental.id}`,
            status: 'Active',
            phone: rental.phone,
            expiresAt: new Date(rental.expiresAt),
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            data: {
                id: newOrder._id,
                phone: rental.phone,
                service: selectedService.name,
                status: 'active',
                expiresAt: newOrder.expiresAt.getTime()
            }
        });

    } catch (error: any) {
        console.error('Rental Order Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to purchase rental' }, { status: 500 });
    }
}
