import { NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/models/User';
import connectToDatabase from '@/lib/db';
import { sendEmail } from '@/lib/mail';

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { email, phoneNumber } = await req.json();

        let user;
        if (email) {
            user = await User.findOne({ email });
        } else if (phoneNumber) {
            user = await User.findOne({ phoneNumber });
        }

        if (!user) {
            // We return 200 even if user doesn't exist to prevent enumeration
            return NextResponse.json(
                { message: 'If an account with that identifier exists, we have sent a password reset message.' },
                { status: 200 }
            );
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Token expires in 10 minutes
        const resetPasswordExpires = Date.now() + 10 * 60 * 1000;

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();

        // Create reset URL
        const protocol = req.headers.get('x-forwarded-proto') || 'http';
        const host = req.headers.get('host');
        const resetUrl = `${protocol}://${host}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        const html = `
            <p>You requested a password reset</p>
            <p>Click this <a href="${resetUrl}">link</a> to set a new password</p>
        `;

        try {
            if (email) {
                await sendEmail({
                    to: user.email,
                    subject: 'Password reset token',
                    text: message,
                    html: html,
                });
            } else if (phoneNumber) {
                // SMS STUB
                console.log('----------------------------------------');
                console.log(`[SMS STUB] Sending Password Reset Code to ${phoneNumber}`);
                console.log(`[SMS STUB] Reset Link: ${resetUrl}`);
                console.log('----------------------------------------');
            }

            return NextResponse.json(
                { message: 'Reset instruction sent' },
                { status: 200 }
            );
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return NextResponse.json(
                { message: 'Could not send reset instruction' },
                { status: 500 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
