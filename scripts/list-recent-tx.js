const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load env
const envPath = path.join(process.cwd(), '.env');
const envConfig = require('dotenv').config({ path: envPath }).parsed || {};
const MONGODB_URI = process.env.MONGODB_URI || envConfig.MONGODB_URI;

const TransactionSchema = new mongoose.Schema({
    reference: String,
    status: String,
    amount: Number,
    createdAt: Date
}, { strict: false });

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const txs = await Transaction.find().sort({ createdAt: -1 }).limit(5);

        if (txs.length === 0) {
            console.log('No transactions found.');
        } else {
            console.log('Recent Transactions:');
            txs.forEach(tx => {
                console.log(`[${tx.createdAt ? tx.createdAt.toISOString() : 'No Date'}] Ref: "${tx.reference}" Status: ${tx.status} Amount: ${tx.amount}`);
            });
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
