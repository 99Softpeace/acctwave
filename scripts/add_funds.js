
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
}

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    balance: { type: Number, default: 0 },
}, { strict: false });

// Handle model already compiled error
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function addFunds() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const searchName = 'Peace Olowo';
        const amountToAdd = 5000;

        const user = await User.findOne({
            $or: [
                { name: { $regex: searchName, $options: 'i' } },
                { email: { $regex: searchName, $options: 'i' } } // Just in case
            ]
        });

        if (!user) {
            console.log(`User "${searchName}" not found.`);
        } else {
            const oldBalance = user.balance;
            user.balance += amountToAdd;
            await user.save();
            console.log(`User found: ${user.name} (${user.email})`);
            console.log(`Old Balance: ₦${oldBalance}`);
            console.log(`New Balance: ₦${user.balance}`);
            console.log(`Added: ₦${amountToAdd}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

addFunds();
