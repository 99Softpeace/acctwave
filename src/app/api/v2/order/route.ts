import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import { addOrder } from '@/lib/smm';

export async function POST(req: Request) {
    try {
        // 1. Authenticate via API Key
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
        }

        const apiKey = authHeader.split(' ')[1];
        await dbConnect();

        const user = await User.findOne({ api_key: apiKey });
        if (!user) {
            return NextResponse.json({ error: 'Invalid API Key' }, { status: 401 });
        }

        // 2. Parse Request Body
        const body = await req.json();
        const { service, link, quantity } = body;

        if (!service || !link || !quantity) {
            return NextResponse.json({ error: 'Missing required fields: service, link, quantity' }, { status: 400 });
        }

        // 3. Fetch Service Price (You might want to cache this or fetch from DB if you sync services)
        // For now, we'll assume the frontend/user knows the price or we fetch it from SMM to verify.
        // Ideally, you should have a local Services database to check prices quickly.
        // Since we don't have a local Services DB populated yet, we might skip strict price check 
        // OR we fetch services list to find the price.
        // Let's fetch services to be safe.

        const servicesRes = await fetch(new URL('/api/services', req.url)); // Internal call to get services
        const servicesData = await servicesRes.json();

        let servicePrice = 0;
        let serviceName = 'Unknown Service';

        if (servicesData.success) {
            const foundService = servicesData.data.find((s: any) => s.service === service.toString());
            if (foundService) {
                // Calculate total price: (Rate per 1000) * (Quantity / 1000)
                servicePrice = (parseFloat(foundService.rate) * quantity) / 1000;
                serviceName = foundService.name;
            } else {
                return NextResponse.json({ error: 'Service not found' }, { status: 400 });
            }
        } else {
            // Fallback or Error if services can't be fetched
            return NextResponse.json({ error: 'Failed to retrieve service details' }, { status: 500 });
        }

        // 4. Check Balance
        if (user.balance < servicePrice) {
            return NextResponse.json({ error: 'Insufficient balance' }, { status: 402 });
        }

        // 5. Place Order on SMM Panel
        const smmResponse = await addOrder(service, link, quantity);

        if (smmResponse.error) {
            return NextResponse.json({ error: smmResponse.error }, { status: 400 });
        }

        // 6. Deduct Balance & Save Order
        user.balance -= servicePrice;
        await user.save();

        const order = await Order.create({
            user: user._id,
            service_id: service,
            service_name: serviceName,
            link,
            quantity,
            charge: servicePrice,
            external_order_id: smmResponse.order,
            status: 'Pending',
        });

        return NextResponse.json({
            status: 'success',
            order: order.external_order_id,
            charge: servicePrice,
            balance: user.balance
        }, { status: 201 });

    } catch (error: any) {
        console.error('API V2 Order Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
