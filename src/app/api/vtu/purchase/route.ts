import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { purchaseAirtime, purchaseData, generateDataCard } from '@/lib/vtu';
import dbConnect from '@/lib/db';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { type, network, phone, amount, planId, quantity, nameOnCard } = await req.json();
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        let cost = 0;
        let apiResponse;

        // Calculate Cost & Validate
        if (type === 'airtime') {
            cost = Number(amount);
            if (user.balance < cost) {
                return NextResponse.json({ success: false, message: 'Insufficient balance' }, { status: 400 });
            }
            // Call API
            apiResponse = await purchaseAirtime(network, phone, cost);

        } else if (type === 'data') {
            // Fetch plan price from DB or Static file to verify cost
            // For now assuming the frontend sends the correct planId and we trust the API to deduct/charge correctly?
            // Ideally we should look up the price of 'planId' from our records to deduct from user wallet.
            // Let's assume for now we trust the client to send 'amount' or we look it up.
            // Since we don't have the plan price in the request body for data, we need to find it.
            // Importing DATA_PLANS here might be needed.
            const { DATA_PLANS } = await import('@/lib/vtu');
            const selectedPlan = DATA_PLANS.find(p => p.id === Number(planId));

            if (!selectedPlan) {
                return NextResponse.json({ success: false, message: 'Invalid Data Plan' }, { status: 400 });
            }
            cost = selectedPlan.price;

            if (user.balance < cost) {
                return NextResponse.json({ success: false, message: 'Insufficient balance' }, { status: 400 });
            }

            apiResponse = await purchaseData(network, phone, Number(planId));

        } else if (type === 'datacard') {
            const { DATA_PLANS } = await import('@/lib/vtu');
            const selectedPlan = DATA_PLANS.find(p => p.id === Number(planId));
            if (!selectedPlan) {
                return NextResponse.json({ success: false, message: 'Invalid Data Plan' }, { status: 400 });
            }
            cost = selectedPlan.price * Number(quantity);

            if (user.balance < cost) {
                return NextResponse.json({ success: false, message: 'Insufficient balance' }, { status: 400 });
            }

            apiResponse = await generateDataCard(Number(planId), Number(quantity), nameOnCard);
        } else {
            return NextResponse.json({ success: false, message: 'Invalid transaction type' }, { status: 400 });
        }

        // Check API Response
        // Gladtidings usually returns { status: 'success' | 'fail', ... }
        // We need to be careful. If it fails, we don't deduct.
        // If it succeeds, we deduct.

        if (apiResponse && (apiResponse.Status === 'successful' || apiResponse.status === 'success' || apiResponse.id)) {
            // Deduct Balance
            user.balance -= cost;
            await user.save();

            // Log Transaction
            await Transaction.create({
                user: user._id,
                type: 'order',
                amount: cost,
                description: `${type.toUpperCase()} Purchase - ${network} ${phone || ''}`,
                status: 'successful',
                reference: `VTU-${Date.now()}`
            });

            return NextResponse.json({ success: true, data: apiResponse });
        } else {
            return NextResponse.json({
                success: false,
                message: apiResponse?.message || apiResponse?.error || 'Transaction failed at provider'
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error('VTU Purchase Error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
