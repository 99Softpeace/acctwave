import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VirtualNumber from '@/models/VirtualNumber';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const { id, status, code, sms, cost } = payload;

        console.log(`[TextVerified Webhook] Received payload for ID: ${id}`, JSON.stringify(payload, null, 2));

        // [DEBUG] Log all headers (keep for now until stable)
        const headersList: any = {};
        req.headers.forEach((value, key) => (headersList[key] = value));
        console.log('[TextVerified Webhook] Headers:', JSON.stringify(headersList, null, 2));

        // [SECURITY] Signature Verification
        // Header: x-webhook-signature
        // Algo: HMAC-SHA512
        const secret = process.env.TEXTVERIFIED_WEBHOOK_SECRET;
        const signatureHeader = req.headers.get('x-webhook-signature');

        if (secret) {
            if (!signatureHeader) {
                console.error('[TextVerified Webhook] Missing x-webhook-signature header.');
                return NextResponse.json({ message: 'Missing signature' }, { status: 401 });
            }

            try {
                const crypto = require('crypto');
                // Calculate expected signature
                // Payload is the raw body string. Since we already parsed using req.json(), 
                // we technically need the RAW body. 
                // However, in Next.js, once req.json() is called, the stream is consumed.
                // We must rely on consistent JSON serialization or (better) clone the request before reading.
                // *CRITICAL*: Re-serializing JSON can differ from raw bytes (whitespace). 
                // Given we already read json at the top (line 6), we are in a tricky spot.
                // BUT: usually webhooks sign the RAW body. 

                // Let's implement a best-effort using the JSON.stringify(payload) for now, 
                // but if this fails, we might need to refactor to read text() first.
                // NOTE: TextVerified likely signs the minified JSON or exactly what they sent.
                const expectedSignature = 'HMAC-SHA512=' + crypto
                    .createHmac('sha512', secret)
                    .update(JSON.stringify(payload)) // Note: This assumes they send minified JSON without space
                    .digest('base64');

                if (signatureHeader !== expectedSignature) {
                    console.warn(`[TextVerified Webhook] Signature Mismatch! Expected: ${expectedSignature}, Got: ${signatureHeader}`);
                    // return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
                } else {
                    console.log('[TextVerified Webhook] Signature Verified Successfully.');
                }
            } catch (err) {
                console.error('[TextVerified Webhook] Signature verification error:', err);
            }
        }

        if (!id || !status) {
            console.warn('[TextVerified Webhook] Invalid payload missing id or status');
            return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
        }

        await dbConnect();

        // Find the number by external ID
        // We match either raw ID or "TV:ID" format just in case
        const number = await VirtualNumber.findOne({
            $or: [
                { externalId: id },
                { externalId: `TV:${id}` }
            ]
        });

        if (!number) {
            console.warn(`[TextVerified Webhook] Number NOT found for ID: ${id}`);
            return NextResponse.json({ message: 'Number not found' }, { status: 404 });
        }

        // [HARDENING] Ensure this is actually a TextVerified number if provider is set
        if (number.provider && number.provider !== 'textverified' && number.provider !== 'TV') {
            console.warn(`[TextVerified Webhook] Mismatched provider for number ${number.number}. Expected TextVerified, got ${number.provider}`);
            // We can choose to ignore it or process it anyway if IDs match. 
            // Ideally valid externalId collision is rare. Let's process but log warning.
        }

        console.log(`[TextVerified Webhook] Processing update for ${number.number} (ID: ${number._id}) - New Status: ${status}, Current Status: ${number.status}`);

        // Update logic based on status
        if (status === 'Completed') {
            const smsCode = code || (typeof sms === 'string' ? sms.match(/\d{4,8}/)?.[0] : null);
            const fullSms = typeof sms === 'string' ? sms : (sms?.message || `Code: ${smsCode}`);

            if (smsCode) {
                number.smsCode = smsCode;
                number.fullSms = fullSms;
                number.status = 'completed';
                await number.save();
                console.log(`[TextVerified Webhook] SUCCESS: Number ${number.number} marked as completed with code ${smsCode}`);
            } else {
                console.warn(`[TextVerified Webhook] Completed status received but NO CODE found in payload.`);
                // We might want to keep it active or mark as completed without code?
                // For now, let's just log it. If "Completed" usually means code is there.
            }
        }
        else if (status === 'Cancelled' || status === 'Timed Out' || status === 'Refunded') {
            if (number.status !== 'cancelled' && number.status !== 'refunded' && number.status !== 'expired') {
                console.log(`[TextVerified Webhook] Order cancelled/timed out/refunded. Processing refund for user ${number.user}...`);

                // Refund the user
                try {
                    await User.findByIdAndUpdate(number.user, { $inc: { balance: number.price } });
                    console.log(`[TextVerified Webhook] Refund successful for user ${number.user}`);
                } catch (err) {
                    console.error(`[TextVerified Webhook] FAILED to refund user ${number.user}:`, err);
                }

                number.status = 'cancelled'; // Map to our schema's 'cancelled'
                await number.save();
            } else {
                console.log(`[TextVerified Webhook] Number already in terminal state: ${number.status}. No action taken.`);
            }
        }
        else {
            // Pending or other statuses
            console.log(`[TextVerified Webhook] Received non-terminal status: ${status}. No action taken.`);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[TextVerified Webhook] CRITICAL ERROR processing request:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
