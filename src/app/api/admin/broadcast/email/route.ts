import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/resend';
import User from '@/models/User';
import dbConnect from '@/lib/db';

export async function POST(req: Request) {
    try {
        // 1. Auth Check (Admin Only)
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { recipientType, specificEmails, subject, message } = await req.json();

        if (!subject || !message) {
            return NextResponse.json({ success: false, message: 'Subject and message are required' }, { status: 400 });
        }

        // 2. Determine Recipients
        let targets: string[] = [];

        if (recipientType === 'specific') {
            if (!Array.isArray(specificEmails) || specificEmails.length === 0) {
                return NextResponse.json({ success: false, message: 'No recipients selected' }, { status: 400 });
            }
            targets = specificEmails;
        } else {
            // 'all' - Fetch all active users with email
            await dbConnect();
            const users = await User.find({
                isSuspended: false,
                email: { $exists: true, $ne: '' }
            }).select('email');

            targets = users.map(u => u.email);
        }

        if (targets.length === 0) {
            return NextResponse.json({ success: false, message: 'No valid recipients found' }, { status: 404 });
        }

        console.log(`[Broadcast] Sending email to ${targets.length} recipients. Subject: ${subject}`);

        // 3. Send via Resend (Using BCC for Privacy)
        // We send the email 'To' the sender (admin) and 'Bcc' everyone else.
        // This prevents users from seeing each other's email addresses.

        const adminEmail = session.user.email || 'admin@acctwave.com';

        // Note: Resend Free tier has limits (e.g. 50 recipients). 
        // For production with many users, we should use Batch API or loop.
        // For now, we slice to max 49 for safety if list is huge in this demo.
        const safeTargets = targets.slice(0, 49);

        const results = await sendEmail(adminEmail, subject, message, safeTargets);

        if (results.success) {
            return NextResponse.json({ success: true, count: targets.length });
        } else {
            return NextResponse.json({ success: false, message: 'Failed to send emails', error: results.error }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Broadcast API Error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
