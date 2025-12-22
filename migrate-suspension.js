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

async function migrateSuspension() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // Find all users where isSuspended is missing
        const res = await User.updateMany(
            { isSuspended: { $exists: false } },
            { $set: { isSuspended: false } }
        );

        console.log(`Migration Result: Updated ${res.modifiedCount} users to have default 'isSuspended: false'.`);

        // List all users to confirm
        const users = await User.find({}, 'name email isSuspended role');
        users.forEach(u => {
            console.log(`[Verify] ${u.email}: isSuspended=${u.isSuspended}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

migrateSuspension();
