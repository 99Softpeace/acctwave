
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
    balance: { type: Number, default: 0 },
    name: String,
    email: String
}, { strict: false });

const User = mongoose.model('User', UserSchema);

async function run() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(mongoUri);
        console.log('Connected.');

        const targetName = 'Peace Olowo';
        const amount = 5000;

        const user = await User.findOne({ name: { $regex: new RegExp(targetName, 'i') } });

        if (!user) {
            console.error(`User "${targetName}" not found.`);
            return;
        }

        console.log(`Found user: ${user.name} (${user.email})`);
        console.log(`Old Balance: ${user.balance}`);

        user.balance = (user.balance || 0) + amount;
        await user.save();

        console.log(`New Balance: ${user.balance}`);
        console.log(`Added ${amount} NGN successfully.`);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
