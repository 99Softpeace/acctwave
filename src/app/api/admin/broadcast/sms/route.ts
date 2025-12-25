
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendBulkSMS } from '@/lib/bulksms';
import User from '@/models/User';
import dbConnect from '@/lib/db';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Admin Check
        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        const { recipientType, specificNumbers, message } = await req.json();

        if (!message) {
            return NextResponse.json({ success: false, message: 'Message content is required' }, { status: 400 });
        }

        let targetNumbers: string[] = [];

        if (recipientType === 'all') {
            await dbConnect();
            // Fetch all users with a phone number
            const users = await User.find({
                phoneNumber: { $exists: true, $ne: null }
            }).select('phoneNumber');

            targetNumbers = users.map(u => u.phoneNumber).filter(Boolean);
        } else if (recipientType === 'specific') {
            targetNumbers = specificNumbers || [];
        }

        if (targetNumbers.length === 0) {
            return NextResponse.json({ success: false, message: 'No valid phone numbers found for recipients' }, { status: 400 });
        }

        // Send SMS
        const result = await sendBulkSMS(targetNumbers, message);

        if (result.success) {
            return NextResponse.json({ success: true, count: result.count, data: result.data });
        } else {
            return NextResponse.json({ success: false, message: result.message }, { status: 500 });
        }

    } catch (error: any) {
        console.error('SMS Broadcast Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
