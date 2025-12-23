import { NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/pocketfi';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('--- Payment Callback Received ---');
        console.log('Payload:', JSON.stringify(body, null, 2));

        const { reference, status, event_type, account_number, amount } = body;

        // Handle Dedicated Account Transfers (Event type usually differs)
        if (body.account_number || (event_type && event_type.includes('transfer'))) {
            // This is a virtual account transfer
            const accountNumber = body.account_number || body.data?.account_number || body.destination_account_number || body.details?.account_number;
            const transferAmount = body.amount || body.data?.amount;

            if (!accountNumber) {
                return NextResponse.json({ success: false, message: 'No account number found' }, { status: 400 });
            }

            await dbConnect();

            // Find user by their virtual account number
            const user = await User.findOne({ 'virtualAccount.accountNumber': accountNumber });

            if (!user) {
                return NextResponse.json({ success: false, message: 'User with this account not found' }, { status: 404 });
            }

            // Create a transaction record for this transfer
            const txReference = reference || `TRX-${Date.now()}`;

            // Check if already processed
            const existingTx = await Transaction.findOne({ reference: txReference });
            if (existingTx) {
                return NextResponse.json({ success: true, message: 'Transaction already processed' });
            }

            // Credit the user
            const creditAmount = Number(transferAmount);
            user.balance = Number(user.balance) + creditAmount;
            await user.save();

            // Create transaction history
            await Transaction.create({
                user: user._id,
                amount: creditAmount,
                reference: txReference,
                status: 'successful',
                payment_method: 'bank_transfer',
                type: 'deposit',
                description: 'Wallet Funding via Bank Transfer',
                metadata: {
                    sender_bank: body.sender_bank,
                    sender_name: body.sender_name,
                    pocketfi_payload: body
                }
            });

            console.log(`[WEBHOOK] Credited ${creditAmount} to ${user.email} via DVA ${accountNumber}`);
            return NextResponse.json({ success: true });
        }

        if (!reference) {
            console.error('Callback missing reference');
            return NextResponse.json({ success: false, message: 'No reference provided' }, { status: 400 });
        }

        // Verify with PocketFi
        const verification = await verifyPayment(reference);

        if (verification.status && verification.data.status === 'successful') {
            await dbConnect();

            // Find transaction
            // Find transaction
            let transaction = await Transaction.findOne({ reference });

            // Fallback: Check if reference matches pocketfi_reference in metadata
            if (!transaction) {
                transaction = await Transaction.findOne({ 'metadata.pocketfi_reference': reference });
            }

            if (!transaction) {
                console.error(`Transaction not found for reference: ${reference}`);
                return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
            }

            console.log(`Transaction found: ${transaction._id}, Status: ${transaction.status}`);

            if (transaction.status === 'successful') {
                return NextResponse.json({ success: true, message: 'Transaction already completed' });
            }

            // Update transaction
            transaction.status = 'successful';
            await transaction.save();

            // Credit user wallet
            const user = await User.findById(transaction.user);
            if (user) {
                const addAmount = Number(transaction.amount); // Explicit cast
                console.log(`[WEBHOOK] Updating balance for user ${user.email}. Old: ${user.balance}, Adding: ${addAmount}`);

                user.balance = Number(user.balance) + addAmount;
                console.log(`[WEBHOOK] New Balance: ${user.balance}`);

                await user.save();
            }

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ success: false, message: 'Payment verification failed' }, { status: 400 });
        }

    } catch (error) {
        console.error('Payment callback error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    // Handle redirect callback if needed
    return NextResponse.json({ message: 'Callback endpoint' });
}
