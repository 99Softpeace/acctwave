import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const signature = req.headers.get('verif-hash');

        // Verify webhook signature
        const secretHash = process.env.FLUTTERWAVE_SECRET_KEY!;

        if (!signature || signature !== secretHash) {
            return NextResponse.json(
                { message: 'Invalid signature' },
                { status: 401 }
            );
        }

        // Only process successful payments
        if (body.event !== 'charge.completed' || body.data.status !== 'successful') {
            return NextResponse.json({ message: 'Event not processed' });
        }

        await dbConnect();

        const tx_ref = body.data.tx_ref;
        const transaction = await Transaction.findOne({ reference: tx_ref });

        if (!transaction) {
            return NextResponse.json(
                { message: 'Transaction not found' },
                { status: 404 }
            );
        }

        // Prevent double-crediting
        if (transaction.status === 'successful') {
            return NextResponse.json({ message: 'Already processed' });
        }

        // Verify amount matches
        if (body.data.amount < transaction.amount) {
            transaction.status = 'failed';
            transaction.metadata = body.data;
            await transaction.save();

            return NextResponse.json(
                { message: 'Amount mismatch' },
                { status: 400 }
            );
        }

        // Update transaction
        transaction.status = 'successful';
        transaction.flutterwave_tx_id = body.data.id;
        transaction.metadata = body.data;
        await transaction.save();

        // Credit user wallet
        const user = await User.findById(transaction.user);
        if (user) {
            user.balance += transaction.amount;
            await user.save();
        }

        return NextResponse.json({
            status: 'success',
            message: 'Webhook processed successfully',
        });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
