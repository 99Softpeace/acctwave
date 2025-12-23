const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load env
const envPath = path.join(process.cwd(), '.env');
const envConfig = require('dotenv').config({ path: envPath }).parsed || {};
const MONGODB_URI = process.env.MONGODB_URI || envConfig.MONGODB_URI;

const UserSchema = new mongoose.Schema({ email: String, balance: Number }, { strict: false });
const TransactionSchema = new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId }, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const email = '404peaceolowosagba@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`Resetting User: ${user.email}`);

            // 1. Delete all transactions for this user
            const deleteResult = await Transaction.deleteMany({ user: user._id });
            console.log(`Deleted ${deleteResult.deletedCount} transactions.`);

            // 2. Reset Balance to 0
            user.balance = 0;
            await user.save();
            console.log('Balance reset to 0.');

        } else {
            console.log('User not found');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
