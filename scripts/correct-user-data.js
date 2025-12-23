
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable');
    process.exit(1);
}

const userSchema = new mongoose.Schema({
    email: String,
    balance: Number,
    virtualAccount: Object
}, { strict: false });

const transactionSchema = new mongoose.Schema({
    user: mongoose.Schema.Types.ObjectId,
    amount: Number,
    reference: String,
    status: String,
    payment_method: String,
    type: String,
    description: String,
    createdAt: { type: Date, default: Date.now },
    metadata: Object
});

const debugLogSchema = new mongoose.Schema({
    source: String,
    message: String,
    metadata: Object
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
const DebugLog = mongoose.models.DebugLog || mongoose.model('DebugLog', debugLogSchema);

async function correctUserData() {
    try {
        await mongoose.connect(MONGODB_URI);
        const user = await User.findOne({ 'virtualAccount.accountNumber': '1934847251' });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log(`Fixing User: ${user.email} (Current Balance: ${user.balance})`);

        // 1. Reset Balance to 0
        user.balance = 0;
        await user.save();
        console.log('Balance reset to 0.');

        // 2. Clear existing (likely messed up or empty) transactions? 
        // User said history "ought to be working", implying it's currently NOT showing or empty.
        // I'll keep existing if any, but adding new ones.

        // 3. Backfill Initial 400 (200 + 100 + 100 from logs I saw earlier)
        const initialCredits = [
            { amount: 200, ref: 'MANUAL-FIX-001', desc: 'Wallet Funding (Recovered)' },
            { amount: 100, ref: 'MANUAL-FIX-002', desc: 'Wallet Funding (Recovered)' },
            { amount: 100, ref: 'MANUAL-FIX-003', desc: 'Wallet Funding (Recovered)' }
        ];

        for (const credit of initialCredits) {
            // Check if exists first to avoid duplicates if run multiple times
            const exists = await Transaction.findOne({ reference: credit.ref });
            if (!exists) {
                await Transaction.create({
                    user: user._id,
                    amount: credit.amount,
                    reference: credit.ref,
                    status: 'successful',
                    payment_method: 'bank_transfer',
                    type: 'deposit',
                    description: credit.desc,
                    metadata: { note: 'Manual Recovery' }
                });
                user.balance += credit.amount;
                console.log(`Added transaction: ${credit.amount}`);
            }
        }

        // 4. Scan logs for the "Recent" payment (after 19:30)
        // Look for logs in last 12 hours
        const logs = await DebugLog.find({
            source: { $in: ['pf_notify', 'pocketfi-webhook'] },
            createdAt: { $gt: new Date(Date.now() - 12 * 60 * 60 * 1000) }
        }).sort({ createdAt: -1 });

        console.log(`Scanning ${logs.length} logs for new payments...`);
        const foundRefs = new Set(initialCredits.map(c => c.ref)); // Track what we've handled

        for (const log of logs) {
            let body = log.metadata?.body;
            if (typeof body === 'string') {
                try { body = JSON.parse(body); } catch (e) { }
            }
            const data = body?.data || body?.order || body;
            const amount = Number(data?.amount || data?.settlement_amount || 0);

            // Extract Ref
            let ref = data?.reference || data?.tx_ref;
            if (!ref && body?.transaction?.reference) ref = body.transaction.reference;

            if (amount > 0 && ref && !foundRefs.has(ref)) {
                // Check if this ref is already in DB (real transactions)
                const existingTx = await Transaction.findOne({ reference: ref });
                if (existingTx) {
                    console.log(`Skipping existing ref: ${ref}`);
                    continue;
                }

                // It's a new one! (Likely the failed API call one)
                console.log(`Found NEW Missed Transaction: ${amount} NGN (Ref: ${ref})`);

                await Transaction.create({
                    user: user._id,
                    amount: amount,
                    reference: ref,
                    status: 'successful',
                    payment_method: 'bank_transfer',
                    type: 'deposit',
                    description: 'Wallet Funding via Virtual Account',
                    metadata: { note: 'Recovered from Logs', original_log_id: log._id }
                });
                user.balance += amount;
                foundRefs.add(ref);
                console.log(`Recovered and Credited: ${amount}`);
            }
        }

        await user.save();
        console.log(`Final Corrected Balance: ${user.balance}`);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

correctUserData();
