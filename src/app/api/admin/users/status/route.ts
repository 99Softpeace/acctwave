
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        const { userId, isSuspended } = await req.json();

        console.log(`[Status API] Updating User: ${userId} to isSuspended=${isSuspended} (Type: ${typeof isSuspended})`);

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        // [NEW] Prevent Self-Ban
        if (userId === (session.user as any).id) {
            return NextResponse.json({ message: 'You cannot suspend your own account' }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { isSuspended: isSuspended },
            { new: true }
        );

        console.log(`[Status API] Updated User Result:`, user ? { id: user._id, isSuspended: user.isSuspended } : 'null');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Force cache invalidation for the admin users page
        try {
            const { revalidatePath } = await import('next/cache');
            revalidatePath('/admin/users');
        } catch (e) {
            console.error('Revalidation failed', e);
        }

        return NextResponse.json({
            success: true,
            data: user,
            message: `User ${isSuspended ? 'suspended' : 'activated'} successfully`
        });

    } catch (error: any) {
        console.error('Error updating user status:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
