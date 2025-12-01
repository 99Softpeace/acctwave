import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import { getOrderStatus } from '@/lib/smm';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
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

        const orderId = params.id;

        const query: any = { user: user._id };
        const orConditions = [];

        if (!isNaN(Number(orderId))) {
            orConditions.push({ external_order_id: Number(orderId) });
        }

        if (mongoose.Types.ObjectId.isValid(orderId)) {
            orConditions.push({ _id: orderId });
        }

        if (orConditions.length === 0) {
            return NextResponse.json({ error: 'Invalid Order ID format' }, { status: 400 });
        }

        query.$or = orConditions;

        const order = await Order.findOne(query);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // 3. Fetch latest status from SMM Provider
        // Optimization: Only fetch if status is not already 'Completed' or 'Canceled'
        if (order.status !== 'Completed' && order.status !== 'Canceled') {
            const statusRes = await getOrderStatus(order.external_order_id);
            if (statusRes && statusRes.status) {
                order.status = statusRes.status;
                order.remains = statusRes.remains;
                await order.save();
            }
        }

        return NextResponse.json({
            status: order.status,
            charge: order.charge,
            start_count: order.start_count,
            remains: order.remains,
            currency: 'NGN'
        });

    } catch (error: any) {
        console.error('API V2 Status Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
