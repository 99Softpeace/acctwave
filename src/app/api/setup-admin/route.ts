import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Please login first' }, { status: 401 });
        }

        await dbConnect();

        const userId = (session.user as any).id;

        // Update user role to admin
        await User.findByIdAndUpdate(userId, { role: 'admin' });

        return NextResponse.json({
            success: true,
            message: `User ${session.user.email} has been promoted to Admin. Please logout and login again to see changes.`
        });

    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
