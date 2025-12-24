const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load env
const envPath = path.join(process.cwd(), '.env');
const envConfig = require('dotenv').config({ path: envPath }).parsed || {};
const MONGODB_URI = process.env.MONGODB_URI || envConfig.MONGODB_URI;

const UserSchema = new mongoose.Schema({
    email: String,
    name: String,
    referralCode: String
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const email = '404peaceolowosagba@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`Found User: ${user.name} (${user.email})`);

            if (user.referralCode) {
                console.log(`User already has code: ${user.referralCode}`);
            } else {
                // Generate Code: First 3 letters of name + random 3 digits
                const namePart = (user.name || 'USER').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
                const randomPart = Math.floor(100 + Math.random() * 900);
                const newCode = `${namePart}${randomPart}`;

                user.referralCode = newCode;
                await user.save();
                console.log(`SUCCESS: Generated Code for user: ${newCode}`);
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
