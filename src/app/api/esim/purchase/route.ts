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

            if (order.success === 0) {
                throw new Error(order.message || 'Failed to purchase eSIM');
            }

            // Deduct from user wallet
            user.balance -= costInNaira;
            await user.save();

            // Create Transaction Record
            await Transaction.create({
                user: user._id,
                type: 'debit',
                amount: costInNaira,
                category: 'esim_purchase',
                status: 'completed',
                description: `eSIM Purchase (Plan ID: ${planId})`,
                reference: `ESIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                metadata: {
                    planId,
                    orderData: order
                }
            });

            return NextResponse.json({ success: true, order });

        } catch (apiError: any) {
            console.error('SMSPool Purchase Error:', apiError);
            return NextResponse.json({ message: apiError.message || 'Failed to purchase eSIM from provider' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('eSIM Purchase Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
