import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import VirtualNumber from '@/models/VirtualNumber';
import { authOptions } from '@/lib/auth';

import { TextVerified } from '@/lib/textverified';
import { SMSPool } from '@/lib/smspool';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { numberId } = await req.json();

        if (!numberId) {
            return NextResponse.json({ message: 'Number ID is required' }, { status: 400 });
        }

        await dbConnect();

        // Find the number and ensure it belongs to the user
        const virtualNumber = await VirtualNumber.findOne({
            _id: numberId,
            user: (session.user as any).id,
        });

        if (!virtualNumber) {
            return NextResponse.json({ message: 'Number not found' }, { status: 404 });
        }

        if (virtualNumber.status !== 'active') {
            return NextResponse.json({ message: 'Only active numbers can be cancelled' }, { status: 400 });
        }

        // Determine provider and ID
        const parts = virtualNumber.externalId ? virtualNumber.externalId.split(':') : [];
        let provider = parts.length > 1 ? parts[0] : null;
        let id = parts.length > 1 ? parts[1] : parts[0];

        // Fallback detection
        if (!provider && virtualNumber.provider) provider = virtualNumber.provider;
        if (!provider && virtualNumber.externalId && virtualNumber.externalId.startsWith('TV')) provider = 'TV';

        // Cancel on Provider
        try {
            if (provider === 'TV') {
                await TextVerified.cancelVerification(id);
                console.log(`[Cancel] Cancelled TV verification: ${id}`);
            } else if (provider === 'SP') {
                await SMSPool.cancelOrder(id);
                console.log(`[Cancel] Cancelled SMSPool order: ${id}`);
            }
        } catch (providerError: any) {
            console.error('[Cancel] Provider cancellation failed (continuing to refund):', providerError);
        }

        // Mark as cancelled
        virtualNumber.status = 'cancelled';
        await virtualNumber.save();

        // Refund User (Only if NO SMS code was received, usually)
        if (!virtualNumber.smsCode) {
            const user = await User.findById((session.user as any).id);
            if (user) {
                user.balance += virtualNumber.price;
                await user.save();
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Order cancelled and refunded successfully',
        });

    } catch (error: any) {
        console.error('Error cancelling number:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
