import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectToDatabase from '@/lib/db';

export async function GET() {
    try {
        await connectToDatabase();
        const users = await User.find({}, 'email');
        return NextResponse.json({ count: users.length, users });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
