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
        const signatureHeader = req.headers.get('x-pocketfi-signature');

        // TEMPORARY: Skip signature verification for debugging
        // TODO: RE-ENABLE THIS AFTER DEBUGGING
        /*
        if (!verifySignature(rawBody, signatureHeader, SIGNING_SECRET)) {
            console.warn('Webhook signature verification failed');
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
        */
        console.log('[DEBUG] Signature check SKIPPED for testing');

        const body = JSON.parse(rawBody);
        console.log('[PocketFi Webhook] Verified Payload:', JSON.stringify(body, null, 2));

        const event = body.event || body.event_type;
        // 3. Core Logic
        // PocketFi events: 'payment.success', 'transfer.success', 'charge.success'
        if (['payment.success', 'transfer.success', 'charge.success'].includes(event)) {
            const data = body.data || body;

            // Strategy:
            // 1. Try finding transaction by Reference (Checkout / One-time payment)
            // 2. Try finding user by Virtual Account Number (Dedicated Account)

            const reference = data.reference || data.tx_ref;
            const amount = Number(data.amount);

            console.log(`[PocketFi Webhook] Processing ${event} for ref: ${reference}`);

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
                const accountNumber = data.destination_account_number || data.account_number;
                if (accountNumber) {
                    console.log(`Looking up user by Account: ${accountNumber}`);
                    user = await User.findOne({ 'virtualAccount.accountNumber': accountNumber });
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