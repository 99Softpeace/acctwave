import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();
        const user = await User.findOne().sort({ createdAt: -1 });
        return NextResponse.json({
            email: user?.email,
            referralCode: user?.referralCode,
            referredBy: user?.referredBy
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
