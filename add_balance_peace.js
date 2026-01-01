
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load env
let mongoUri = '';
try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI=(.*)/);
    if (match) mongoUri = match[1].trim();
} catch (e) {
    console.error('Failed to read .env', e);
    process.exit(1);
}

// Minimal User Schema
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    balance: Number
}, { strict: false });
const User = mongoose.model('User', UserSchema);

async function run() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(mongoUri);
        console.log('Connected.');

        const user = await User.findOne({ name: /Peace Olowo/i });
        if (!user) {
            console.log('User "Peace Olowo" not found.');
        } else {
            console.log(`Found user: ${user.name} (${user.email}). Current Balance: ${user.balance}`);
            // Add 5000 to existing balance
            user.balance = (user.balance || 0) + 5000;
            await user.save();
            console.log(`Balance updated. New Balance: ${user.balance} NGN.`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
