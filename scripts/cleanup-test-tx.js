
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
    status: String
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

async function cleanupTestTransactions() {
    try {
        await mongoose.connect(MONGODB_URI);
        const user = await User.findOne({ 'virtualAccount.accountNumber': '1934847251' });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log(`Cleaning User: ${user.email} (Current Balance: ${user.balance})`);

        // Find ALL transactions containing "TEST-" or "MANUAL-"
        // Actually, "MANUAL-" I created intentionally for the 400. 
        // "TEST-" are the debug script runs.

        const testTxs = await Transaction.find({
            user: user._id,
            reference: { $regex: /TEST-|fake/i }
        });

        console.log(`Found ${testTxs.length} test transactions.`);

        let deduction = 0;
        for (const tx of testTxs) {
            console.log(`Removing Test Tx: ${tx.reference} (${tx.amount} NGN)`);
            deduction += tx.amount;
            await Transaction.deleteOne({ _id: tx._id });
        }

        user.balance -= deduction;
        await user.save();

        console.log(`Removed ${deduction} NGN.`);
        console.log(`Final Real Balance: ${user.balance}`);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

cleanupTestTransactions();
