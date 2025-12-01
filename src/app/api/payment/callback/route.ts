import { NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/pocketfi';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { reference, status } = body;

        if (!reference) {
            return NextResponse.json({ success: false, message: 'No reference provided' }, { status: 400 });
        }

        // Verify with PocketFi
        const verification = await verifyPayment(reference);

        if (verification.status && verification.data.status === 'successful') {
            await dbConnect();

            // Find transaction
            const transaction = await Transaction.findOne({ reference });
            if (!transaction) {
                return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
            }

            if (transaction.status === 'completed') {
                return NextResponse.json({ success: true, message: 'Transaction already completed' });
            }

            // Update transaction
            transaction.status = 'completed';
            await transaction.save();

            // Credit user wallet
            const user = await User.findById(transaction.user);
            if (user) {
                user.balance += transaction.amount;
                await user.save();
            }

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, message: 'Payment verification failed' }, { status: 400 });
        }

    } catch (error) {
        console.error('Payment callback error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    // Handle redirect callback if needed
    return NextResponse.json({ message: 'Callback endpoint' });
}
