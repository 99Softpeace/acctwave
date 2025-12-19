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

const UserSchema = new mongoose.Schema({
    email: String,
    virtualAccount: Object
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function resetAccounts() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('Clearing virtual accounts for ALL users...');
        const result = await User.updateMany({}, { $unset: { virtualAccount: 1 } });

        console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
        console.log('✅ Accounts reset. Next page load will trigger fresh calculation.');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

resetAccounts();
