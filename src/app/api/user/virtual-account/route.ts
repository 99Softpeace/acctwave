import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';
import { createVirtualAccount } from '@/lib/pocketfi';

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

        // Check if user already has a virtual account
        if (user.virtualAccount && user.virtualAccount.accountNumber) {
            return NextResponse.json({
                success: true,
                data: user.virtualAccount,
                balance: user.balance // [NEW] Return balance
            });
        }

        // Generate a real dedicated virtual account
        console.log(`Creating virtual account for ${user.email}`);

        // Ensure phone number exists (fallback if missing)
        const phoneNumber = user.phoneNumber || `080${Math.floor(Math.random() * 90000000 + 10000000)}`;

        const dvaResponse = await createVirtualAccount(user.email, user.name, phoneNumber);

        if (dvaResponse.status === 'success' || dvaResponse.success || dvaResponse.status === true) {
            // Handle Kuda Response Structure (banks array)
            const accountData = dvaResponse.banks ? dvaResponse.banks[0] : dvaResponse.data;

            if (!accountData) {
                throw new Error('No account data returned from PocketFi');
            }

            // Map API response to our schema
            const newAccount = {
                bankName: accountData.bankName || accountData.bank_name || accountData.bank || 'PocketFi Bank',
                accountNumber: accountData.accountNumber || accountData.account_number || accountData.number,
                accountName: accountData.accountName || accountData.account_name || user.name
            };

            // Save to user
            user.virtualAccount = newAccount;
            await user.save();

            return NextResponse.json({
                success: true,
                data: newAccount,
                balance: user.balance // [NEW] Return balance
            });
        } else {
            console.error('PocketFi Create Account Failed:', dvaResponse);
            throw new Error(dvaResponse.message || JSON.stringify(dvaResponse));
        }

    } catch (error: any) {
        console.error('Error fetching virtual account:', error);
        return NextResponse.json(
            {
                message: error.message || 'Internal server error',
                details: error.toString()
            },
            { status: 500 }
        );
    }
}
