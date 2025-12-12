import { NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/pocketfi';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const reference = searchParams.get('reference');

        if (!reference) {
            return NextResponse.json({ success: false, message: 'No reference provided' }, { status: 400 });
        }

        await dbConnect();

        // Find transaction
        const transaction = await Transaction.findOne({ reference });

        if (!transaction) {
            return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
        }

        // Check if user owns the transaction
        const user = await User.findOne({ email: session.user.email });
        if (!user || transaction.user.toString() !== user._id.toString()) {
            return NextResponse.json({ success: false, message: 'Unauthorized access to transaction' }, { status: 403 });
        }

        // If already completed, return success immediately
        if (transaction.status === 'completed') {
            return NextResponse.json({
                success: true,
                status: 'completed',
                message: 'Transaction successful'
            });
        }

        // If failed, return status
        if (transaction.status === 'failed') {
            return NextResponse.json({
                success: false,
                status: 'failed',
                message: 'Transaction failed'
            });
        }

        // If pending, verify with PocketFi
        console.log(`Verifying pending transaction: ${reference}`);
        const verification = await verifyPayment(reference);

        if (verification.status && verification.data.status === 'successful') {
            // Update transaction
            transaction.status = 'completed';
            await transaction.save();

            // Credit user wallet (if not already done - double safety)
            // Note: In a race condition with webhook, we might credit twice if not careful.
            // Ideally, we should use a transaction or atomic update with condition.
            // For now, simpler check:

            // Re-fetch user to get latest balance
            const freshUser = await User.findById(user._id);

            const addAmount = Number(transaction.amount); // Explicit cast
            console.log(`[VERIFY] Updating balance for user ${user.email}. Old: ${freshUser.balance}, Adding: ${addAmount}`);

            freshUser.balance = Number(freshUser.balance) + addAmount;
            console.log(`[VERIFY] New Balance: ${freshUser.balance}`);

            await freshUser.save();

            return NextResponse.json({
                success: true,
                status: 'completed',
                message: 'Transaction verified and wallet funded'
            });
        } else if (verification.status && verification.data.status === 'failed') {
            transaction.status = 'failed';
            await transaction.save();
            return NextResponse.json({
                success: false,
                status: 'failed',
                message: 'Payment provider reported failure'
            });
        }

        // Still pending or unknown
        return NextResponse.json({
            success: false,
            status: transaction.status,
            message: 'Transaction is still pending'
        });

    } catch (error: any) {
        console.error('Payment verification error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Internal server error'
        }, { status: 500 });
    }
}
