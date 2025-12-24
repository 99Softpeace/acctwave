import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        // 1. Fetch User Data (Code, Balance)
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Lazy Generate Referral Code if missing
        if (!user.referralCode) {
            const firstName = user.name ? user.name.split(' ')[0].toUpperCase().slice(0, 3) : 'USR';
            const randomNum = Math.floor(100 + Math.random() * 900); // 3 digit random
            user.referralCode = `${firstName}${randomNum}`;
            await user.save();
        }

        // 2. Fetch Referred Users
        const referrals = await User.find({ referredBy: user._id })
            .select('email createdAt balance')
            .sort({ createdAt: -1 });

        // 3. Calculate Total Earnings (Sum of commission transactions)
        // OR we can just iterate the referrals and sum their contributions if we tracked it there, 
        // but Transaction table is the source of truth for earnings.
        const commissiontxs = await Transaction.find({
            user: user._id,
            type: 'commission',
            status: 'successful'
        });

        const totalEarnings = commissiontxs.reduce((sum, tx) => sum + (tx.amount || 0), 0);

        // Format Referrals for UI
        const formattedReferrals = referrals.map(ref => ({
            user: ref.email, // Mask email? e.g. pea***@gmail.com
            date: new Date(ref.createdAt).toLocaleDateString(),
            status: 'Active', // Simple logic: if they exist, they are active
            // Calculate how much THIS specific user generated?
            // Expensive query loop. For now, show "0" or generic until needed.
            earned: '₦' + commissiontxs
                .filter(tx => tx.metadata?.source_user_id?.toString() === ref._id.toString())
                .reduce((sum, tx) => sum + (tx.amount || 0), 0).toLocaleString()
        }));

        return NextResponse.json({
            referralCode: user.referralCode,
            referralBalance: user.referralBalance || 0,
            totalEarnings: totalEarnings,
            activeReferrals: referrals.length,
            referrals: formattedReferrals
        });

    } catch (error) {
        console.error('Error fetching referral data:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
