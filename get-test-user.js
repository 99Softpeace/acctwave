const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env
const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

if (require('fs').existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
} else {
    dotenv.config({ path: envPath });
}

// User Schema (Minimal)
const UserSchema = new mongoose.Schema({
    email: String,
    virtualAccount: {
        accountNumber: String,
        bankName: String
    }
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function findUser() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('Searching for user with virtual account...');
        const user = await User.findOne({ 'virtualAccount.accountNumber': { $exists: true, $ne: null } });

        if (user) {
            console.log('--- FOUND USER ---');
            console.log('Email:', user.email);
            console.log('Account Number:', user.virtualAccount.accountNumber);
            console.log('------------------');
        } else {
            console.log('No user with virtual account found. You might need to create one via the UI first.');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

findUser();
