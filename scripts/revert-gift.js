const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load env
const envPath = path.join(process.cwd(), '.env');
const envConfig = require('dotenv').config({ path: envPath }).parsed || {};
const MONGODB_URI = process.env.MONGODB_URI || envConfig.MONGODB_URI;

const UserSchema = new mongoose.Schema({
    email: String,
    balance: Number
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const email = '404peaceolowosagba@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`User Found: ${user.email}`);
            console.log(`Current Balance: ${user.balance}`);

            // Deduct 500
            user.balance = Number(user.balance) - 500;
            // Ensure no negative balance just in case
            if (user.balance < 0) user.balance = 0;

            await user.save();

            console.log(`New Balance: ${user.balance}`);
            console.log('SUCCESS: Removed 500 Naira Gift');
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
