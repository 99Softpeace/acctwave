import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

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

        // If user doesn't have an API key, generate one automatically
        if (!user.api_key) {
            user.api_key = 'sk_live_' + crypto.randomBytes(24).toString('hex');
            await user.save();
        }

        return NextResponse.json({
            success: true,
            apiKey: user.api_key
        });

    } catch (error: any) {
        console.error('Error fetching API key:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
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

        // Generate new API key
        user.api_key = 'sk_live_' + crypto.randomBytes(24).toString('hex');
        await user.save();

        return NextResponse.json({
            success: true,
            apiKey: user.api_key
        });

    } catch (error: any) {
        console.error('Error generating API key:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
