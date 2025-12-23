const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load env
const envPath = path.join(process.cwd(), '.env');
const envConfig = require('dotenv').config({ path: envPath }).parsed || {};
const MONGODB_URI = process.env.MONGODB_URI || envConfig.MONGODB_URI;

// Minimal User Schema
const userSchema = new mongoose.Schema({
    email: String,
    balance: { type: Number, default: 0 }
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const email = '404peaceolowosagba@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`User Found: ${user.email}`);
            console.log(`Current Balance: ${user.balance}`);

            user.balance = Number(user.balance) + 500;
            await user.save();

            console.log(`New Balance: ${user.balance}`);
            console.log('SUCCESS: Credited 500 Naira');
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
