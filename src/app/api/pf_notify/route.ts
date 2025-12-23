import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(req: Request) {
    try {
        // 1. Log Raw Payload to see EXACTLY what PocketFi sends
        const rawBody = await req.text();
        console.log('[PF Notify] RAW BODY:', rawBody);

        const body = JSON.parse(rawBody);
        const data = body.data || body;
        const event = body.event || body.event_type;

        // 2. Extract Key Fields (Amount & Reference)
        const amount = Number(data.amount) || Number(data.amount_paid);
        const reference = data.reference || data.tx_ref || data.id;

        console.log(`[PF Notify] Event: ${event}, Ref: ${reference}, Amount: ${amount}`);

        await dbConnect();

        // 3. STRATEGY A: Try finding an existing Transaction (Checkout Flow)
        // (This usually works for Card payments, but fails for Bank Transfers)
        let transaction = await Transaction.findOne({ reference: reference });
        if (transaction) {
            console.log(`[PF Notify] Found Transaction: ${transaction._id}`);
            // ... (Process transaction logic would go here)
        }

        // 4. STRATEGY B: Find User by Account Number (Bank Transfer Flow)
        // We check EVERY possible place the account number might be hiding.
        const incomingAccount =
            data.destination_account_number ||
            data.account_number ||
            data.details?.account_number ||
            data.details?.destination_account_number ||
            data.customer?.account_number ||
            data.user?.account_number;

        console.log(`[PF Notify] Extracted Account Number: ${incomingAccount}`);

        if (!incomingAccount) {
            console.error('[PF Notify] ERROR: Could not find ANY account number in payload.');
            // We return 200 to stop PocketFi from retrying endlessly on a bad payload
            return NextResponse.json({ status: 'ok', warning: 'No account number found' });
        }

        // 5. Find the User
        const user = await User.findOne({ 'virtualAccount.accountNumber': incomingAccount });

        if (!user) {
            console.error(`[PF Notify] ERROR: No user found with Virtual Account: ${incomingAccount}`);
            return NextResponse.json({ status: 'ok', warning: 'User not found' });
        }

        console.log(`[PF Notify] SUCCESS: Found User: ${user.email} (Current Bal: ${user.balance})`);

        // 6. Credit the Wallet
        // Ensure we treat numbers as numbers to avoid "100" + "100" = "100100" string errors
        const oldBalance = Number(user.balance || 0);
        const creditAmount = Number(amount);

        user.balance = oldBalance + creditAmount;
        await user.save();

        console.log(`[PF Notify] CREDITED: ₦${creditAmount}. New Balance: ₦${user.balance}`);

        // 7. Create a Record so they see it in "Transactions"
        await Transaction.create({
            user: user._id,
            amount: creditAmount,
            reference: reference || `BANK-${Date.now()}`,
            status: 'successful',
            type: 'deposit',
            description: 'Bank Transfer Deposit',
            payment_method: 'bank_transfer',
            metadata: {
                pocketfi_payload: body
            }
        });

        return NextResponse.json({ status: 'ok' });

    } catch (error: any) {
        console.error('[PF Notify] CRITICAL ERROR:', error);
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
