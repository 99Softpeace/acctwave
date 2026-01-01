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
                        console.log(`[Active Check] Checking TV ID: ${id}`);
                        let check = await TextVerified.getVerification(id);

                        try {
                            const fs = require('fs');
                            const path = require('path');
                            fs.appendFileSync(path.join(process.cwd(), 'debug_tv_response.json'), JSON.stringify(check, null, 2) + '\n---\n');
                        } catch (e) { }

                        console.log(`[Active Check] TV Response:`, JSON.stringify(check));

                        // Sync Timer (if provided)
                        if (check.time_remaining) {
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

                        // Case 1: TextVerified V2 (SMS is an Object with href)
                        const isV2Link = check.sms && typeof check.sms !== 'string' && 'href' in check.sms;

                        // [REVERT] Removed Stage 1 blocking wait. We will poll the link.
                        if (isV2Link) {
                            try {
                                const href = (check.sms as any).href;
                                const relativePath = href.replace('https://www.textverified.com/api/pub/v2', '');
                                console.log(`[Active Check] Following TV SMS Link: ${relativePath}`);

                                const smsDetails = await TextVerified.request(relativePath);
                                console.log(`[Active Check] TV SMS Details:`, JSON.stringify(smsDetails));

                                final_sms_code = smsDetails.code || smsDetails.parsedCode || smsDetails.sms_code;
                                final_sms_message = smsDetails.message || (typeof smsDetails.sms === 'string' ? smsDetails.sms : null);
                            } catch (e) {
                                console.error(`[Active Check] Failed to follow SMS link:`, e);
                            }
                        } else {
                            // Case 2: Standard String Response or Mock Data
                            if (check.code) final_sms_code = check.code;
                            if ((check as any).parsedCode) final_sms_code = (check as any).parsedCode;

                            if (typeof check.sms === 'string') {
                                if (!final_sms_code && check.sms.length < 10) final_sms_code = check.sms;
                                final_sms_message = check.sms;
                            }
                        }

                        // [FINAL SAVING LOGIC]
                        if (final_sms_code) {
                            num.smsCode = final_sms_code;
                            num.fullSms = final_sms_message || `Code: ${final_sms_code}`;
                            num.status = 'completed';
                            await num.save();
                            console.log(`[Active Check] Saved Code: ${final_sms_code} for ID: ${id}`);
                        } else if (check.status === 'Completed' && final_sms_message) {
                            num.smsCode = final_sms_message.match(/\d{4,8}/)?.[0] || 'CODE';
                            num.fullSms = final_sms_message;
                            num.status = 'completed';
                            await num.save();
                        } else if (check.status === 'Cancelled' || check.status === 'Timed Out') {
                            console.log(`[TV Check] Order ${id} is ${check.status}. Processing refund...`);
                            if (!num.smsCode) {
                                try {
                                    let User = require('@/models/User').default;
                                    if (!User || !User.findByIdAndUpdate) User = require('@/models/User');
                                    await User.findByIdAndUpdate(num.user, { $inc: { balance: num.price } });
                                } catch (e) { console.error('[TV Check] Refund failed:', e); }
                            }
                            num.status = 'cancelled';
                            await num.save();
                        } else {
                            if (new Date() > new Date(num.expiresAt)) {
                                console.log(`[Auto-Refund] Number ${num.number} expired. Refunding...`);
                                try { await TextVerified.cancelVerification(id); } catch (e) { }
                                try {
                                    let User = require('@/models/User').default;
                                    if (!User || !User.findByIdAndUpdate) User = require('@/models/User');
                                    await User.findByIdAndUpdate(num.user, { $inc: { balance: num.price } });
                                } catch (e) { }
                                num.status = 'cancelled';
                                await num.save();
                            } else {
                                await num.save();
                            }
                        }
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
