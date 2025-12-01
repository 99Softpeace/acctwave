import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const userId = (session.user as any).id;
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Check if user already has a virtual account
        if (user.virtualAccount && user.virtualAccount.accountNumber) {
            return NextResponse.json({
                success: true,
                data: user.virtualAccount
            });
        }

        // Generate a mock virtual account (PocketFi Simulation)
        // Since the real API is down, we simulate this feature for the project demo.
        const mockAccount = {
            bankName: 'PocketFi Bank',
            accountNumber: '9' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0'), // Starts with 9, 10 digits
            accountName: user.name
        };

        // Save to user
        user.virtualAccount = mockAccount;
        await user.save();

        return NextResponse.json({
            success: true,
            data: mockAccount
        });

    } catch (error: any) {
        console.error('Error fetching virtual account:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
