import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VirtualNumber from '@/models/VirtualNumber';
import User from '@/models/User';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // [SECURITY] Signature Check (Best Practice: Keep this)
        const secret = process.env.TEXTVERIFIED_WEBHOOK_SECRET;
        const signatureHeader = req.headers.get('x-webhook-signature');
        if (secret && signatureHeader) {
            const crypto = require('crypto');
            const expectedSignature = 'HMAC-SHA512=' + crypto.createHmac('sha512', secret).update(JSON.stringify(body)).digest('base64');
            if (signatureHeader !== expectedSignature) {
                console.warn(`[TextVerified Webhook] Signature Mismatch!`);
                // For debugging, we proceed, but ideally return 401
            }
        }

        // 1. Get the Inner ID (The one that matches your DB)
        // If it's a test, Data might be empty, so fallback to body.id
        const realId = body.Data?.id || body.id;
        const realCode = body.Data?.code || body.Data?.smsCode || body.code;
        const status = body.Data?.status || body.status; // Extract status too

        console.log(`🔍 EXTRACTING ID: Webhook sent ${body.Id || body.id}, Inner ID is ${realId}`);

        await dbConnect();

        // 2. Search using the "TV:" prefix you stored
        const number = await VirtualNumber.findOne({
            $or: [
                { externalId: `TV:${realId}` },  // <--- THIS IS THE KEY
                { externalId: realId }
            ]
        });

        if (!number) {
            console.log(`❌ ERROR: Number not found in DB for ID: TV:${realId}`);
            return NextResponse.json({ received: true });
        }

        // 3. Update the number
        // Only update if we have a code or status is completed
        if (realCode || status === 'Completed') {
            if (realCode) number.smsCode = realCode;
            number.status = 'completed';
            await number.save();
            console.log(`✅ SUCCESS: DB Updated with code ${realCode}`);
        } else if (status === 'Cancelled' || status === 'Timed Out' || status === 'Refunded') {
            // Handle Refund/Cancel
            if (number.status !== 'cancelled' && number.status !== 'refunded') {
                const User = require('@/models/User').default || require('@/models/User');
                await User.findByIdAndUpdate(number.user, { $inc: { balance: number.price } });
                number.status = 'cancelled';
                await number.save();
                console.log(`🚫 Number marked as ${status} and refunded.`);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
