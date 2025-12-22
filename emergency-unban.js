const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
if (!process.env.MONGODB_URI) require('dotenv').config();

const uri = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String,
    isSuspended: Boolean
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function emergencyUnban() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // Unban all admins
        const res = await User.updateMany(
            { role: 'admin' },
            { $set: { isSuspended: false } }
        );

        console.log(`Emergency Unban Result: matched ${res.matchedCount}, modified ${res.modifiedCount}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

emergencyUnban();
