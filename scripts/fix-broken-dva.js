const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

const userSchema = new mongoose.Schema({
    email: String,
    virtualAccount: Object
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function fixAccount() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const email = '404peaceolowosagba@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found!');
            return;
        }

        console.log('Found User:', user.email);
        console.log('Old Broken Account:', user.virtualAccount);

        // Delete the broken account
        user.virtualAccount = undefined;
        await user.save();

        console.log('SUCCESS: Broken virtual account removed.');
        console.log('Please refresh your dashboard to generate a NEW, working account.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixAccount();
