import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const tx_ref = searchParams.get('tx_ref');

        if (!tx_ref) {
            return NextResponse.json(
                { message: 'Transaction reference is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Find transaction or create new one if using inline payment
        let transaction = await Transaction.findOne({ reference: tx_ref });

        if (!transaction) {
            // If transaction doesn't exist locally (inline payment), verify first then create
            const verifyUrl = `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`;

            const response = await fetch(verifyUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.status === 'success' && data.data.status === 'successful') {
                // Create transaction record
                transaction = await Transaction.create({
                    user: (session.user as any).id,
                    amount: data.data.amount,
                    reference: tx_ref,
                    status: 'successful',
                    type: 'deposit',
                    description: 'Wallet funding',
                    flutterwave_tx_id: data.data.id,
                    metadata: data.data
                });

                // Credit user
                const user = await User.findById((session.user as any).id);
                if (user) {
                    user.balance += data.data.amount;
                    await user.save();
                }

                return NextResponse.json({
                    status: 'success',
                    message: 'Payment verified successfully',
                    data: {
                        amount: transaction.amount,
                        reference: transaction.reference,
                        new_balance: user?.balance || 0,
                    },
                });
            } else {
                return NextResponse.json(
                    { message: 'Payment verification failed at provider' },
                    { status: 400 }
                );
            }
        }

        // Check if already processed
        if (transaction.status === 'successful') {
            return NextResponse.json({
                status: 'success',
                message: 'Payment already verified',
                data: {
                    amount: transaction.amount,
                    reference: transaction.reference,
                },
            });
        }

        // Verify with Flutterwave API
        const verifyUrl = `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`;

        const response = await fetch(verifyUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (
            data.status === 'success' &&
            data.data.status === 'successful' &&
            data.data.amount >= transaction.amount &&
            data.data.currency === 'NGN'
        ) {
            // Update transaction status
            transaction.status = 'successful';
            transaction.flutterwave_tx_id = data.data.id;
            transaction.metadata = data.data;
            await transaction.save();

            // Update user balance
            const user = await User.findById(transaction.user);
            if (user) {
                user.balance += transaction.amount;
                await user.save();
            }

            return NextResponse.json({
                status: 'success',
                message: 'Payment verified successfully',
                data: {
                    amount: transaction.amount,
                    reference: transaction.reference,
                    new_balance: user?.balance || 0,
                },
            });
        } else {
            // Mark as failed
            transaction.status = 'failed';
            transaction.metadata = data.data;
            await transaction.save();

            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Payment verification failed',
                },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error('Payment verification error:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
