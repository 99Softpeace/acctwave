import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { userId, amount } = await req.json();

        if (!userId || !amount || isNaN(amount) || amount <= 0) {
            return NextResponse.json({ message: 'Valid User ID and amount are required' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Update balance
        user.balance += parseFloat(amount);
        await user.save();

        // Create transaction record
        await Transaction.create({
            user: userId,
            type: 'Deposit',
            amount: parseFloat(amount),
            status: 'successful',
            reference: `ADMIN-FUND-${Date.now()}`,
            description: 'Manual funding by Admin'
        });

        return NextResponse.json({
            success: true,
            message: `Successfully added ₦${amount.toLocaleString()} to ${user.name}'s wallet`
        });

    } catch (error: any) {
        console.error('Error funding user:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
