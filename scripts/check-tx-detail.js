const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load env
const envPath = path.join(process.cwd(), '.env');
const envConfig = require('dotenv').config({ path: envPath }).parsed || {};
const MONGODB_URI = process.env.MONGODB_URI || envConfig.MONGODB_URI;

const TransactionSchema = new mongoose.Schema({
    reference: { type: String, unique: true },
    status: String,
    amount: Number,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: Date,
    updatedAt: Date
}, { strict: false }); // Strict false to see all fields

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const reference = 'PFI|100004251223133518148301707449';
        const tx = await Transaction.findOne({ reference });

        if (tx) {
            console.log('Transaction Found:');
            console.log(JSON.stringify(tx, null, 2));
            console.log(`Status: ${tx.status}, Amount: ${tx.amount}`);
        } else {
            console.log('Transaction NOT Found');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
