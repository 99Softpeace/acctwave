const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load env
const envPath = path.join(process.cwd(), '.env');
const envConfig = require('dotenv').config({ path: envPath }).parsed || {};
const MONGODB_URI = process.env.MONGODB_URI || envConfig.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('No MONGODB_URI found');
    process.exit(1);
}

// Minimal User Schema
const userSchema = new mongoose.Schema({
    email: String,
    virtualAccount: {
        accountNumber: String,
        bankName: String
    }
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const email = '404peaceolowosagba@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log('User Found:', user.email);
            if (user.virtualAccount && user.virtualAccount.accountNumber) {
                console.log('DVA_NUMBER: ' + user.virtualAccount.accountNumber);
            } else {
                console.log('No DVA found for user');
                console.log('VirtualAccount Field:', JSON.stringify(user.virtualAccount, null, 2));
            }
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
