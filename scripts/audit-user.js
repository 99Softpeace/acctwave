
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
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

async function auditUser() {
    try {
        await mongoose.connect(MONGODB_URI);

        // Find the user (using the account number we know: 1934847251)
        const user = await User.findOne({ 'virtualAccount.accountNumber': '1934847251' });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log(`User: ${user.email}`);
        console.log(`Current Balance: ${user.balance}`);
        console.log('-------------------------------------------');
        console.log('Transaction History:');

        const txs = await Transaction.find({ user: user._id }).sort({ createdAt: -1 });

        let calculatedBalance = 0;
        txs.forEach(tx => {
            console.log(`[${tx.createdAt.toISOString()}] ${tx.reference} | Amount: ${tx.amount} | Status: ${tx.status}`);
            if (tx.status === 'successful') {
                calculatedBalance += tx.amount;
            }
        });

        console.log('-------------------------------------------');
        console.log(`Sum of Successful Transactions: ${calculatedBalance}`);
        console.log(`Discrepancy: ${user.balance - calculatedBalance}`);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

auditUser();
