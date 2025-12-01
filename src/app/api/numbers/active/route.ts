import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import VirtualNumber from '@/models/VirtualNumber';
import { authOptions } from '@/lib/auth';
import { TextVerified } from '@/lib/textverified';
import { SMSPool } from '@/lib/smspool';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Find active numbers
        const activeNumbers = await VirtualNumber.find({
            user: (session.user as any).id,
            status: 'active',
            expiresAt: { $gt: new Date() } // Not expired
        }).sort({ createdAt: -1 });

        // Check for SMS updates for each active number
        const updatedNumbers = await Promise.all(activeNumbers.map(async (num) => {
            // Only check if we haven't received code yet
            if (!num.smsCode) {
                try {
                    const [provider, id] = num.externalId.split(':');

                    if (provider === 'TV') {
                        const check = await TextVerified.getVerification(id);
                        if (check.code) {
                            num.smsCode = check.code;
                            num.fullSms = check.sms || `Code: ${check.code}`;
                            num.status = 'completed';
                            await num.save();
                        } else if (check.status === 'Cancelled' || check.status === 'Timed Out') {
                            num.status = 'cancelled';
                            await num.save();
                        }
                    } else if (provider === 'SP') {
                        const check = await SMSPool.checkOrder(id);
                        if (check.code) {
                            num.smsCode = check.code;
                            num.fullSms = check.full_code || `Code: ${check.code}`;
                            num.status = 'completed';
                            await num.save();
                        } else if (check.status === 'EXPIRED' || check.status === 'REFUNDED') {
                            num.status = 'cancelled';
                            await num.save();
                        }
                    }
                } catch (e) {
                    console.error(`Error checking status for ${num.externalId}:`, e);
                }
            }
            return num;
        }));

        return NextResponse.json({
            success: true,
            data: updatedNumbers,
        });

    } catch (error: any) {
        console.error('Error fetching active numbers:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
