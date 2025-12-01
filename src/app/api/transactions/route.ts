import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const transactions = await Transaction.find({ user: (session.user as any).id })
            .sort({ createdAt: -1 })
            .limit(20);

        return NextResponse.json({
            success: true,
            data: transactions,
        });
    } catch (error: any) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
