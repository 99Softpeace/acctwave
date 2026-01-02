const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' }); // Try .env.local first
if (!process.env.MONGODB_URI) require('dotenv').config({ path: '.env' });

const fs = require('fs');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found');
    process.exit(1);
}

const transactionSchema = new mongoose.Schema({
    user: mongoose.Schema.Types.ObjectId,
    amount: Number,
    reference: String,
    status: String,
    type: String, // 'order' or 'debit'
    category: String,
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: Date
});

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

async function checkTransactions() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const transactions = await Transaction.find({
            $or: [
                { category: 'esim_purchase' },
                { description: { $regex: 'eSIM Purchase', $options: 'i' } }
            ]
        }).sort({ createdAt: -1 }).limit(5);

        console.log(`Found ${transactions.length} eSIM transactions.`);

        const dump = transactions.map(t => ({
            id: t._id,
            userId: t.user,
            date: t.createdAt,
            metadata: t.metadata
        }));

        fs.writeFileSync('transaction_dump_clean.json', JSON.stringify(dump, null, 2));
        console.log('Dump saved to transaction_dump_clean.json');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkTransactions();
