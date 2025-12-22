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

        // 3. Send via Resend
        // Note: Resend Free tier has limits. You might want to batch this.
        // For 'onboarding@resend.dev', you can only send to yourself unless domain is verified.

        // We will loop for individual tracking if needed, or send in batches (Resend supports multiple 'to' in one call, but Bcc is better for privacy)
        // Best Practice for Broadcast: Use 'bcc' or loop. 
        // With 'onboarding@resend.dev' you can primarily only send to the registered email.

        // Attempting to send using Resend's batch or single send
        // Since we are likely in test mode, let's try sending to the first 50 max per request or individual.

        const results = await sendEmail(targets, subject, message);

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
