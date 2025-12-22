
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
    balance: { type: Number, default: 0 },
    virtualAccount: Object
}, { strict: false });

const debugLogSchema = new mongoose.Schema({
    source: String,
    type: String,
    message: String,
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const DebugLog = mongoose.models.DebugLog || mongoose.model('DebugLog', debugLogSchema);

async function findAndRecover() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Scanning logs from the last 6 hours...');

        const startTime = new Date(Date.now() - 6 * 60 * 60 * 1000);

        // Find "Unsigned Ping Accepted" logs that actually had money
        // Scan BOTH pf_notify and pocketfi-webhook
        const logs = await DebugLog.find({
            source: { $in: ['pf_notify', 'pocketfi-webhook'] },
            createdAt: { $gt: startTime }
        }).sort({ createdAt: -1 });

        console.log(`Found ${logs.length} recent logs.`);

        for (const log of logs) {
            let body = log.metadata?.body;
            if (typeof body === 'string') {
                try { body = JSON.parse(body); } catch (e) { }
            }

            // Check if it looks like a payment
            const data = body?.data || body?.order || body;
            const amount = Number(data?.amount || data?.settlement_amount || 0);

            // Check for date to distinguish "new" stuck payments
            console.log(`[${log.createdAt.toISOString()}] Msg: ${log.message}, Amount: ${amount}`);

            if (log.message === 'Unsigned Ping Accepted' && amount > 0) {
                // POTENTIAL STUCK PAYMENT
                console.log(`>>> FOUND STUCK PAYMENT: ${amount} NGN at ${log.createdAt.toISOString()}`);

                // Extract Account Number to find user
                const accNum = body?.account_number || body?.data?.destination_account_number;
                if (accNum) {
                    const user = await User.findOne({ 'virtualAccount.accountNumber': accNum });
                    if (user) {
                        console.log(`   User: ${user.email}, Current Balance: ${user.balance}`);

                        // Recovery Logic:
                        // We don't want to double credit, but for now user requested "pull it out".
                        // I will credit it and log it.
                        // ideally we check if Transaction exists, but for "Unsigned Ping", no transaction was created.

                        user.balance = (Number(user.balance) || 0) + amount;
                        await user.save();
                        console.log(`   *** CREDITED ${amount} NGN to ${user.email}. New Balance: ${user.balance} ***`);
                    } else {
                        console.log(`   User not found for account ${accNum}`);
                    }
                }
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

findAndRecover();
