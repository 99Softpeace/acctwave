require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const TransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    reference: String,
    status: String,
    type: String,
    category: String,
    description: String,
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: Date
});

// Force model registration if not already
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

async function main() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const transactions = await Transaction.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        console.log('--- Last 10 Transactions ---');
        transactions.forEach(t => {
            console.log(`[${t.createdAt.toISOString()}] Type: ${t.type}, Category: ${t.category}, Desc: ${t.description}, Amount: ${t.amount}`);
            console.log(`    Ref: ${t.reference}, ID: ${t._id}`);
            if (t.metadata) console.log(`    Metadata Keys: ${Object.keys(t.metadata).join(', ')}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

main();
