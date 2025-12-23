
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

async function verifyRecoveredCredits() {
    try {
        await mongoose.connect(MONGODB_URI);
        const user = await User.findOne({ 'virtualAccount.accountNumber': '1934847251' });

        // Find transactions we recovered (they have original_log_id)
        const recoveredTxs = await Transaction.find({
            user: user._id,
            'metadata.original_log_id': { $exists: true }
        });

        console.log(`Checking ${recoveredTxs.length} recovered transactions...`);

        let reversed = 0;

        for (const tx of recoveredTxs) {
            const logId = tx.metadata.original_log_id;
            const log = await DebugLog.findById(logId);

            if (log) {
                let body = log.metadata?.body;
                if (typeof body === 'string') {
                    try { body = JSON.parse(body); } catch (e) { }
                }

                const event = body?.event || body?.event_type;
                console.log(`TxRef: ${tx.reference} | Event: ${event} | Amount: ${tx.amount}`);

                // If event is NOT success, we must reverse it
                if (event && !['payment.success', 'transfer.success', 'charge.success'].includes(event)) {
                    console.log(`>>> INVALID CREDIT! Event is ${event}. Reversing ${tx.amount}...`);

                    // Reverse
                    await Transaction.deleteOne({ _id: tx._id });
                    reversed += tx.amount;
                }
            } else {
                console.log(`Log not found for ${tx.reference}`);
            }
        }

        if (reversed > 0) {
            user.balance -= reversed;
            await user.save();
            console.log(`Reversed Total: ${reversed}`);
            console.log(`New Balance: ${user.balance}`);
        } else {
            console.log('All recovered transactions appear to be success events.');
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

verifyRecoveredCredits();
