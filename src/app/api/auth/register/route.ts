import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const { name, email, password, referralCode: providedRefCode } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Please provide all fields' },
                { status: 400 }
            );
        }

        await dbConnect();

        const userExists = await User.findOne({ email });

        if (userExists) {
            return NextResponse.json(
                { message: 'User already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate Referral Code (First 3 chars of name + 3 random numbers)
        const baseCode = name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
        const randomNum = Math.floor(100 + Math.random() * 900);
        let newReferralCode = `${baseCode}${randomNum}`;

        // Ensure uniqueness (simple retry)
        let isUnique = false;
        while (!isUnique) {
            const existing = await User.findOne({ referralCode: newReferralCode });
            if (!existing) isUnique = true;
            else newReferralCode = `${baseCode}${Math.floor(100 + Math.random() * 900)}`;
        }

        let referredBy = null;

        if (providedRefCode) {
            console.log(`[Register] Attempting to link with referral code: "${providedRefCode}"`);
            // Case-insensitive lookup attempt
            const referrer = await User.findOne({
                referralCode: { $regex: new RegExp(`^${providedRefCode}$`, 'i') }
            });

            if (referrer) {
                console.log(`[Register] Found referrer: ${referrer.email} (${referrer._id})`);
                referredBy = referrer._id;
            } else {
                console.log(`[Register] Referral code "${providedRefCode}" not found.`);
            }
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            balance: 0,
            referralCode: newReferralCode,
            referredBy: referredBy,
        });

        return NextResponse.json(
            { message: 'User registered successfully', userId: user._id },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: 'An error occurred while registering the user' },
            { status: 500 }
        );
    }
}
