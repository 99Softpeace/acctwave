
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
    balance: { type: Number, default: 0 }
}, { strict: false });

const transactionSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

async function resetAll() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB. Starting Full Reset...');

        // 1. Reset All Balances
        const updateResult = await User.updateMany({}, { $set: { balance: 0 } });
        console.log(`Reset balances for ${updateResult.modifiedCount} users.`);

        // 2. Clear All Transactions (Fresh Start)
        const deleteResult = await Transaction.deleteMany({});
        console.log(`Deleted ${deleteResult.deletedCount} transaction records.`);

        console.log('-----------------------------------');
        console.log('SYSTEM CLEAN. READY FOR FRESH TESTING.');

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

resetAll();
