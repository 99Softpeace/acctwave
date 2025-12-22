import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ authenticated: false });
    }

    try {
        await dbConnect();
        // @ts-ignore
        const user = await User.findById(session.user.id).select('isSuspended email');

        console.log(`[Status API Debug] Check User ${session.user.email} (${session.user.id})`);
        console.log(`[Status API Debug] Found DB User:`, user);
        console.log(`[Status API Debug] user.isSuspended value:`, user?.isSuspended);

        if (!user) return NextResponse.json({ authenticated: false });

        return NextResponse.json({
            authenticated: true,
            isSuspended: user.toObject().isSuspended // Force toObject to ensure we get plain props
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
    }
}
