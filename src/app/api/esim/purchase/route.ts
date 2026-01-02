import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SMSPool } from '@/lib/smspool';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { planId, price } = await req.json();

        if (!planId || !price) {
            return NextResponse.json({ message: 'Missing plan details' }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findById((session.user as any).id);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Check balance (Price is in USD, user balance is in NGN)
        // We need an exchange rate. For now, let's assume 1 USD = 1500 NGN (or fetch live)
        // Or maybe the price passed from frontend is already converted?
        // Let's assume the price passed is in USD and we convert here.
        const EXCHANGE_RATE = 1600; // Hardcoded for now, should be dynamic
        const costInNaira = price * EXCHANGE_RATE;

        if (user.balance < costInNaira) {
            return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
        }

        // Purchase from SMSPool
        // Note: This consumes your SMSPool balance in USD.
        // You charge the user in NGN.
        try {
            const order = await SMSPool.purchaseESIM(planId);

            console.log('SMSPool eSIM Purchase Response:', order);

            // Fetch details (QR code) immediately using the separate Profile endpoint
            if (order.transactionId) {
                console.log(`Fetching profile for TxID: ${order.transactionId}...`);
                // Poll a few times in case of propagation delay
                for (let i = 0; i < 3; i++) {
                    await new Promise(r => setTimeout(r, 1000)); // 1s wait
                    const details = await SMSPool.checkESIMOrder(order.transactionId);
                    if (details && (details.qr_code || details.ac)) {
                        console.log('Details fetched:', details);
                        Object.assign(order, details); // Merge into order object
                        break;
                    }
                }
            }

            // Normalize order data to ensure consistent fields
            const normalizedOrder = {
                ...order,
                qr_code: order.qr_code || order.qr || order.image || order.qrCode || order.qr_code_url || order.qrUrl || order.iccid,
                activation_code: order.activation_code || order.code || order.activation || order.lpa || order.smdp_address || order.smdpAddress,
                smdp_address: order.smdp_address || order.smdp || order.server || order.smdpAddress
            };

            // Deduct from user wallet
            user.balance -= costInNaira;
            await user.save();

            // Create Transaction Record
            await Transaction.create({
                user: user._id,
                type: 'order',
                amount: costInNaira,
                category: 'esim_purchase',
                status: 'successful',
                description: `eSIM Purchase (Plan ID: ${planId})`,
                reference: `ESIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                metadata: {
                    planId,
                    orderData: normalizedOrder
                }
            });

            return NextResponse.json({ success: true, order: normalizedOrder });

        } catch (apiError: any) {
            console.error('SMSPool Purchase Error:', apiError);
            return NextResponse.json({ message: apiError.message || 'Failed to purchase eSIM from provider' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('eSIM Purchase Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
