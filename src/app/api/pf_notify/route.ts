import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import DebugLog from '@/models/DebugLog';

// Force dynamic to prevent static generation issues
export const dynamic = 'force-dynamic';

const SIGNING_SECRET = process.env.WEBHOOK_SIGNING_SECRET;

function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
    if (!signature || !secret) return false;
    try {
        const hash = crypto.createHmac('sha512', secret)
            .update(rawBody)
            .digest('hex');
        return hash === signature;
    } catch (e) {
        console.error('Signature verification error:', e);
        return false;
    }
}

export async function GET(req: Request) {
    await DebugLog.create({ source: 'pf_notify', type: 'info', message: 'GET Request (Redirect?)' });
    return NextResponse.json({ status: 'active', message: 'PocketFi Webhook (Direct)' }, { status: 200 });
}

export async function POST(req: Request) {
    if (!SIGNING_SECRET) {
        console.error('WEBHOOK_SIGNING_SECRET is not set');
        return NextResponse.json({ message: 'Configuration error' }, { status: 500 });
    }

    try {
        await dbConnect();

        // 1. Read Raw Body
        const rawBody = await req.text();
        const signatureHeader = req.headers.get('x-pocketfi-signature') || req.headers.get('pocketfi_signature');

        // LOGGING
        await DebugLog.create({
            source: 'pf_notify',
            type: 'request',
            message: 'Direct Webhook Hit',
            metadata: {
                headers: Object.fromEntries(req.headers),
                signature: signatureHeader,
                body: rawBody
            }
        });

        if (!signatureHeader) {
            // RELAXED CHECK: If it's a verification ping (missing amount/reference), allow it.
            const tempBody = JSON.parse(rawBody);
            const hasTransactionData = (tempBody.data && (tempBody.data.amount || tempBody.data.reference)) ||
                (tempBody.order && (tempBody.order.amount || tempBody.order.reference));

            if (!hasTransactionData) {
                await DebugLog.create({ source: 'pf_notify', type: 'info', message: 'Unsigned Ping Accepted', metadata: { body: rawBody } });
                console.log('Accepting unsigned verification ping');
                return NextResponse.json({ status: 'ping_accepted' }, { status: 200 });
            }

            // If it LOOKS like a transaction but has no signature -> FORBIDDEN
            await DebugLog.create({ source: 'pf_notify', type: 'error', message: 'Missing Signature on Transaction', metadata: { header: signatureHeader } });
            return NextResponse.json({ message: 'Forbidden: Missing Signature' }, { status: 403 });
        }

        const body = JSON.parse(rawBody);
        const event = body.event || body.event_type || 'unknown';

        // 2. Identify Transaction Data (Support multiple payload formats)
        // Format A: { event: '...', data: { amount: ... } }
        // Format B: { order: { amount: ... }, customer: ... } (Virtual Accounts?)
        const data = body.data || body.order || body;

        // FIX: Reference might be in body.transaction.reference (DVA format)
        let reference = data.reference || data.tx_ref || data.id;
        if (!reference && body.transaction && body.transaction.reference) {
            reference = body.transaction.reference;
        }

        const amount = Number(data.amount || data.settlement_amount);

        // 3. Handle Missing Signature (Relaxed Mode for Debugging/Production Fix)
        if (!signatureHeader) {
            console.warn('Missing Signature Header. Checking payload content...');

            // If it has money and reference, we TRY to process it anyway (logging the risk)
            if (amount && reference) {
                await DebugLog.create({ source: 'pf_notify', type: 'warning', message: 'Processing Unsigned Transaction (Emergency)', metadata: { amount, reference } });
                // FALLTHROUGH to processing logic
            } else {
                // True Ping
                await DebugLog.create({ source: 'pf_notify', type: 'info', message: 'Unsigned Ping Accepted', metadata: { body: rawBody } });
                return NextResponse.json({ status: 'ping_accepted' }, { status: 200 });
            }
        } else {
            // 4. strict Signature Verification
            if (!verifySignature(rawBody, signatureHeader, SIGNING_SECRET)) {
                await DebugLog.create({ source: 'pf_notify', type: 'error', message: 'Signature Mismatch', metadata: { header: signatureHeader } });
                // FOR NOW: Return 403. If user complains about mismatch despite correct keys, we might need to debug key again.
                return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
            }
        }

        // Processing Logic...
        // Ensure we handle 'unknown' event if it has money
        if (amount > 0 && reference) {
            console.log(`[PF Notify] Processing Payment: ${reference} (${amount})`);

            // ... rest of logic uses 'data' and 'reference' ...


            // STEP 3: Verify transaction via PocketFi API
            try {
                const { verifyPayment } = await import('@/lib/pocketfi');
                const verification = await verifyPayment(reference);

                if (verification.status !== 'successful' && verification.data?.status !== 'successful') {
                    await DebugLog.create({ source: 'pf_notify', type: 'error', message: 'API Verification Failed', metadata: { reference, verification } });
                    return NextResponse.json({ status: 'ignored' }, { status: 200 });
                }
            } catch (verifyErr: any) {
                await DebugLog.create({ source: 'pf_notify', type: 'error', message: 'API Call Failed', metadata: { error: verifyErr.message } });
                return NextResponse.json({ status: 'ignored' }, { status: 200 });
            }

            let user = null;
            let transaction = await Transaction.findOne({ reference: reference });

            if (transaction) {
                if (transaction.status === 'successful') return NextResponse.json({ status: 'ok' });
                user = await User.findById(transaction.user);
            } else {
                const rawAccount = data.destination_account_number || data.account_number;
                if (rawAccount) {
                    const accountNumber = String(rawAccount).trim();
                    user = await User.findOne({ 'virtualAccount.accountNumber': accountNumber });
                }
            }

            if (!user) return NextResponse.json({ status: 'ok' });

            const oldBalance = user.balance;
            user.balance = Number(user.balance) + amount;
            await user.save();

            if (transaction) {
                transaction.status = 'successful';
                transaction.metadata = { ...transaction.metadata, pocketfi_payload: body };
                await transaction.save();
            } else {
                await Transaction.create({
                    user: user._id,
                    amount: amount,
                    reference: reference,
                    status: 'successful',
                    payment_method: 'bank_transfer',
                    type: 'deposit',
                    description: `Wallet Funding via Virtual Account`,
                    metadata: { pocketfi_payload: body }
                });
            }
        }

        return NextResponse.json({ status: 'ok' }, { status: 200 });

    } catch (error: any) {
        console.error('Webhook Processing Error:', error);
        await DebugLog.create({ source: 'pf_notify', type: 'error', message: 'Crash', metadata: { error: error.message } });
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
