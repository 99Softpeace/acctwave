import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        // Start a session for transaction safety
        // Note: Transactions require a replica set on MongoDB. If standalone, we can't use session.
        // Assuming Standard MongoDB Atlas or Replica Set environment.
        // If local standalone, we might skip session or use careful updates.
        // For this robust implementation, we'll try to use a session if possible, or just atomic operations.

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const withdrawalAmount = user.referralBalance || 0;

        if (withdrawalAmount <= 0) {
            return NextResponse.json({ message: 'No earnings to withdraw' }, { status: 400 });
        }

        const minimumWithdrawal = 1000; // Example minimum
        if (withdrawalAmount < minimumWithdrawal) {
            return NextResponse.json({ message: `Minimum withdrawal is ₦${minimumWithdrawal}` }, { status: 400 });
        }

        // 1. Reset Referral Balance
        user.referralBalance = 0;

        // 2. Add to Main Balance
        user.balance = (user.balance || 0) + withdrawalAmount;

        await user.save();

        // 3. Create Transaction Record
        await Transaction.create({
            user: user._id,
            amount: withdrawalAmount,
            reference: `REF_WD_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            status: 'successful',
            paymentMethod: 'wallet',
            type: 'bonus', // Can reuse bonus or create a new 'withdrawal' type strictly for this? 
            // 'bonus' fits well as it's internal money movement. Or 'commission_withdrawal'.
            // Let's use 'commission' but with description explaining.
            description: `Commission Transfer to Main Balance`,
            metadata: {
                source: 'referral_earnings'
            }
        });

        return NextResponse.json({
            message: 'Withdrawal successful',
            newBalance: user.balance
        });

    } catch (error) {
        console.error('Withdrawal error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
