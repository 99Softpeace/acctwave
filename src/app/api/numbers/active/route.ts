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

        // Find active numbers
        // Find active or recently completed numbers
        const activeNumbers = await VirtualNumber.find({
            user: (session.user as any).id,
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

                    if (provider === 'TV') {
                        console.log(`[Active Check] Checking TV ID: ${id}`);
                        const check = await TextVerified.getVerification(id);
                        console.log(`[Active Check] TV Response:`, JSON.stringify(check));
                        console.log(`[TV Check] ID: ${id}, RAW:`, JSON.stringify(check));
                        console.log(`[TV Check] Status: ${check.status}, Code: ${check.code || check.sms}`);

                        // Sync Timer (if provided)
                        if (check.time_remaining) {
                            // Format is usually "MM:SS" or "HH:MM:SS"
                            const timeParts = check.time_remaining.split(':').map(Number);
                            let remainingSeconds = 0;
                            if (timeParts.length === 2) remainingSeconds = timeParts[0] * 60 + timeParts[1];
                            else if (timeParts.length === 3) remainingSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];

                            if (remainingSeconds > 0) {
                                const newExpiresAt = new Date();
                                newExpiresAt.setSeconds(newExpiresAt.getSeconds() + remainingSeconds);
                                num.expiresAt = newExpiresAt;
                            }
                        }

                        if (check.code || (check.sms && check.sms.length < 10)) { // Simple heuristic for code
                            num.smsCode = check.code || check.sms;
                            num.fullSms = check.sms || `Code: ${check.code}`;
                            num.status = 'completed';
                            await num.save();
                        } else if (check.status === 'Completed' && check.sms) {
                            // Sometimes status is completed but code field is empty, but SMS has content
                            num.smsCode = check.sms.match(/\d{4,8}/)?.[0] || 'CODE'; // Try to extract
                            num.fullSms = check.sms;
                            num.status = 'completed';
                            await num.save();
                        } else if (check.status === 'Cancelled' || check.status === 'Timed Out') {
                            console.log(`[TV Check] Order ${id} is ${check.status}. Processing refund...`);

                            // Refund User (if no code)
                            if (!num.smsCode) {
                                try {
                                    let User = require('@/models/User').default;
                                    if (!User || !User.findByIdAndUpdate) User = require('@/models/User');

                                    await User.findByIdAndUpdate(num.user, { $inc: { balance: num.price } });
                                    console.log(`[TV Check] Refunded ${num.price} for ${check.status} order.`);
                                } catch (e) {
                                    console.error('[TV Check] Refund failed:', e);
                                }
                            }

                            num.status = 'cancelled';
                            await num.save();
                        } else {
                            // Check for Local Expiration (5 minutes passed?)
                            if (new Date() > new Date(num.expiresAt)) {
                                console.log(`[Auto-Refund] Number ${num.number} expired without code. Refunding...`);

                                // 1. Cancel on Provider
                                try {
                                    await TextVerified.cancelVerification(id);
                                } catch (e) {
                                    console.error('[Auto-Refund] Failed to cancel on TV:', e);
                                }

                                // 2. Refund User
                                try {
                                    // Robust import for User model
                                    let User = require('@/models/User').default;
                                    if (!User || !User.findByIdAndUpdate) {
                                        User = require('@/models/User');
                                    }

                                    console.log(`[Auto-Refund] Refunding User ${num.user}, Amount: ${num.price}`);
                                    const refundRes = await User.findByIdAndUpdate(num.user, { $inc: { balance: num.price } });

                                    if (refundRes) {
                                        console.log('[Auto-Refund] Refund successful.');
                                    } else {
                                        console.error('[Auto-Refund] User not found during refund.');
                                    }

                                } catch (e) {
                                    console.error('[Auto-Refund] Failed to refund user:', e);
                                }

                                // 3. Update Status
                                num.status = 'cancelled';
                                await num.save();
                            } else {
                                // Just save the time update if active
                                await num.save();
                            }
                        }
                    } else if (provider === 'SP') {
                        const check = await SMSPool.checkOrder(id);
                        console.log(`[SMSPool Check] ID: ${id}, Status: ${check.status}, Code: ${check.code}`);

                        // Check for code OR 'completed' status
                        if (check.code || check.status === 'COMPLETED' || check.status === '3') {
                            if (check.code) {
                                num.smsCode = check.code;
                                num.fullSms = check.full_code || `Code: ${check.code}`;
                            }
                            num.status = 'completed';
                            await num.save();
                        } else if (check.status === 'EXPIRED' || check.status === 'REFUNDED') {
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

        return NextResponse.json({
            success: true,
            data: updatedNumbers,
        });

    } catch (error: any) {
        console.error('Error fetching active numbers:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
