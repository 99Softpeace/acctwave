import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const { name, email, phoneNumber, password, referralCode } = await req.json();

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if user already exists (email or phone)
        // Check if user already exists (email or phone if provided)
        const orConditions: any[] = [{ email }];
        if (phoneNumber) {
            orConditions.push({ phoneNumber });
        }

        const existingUser = await User.findOne({
            $or: orConditions
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'User with this email or phone number already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Find Referrer (if code provided)
        let referredBy = null;
        if (referralCode) {
            const referrer = await User.findOne({ referralCode });
            if (referrer) {
                referredBy = referrer._id;
            }
        }

        // Create user
        const user = await User.create({
            name,
            email,
            phoneNumber,
            password: hashedPassword,
            balance: 0, // Start with 0 balance
            role: 'user',
            referredBy: referredBy
        });

        return NextResponse.json(
            {
                message: 'User created successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
