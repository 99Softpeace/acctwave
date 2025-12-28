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
        // We need to fetch price. Since we assume US (TV), we fetch TV services.
        // Optimization: cached or direct fetch? TextVerified.getRentalServices
        const services = await TextVerified.getRentalServices();
        const selectedService = services.find(s => s.id === service);

        // If not found in TV, maybe check SMSPool if we wanted to support it here?
        // User said "US number only" for TextVerified.

        if (!selectedService) {
            console.error(`Service ${service} not found in TextVerified rentals`);
            return NextResponse.json({ success: false, error: 'Service not found in US Rental list' }, { status: 400 });
        }

        const price = selectedService.cost; // TV uses 'cost' field in our interface

        // 3. Check Balance
        if (user.balance < price) {
            return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
        }

        // 4. Place Order with TextVerified
        // Note: TV rental APIs usually need duration.
        const rental = await TextVerified.purchaseRental(service, duration, unit, areaCode);

        // 5. Deduct Balance & Save Order
        user.balance -= price;
        await user.save();

        // Create Order record
        // We map TV Rental fields to our Order schema
        // Order schema expects: external_order_id, phone, etc.
        const newOrder = await Order.create({
            user: user._id,
            type: 'rental',
            service_id: service,
            service_name: `Rental: ${selectedService.name} (US)`,
            charge: price,
            external_order_id: `TV:${rental.id}`, // Prefix with TV: so our status check knows
            status: 'Active',
            phone: rental.number,
            expiresAt: new Date(Date.now() + (duration * 24 * 60 * 60 * 1000)), // Approximate expiry based on duration if not returned?
            // TV 'purchaseRental' mocked return doesn't seem to have exact expiry date in our lib yet, checking lib...
            // Lib says 'time_remaining': 'Calculating...'.
            // We'll trust the requested duration for the DB record for now or parse it later.
            // Wait, rental.expiresAt isn't in TVVerification interface.
            // Let's rely on status checks.
            createdAt: new Date(),
        });

        // Return format expected by frontend
        // Frontend expects: data.phone, data.id, ...
        return NextResponse.json({
            success: true,
            data: {
                id: newOrder._id, // Return Internal ID for the status poller!
                phone: rental.number,
                service: selectedService.name,
                status: 'active',
                expiresAt: newOrder.expiresAt ? newOrder.expiresAt.getTime() : Date.now()
            }
        });

    } catch (error: any) {
        console.error('Rental Order Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to purchase rental' }, { status: 500 });
    }
}
