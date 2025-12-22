
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
    balance: { type: Number, default: 0 },
    virtualAccount: {
        accountNumber: String,
        bankName: String,
        accountName: String
    }
}, { strict: false }); // Strict false to read existing schema without full def

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function fixBalance() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const accountNumber = '1934847251'; // From logs
        const user = await User.findOne({ 'virtualAccount.accountNumber': accountNumber });

        if (!user) {
            console.log('User not found!');
            return;
        }

        console.log(`Found User: ${user.email}`);
        console.log(`Current Balance: ${user.balance}`);

        // Credit 400 (200 + 100 + 100 missed)
        const creditAmount = 400;
        user.balance = (Number(user.balance) || 0) + creditAmount;

        await user.save();
        console.log(`New Balance: ${user.balance}`);
        console.log('Successfully credited missing funds.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixBalance();
