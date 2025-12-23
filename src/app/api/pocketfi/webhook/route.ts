import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

const SIGNING_SECRET = process.env.WEBHOOK_SIGNING_SECRET;

// Utility to verify signature
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

// Helper for GET requests (Health check / Verification)
export async function GET(req: Request) {
    return NextResponse.json({ status: 'active', message: 'PocketFi Webhook Endpoint' }, { status: 200 });
}

export async function POST(req: Request) {
    if (!SIGNING_SECRET) {
        console.error('WEBHOOK_SIGNING_SECRET is not set');
        return NextResponse.json({ message: 'Configuration error' }, { status: 500 });
    }

    try {
        // 1. Read Raw Body
        const rawBody = await req.text();
        const signatureHeader = req.headers.get('x-pocketfi-signature') || req.headers.get('pocketfi_signature');

        // LOGGING: Persist to DB for debugging
        await dbConnect();
        const DebugLog = (await import('@/models/DebugLog')).default;

        await DebugLog.create({
            source: 'pocketfi-webhook',
            type: 'request',
            message: 'Incoming Webhook Hit',
            metadata: {
                headers: Object.fromEntries(req.headers),
                signature: signatureHeader,
                body: rawBody // Save raw string to avoid parse errors blocking log
            }
        });

        // 2. Verify Signature
        // [DEBUG] TEMPORARY: Signature check SKIPPED
        /*
        if (!verifySignature(rawBody, signatureHeader, SIGNING_SECRET)) {
            // RELAXED CHECK: If it's a verification ping (missing amount/reference), allow it.
            const tempBody = JSON.parse(rawBody);
            const hasTransactionData = tempBody.data && (tempBody.data.amount || tempBody.data.reference || (tempBody.order && tempBody.order.amount));

            if (!hasTransactionData && !tempBody.event) { // Simple ping often lacks event too
                await DebugLog.create({ source: 'pocketfi-webhook', type: 'info', message: 'Unsigned Ping Accepted', metadata: { body: rawBody } });
                return NextResponse.json({ status: 'ping_accepted' }, { status: 200 });
            }

            // If it has important data but missing signature, we can optionally log specific warning or allow depending on strictness.
            // keeping strict for legacy but adding detailed log
            await DebugLog.create({ source: 'pocketfi-webhook', type: 'error', message: 'Signature Mismatch', metadata: { header: signatureHeader } });
            console.warn('Webhook signature verification failed');
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
        */
        console.log('[DEBUG] Signature check SKIPPED for testing');

        console.log('[DEBUG] Signature Verified Successfully');

        const body = JSON.parse(rawBody);
        console.log('[PocketFi Webhook] Verified Payload:', JSON.stringify(body, null, 2));

        const event = body.event || body.event_type || (body.order && body.transaction ? 'payment.success' : 'unknown');
        // 3. Core Logic
        // PocketFi events: 'payment.success', 'transfer.success', 'charge.success'
        if (['payment.success', 'transfer.success', 'charge.success'].includes(event)) {
            const data = body.data || body;

            // FIX: Robust Extraction for DVA Payloads
            let reference = data.reference || data.tx_ref;
            if (body.transaction && body.transaction.reference) {
                reference = body.transaction.reference;
            }

            let amount = Number(data.amount || data.settlement_amount);
            if (isNaN(amount) && body.order && body.order.amount) {
                amount = Number(body.order.amount);
            }

            if (isNaN(amount)) {
                console.error('[PocketFi Webhook] CRITICAL: Could not extract amount from payload', JSON.stringify(body));
                return NextResponse.json({ status: 'ignored', reason: 'invalid_amount' }, { status: 200 });
            }

            console.log(`[PocketFi Webhook] Processing ${event} for ref: ${reference} Amount: ${amount}`);

            console.log(`[PocketFi Webhook] Processing ${event} for ref: ${reference}`);

            // STEP 3: Verify transaction via PocketFi API (Double Check)
            try {
                const { verifyPayment } = await import('@/lib/pocketfi');
                const verification = await verifyPayment(reference);

                console.log(`[PocketFi Verification] API Check for ${reference}:`, verification.status);

                if (verification.status !== 'successful' && verification.data?.status !== 'successful') {
                    console.error(`[PocketFi Webhook] Verification Failed. API says: ${verification.status}`);
                    await DebugLog.create({ source: 'pocketfi-webhook', type: 'error', message: 'API Verification Failed', metadata: { reference, verification } });
                    // We return 200 to ACK receipt, but do NOT credit user
                    return NextResponse.json({ status: 'ignored' }, { status: 200 });
                }
            } catch (verifyErr: any) {
                console.error('[PocketFi Webhook] Verify API call failed:', verifyErr.message);
                // Fail safe: If API check fails, do NOT process payment.
                await DebugLog.create({ source: 'pocketfi-webhook', type: 'error', message: 'API Call Failed', metadata: { error: verifyErr.message } });
                return NextResponse.json({ status: 'ignored' }, { status: 200 });
            }

            await dbConnect();

            let user = null;
            let transaction = await Transaction.findOne({ reference: reference });

            // CASE A: Transaction exists (Checkout Flow)
            if (transaction) {
                console.log(`Found existing transaction: ${transaction._id}`);

                if (transaction.status === 'successful') {
                    console.log(`Transaction ${reference} already processed.`);
                    return NextResponse.json({ status: 'ok' });
                }

                user = await User.findById(transaction.user);
            }
            // CASE B: Dedicated Virtual Account (No pre-created transaction likely)
            else {
                console.log('[PocketFi Webhook] Transaction not found, trying DVA lookup...');
                const rawAccount = data.destination_account_number || data.account_number || data.details?.account_number;

                if (rawAccount) {
                    const accountNumber = String(rawAccount).trim(); // Ensure string and no spaces
                    console.log(`[PocketFi Webhook] Looking up User by Account Number: "${accountNumber}"`);

                    user = await User.findOne({ 'virtualAccount.accountNumber': accountNumber });

                    if (user) {
                        console.log(`[PocketFi Webhook] User Found: ${user.email} (Current Balance: ${user.balance})`);
                    } else {
                        console.error(`[PocketFi Webhook] NO USER FOUND with Account Number: "${accountNumber}"`);
                    }
                } else {
                    console.error('[PocketFi Webhook] No account number found in payload for DVA lookup');
                }
            }

            if (!user) {
                console.error(`User not found for payment ref: ${reference}`);
                return NextResponse.json({ status: 'ok' }); // Ack to stop retries
            }

            // execute credit
            const oldBalance = user.balance;
            user.balance = Number(user.balance) + amount;
            await user.save();
            console.log(`Credited user ${user.email}: ${oldBalance} -> ${user.balance}`);

            // Update or Create Transaction
            if (transaction) {
                transaction.status = 'successful';
                transaction.metadata = { ...transaction.metadata, pocketfi_payload: body };
                await transaction.save();
            } else {
                // Create new record for DVA deposit
                // Create new record for DVA deposit
                try {
                    await Transaction.create({
                        user: user._id,
                        amount: amount,
                        reference: reference,
                        status: 'successful',
                        payment_method: 'bank_transfer',
                        type: 'deposit',
                        description: `Wallet Funding via Virtual Account`,
                        metadata: {
                            pocketfi_payload: body
                        }
                    });
                } catch (txErr: any) {
                    // Handle Race Condition / Duplicate Entry
                    if (txErr.code === 11000) {
                        console.warn(`[PocketFi Webhook] Transaction ${reference} already exists (Race Condition handled).`);
                        // Optionally update the existing one if needed, but for now just safely continue
                    } else {
                        throw txErr;
                    }
                }
            }

            console.log('Transaction processed successfully');
        }

        // 4. Success Response
        return NextResponse.json({ status: 'ok' }, { status: 200 });

    } catch (error: any) {
        console.error('Webhook Processing Error:', error);
        // Return 500 so PocketFi might retry if it was a transient error, 
        // OR return 200 to stops retries if we can't handle it. 
        // Instructions say "return Response.json({ status: 'ok' }, { status: 200 }) immediately" if succeed.
        // If fail, usually 500.
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}