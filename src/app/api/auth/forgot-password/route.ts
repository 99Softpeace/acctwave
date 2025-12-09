import { NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/models/User';
import connectToDatabase from '@/lib/db';
import { sendEmail } from '@/lib/mail';

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { email } = await req.json();

        const user = await User.findOne({ email });

        if (!user) {
            // We return 200 even if user doesn't exist to prevent email enumeration
            return NextResponse.json(
                { message: 'If an account with that email exists, we have sent a password reset link.' },
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
            await sendEmail({
                to: user.email,
                subject: 'Password reset token',
                text: message,
                html: html,
            });

            return NextResponse.json(
                { message: 'Email sent' },
                { status: 200 }
            );
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return NextResponse.json(
                { message: 'Email could not be sent' },
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
