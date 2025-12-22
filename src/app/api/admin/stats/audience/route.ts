import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();

        // Count all active users (not suspended)
        const count = await User.countDocuments({
            isSuspended: false
        });

        return NextResponse.json(
            { count },
            { status: 200 }
        );
    } catch (error) {
        console.error('Failed to fetch audience stats:', error);
        return NextResponse.json(
            { message: 'Internal Server Error', count: 0 },
            { status: 500 }
        );
    }
}
