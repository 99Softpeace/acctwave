const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
if (!process.env.MONGODB_URI) require('dotenv').config();

const uri = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    isSuspended: { type: Boolean, default: false },
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function checkSpecificUser() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const userId = '6948ad9b96ad6db13fbedb93';
        console.log(`Checking ID: ${userId}`);

        // Mimic the API query exactly
        const user = await User.findById(userId).select('isSuspended email');

        console.log('--- Raw Mongoose Result ---');
        console.log(user);
        console.log('---------------------------');

        console.log(`user.isSuspended: ${user ? user.isSuspended : 'User null'}`);
        console.log('typeof isSuspended:', typeof (user ? user.isSuspended : undefined));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkSpecificUser();
