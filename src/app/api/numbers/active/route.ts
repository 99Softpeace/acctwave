import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import VirtualNumber from '@/models/VirtualNumber';
import { authOptions } from '@/lib/auth';
import { TextVerified } from '@/lib/textverified';
import { SMSPool } from '@/lib/smspool';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // [USER_ID_CHECK]
        const currentUserId = (session.user as any).id;
        console.log(`[Active API] Current User Session ID: ${currentUserId}`);

        // Find active or recently completed numbers
        const activeNumbers = await VirtualNumber.find({
            user: currentUserId,
            $or: [
                { status: 'active', expiresAt: { $gt: new Date() } },
                { status: 'completed' } // Show completed numbers so OTP persists
            ]
        }).sort({ createdAt: -1 });

        console.log(`[Active API] Found ${activeNumbers.length} active numbers for user.`);

        // Check for SMS updates for each active number
        const updatedNumbers = await Promise.all(activeNumbers.map(async (num) => {
            try {
                // Only check if we haven't received code yet
                if (!num.smsCode) {
                    const parts = num.externalId ? num.externalId.split(':') : [];
                    let provider = parts.length > 1 ? parts[0] : null;
                    let id = parts.length > 1 ? parts[1] : parts[0];

                    // Fallback provider detection if prefix missing
                    if (!provider && num.provider) provider = num.provider;
                    if (!provider && num.externalId && num.externalId.startsWith('TV')) provider = 'TV';



                    // [NORMALIZATION] Create a single variable for the final code
                    let final_sms_code: string | null = null;
                    let final_sms_message: string | null = null;

                    if (provider === 'TV') {
                        // [WEBHOOK ONLY MODE]
                        // We disabled polling for TextVerified to rely 100% on the Webhook.
                        // This prevents race conditions and sets up a cleaner flow.
                        // The dashboard will still confirm 'active' status from DB, but won't ping TV API.
                        // If Webhook updates the DB, the next refresh here will pick it up automatically.
                        // console.log(`[Active Check] TV Polling Skipped for ${id} (Webhook Mode)`);
                    } else if (provider === 'SP') {
                        const check = await SMSPool.checkOrder(id);
                        if (check.code || check.status === 'COMPLETED' || check.status === '3') {
                            if (check.code) {
                                num.smsCode = check.code;
                                num.fullSms = check.full_code || `Code: ${check.code}`;
                            }
                            num.status = 'completed';
                            await num.save();
                        } else if (check.status === 'EXPIRED' || check.status === 'REFUNDED' || new Date() > new Date(num.expiresAt)) {
                            if (!num.smsCode) {
                                try {
                                    let User = require('@/models/User').default;
                                    if (!User || !User.findByIdAndUpdate) User = require('@/models/User');
                                    await User.findByIdAndUpdate(num.user, { $inc: { balance: num.price } });
                                } catch (e) { }
                            }
                            num.status = 'cancelled';
                            await num.save();
                        }
                    }
                }
            } catch (e) {
                console.error(`Error checking status for ${num.externalId}:`, e);
            }
            return num;
        }));

        const responseData = {
            success: true,
            data: updatedNumbers,
        };
        console.log("SENDING DATA TO FRONTEND:", JSON.stringify(responseData, null, 2));
        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error('Error fetching active numbers:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
