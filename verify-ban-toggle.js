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

async function toggleBan() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const userId = '6948ad9b96ad6db13fbedb93';

        // 1. Initial State
        let user = await User.findById(userId);
        console.log(`[Start] isSuspended: ${user.isSuspended}`);

        // 2. Ban
        console.log('--- ACTION: BANNING ---');
        user = await User.findByIdAndUpdate(userId, { isSuspended: true }, { new: true });
        console.log(`[After Ban] isSuspended: ${user.isSuspended}`);

        // 3. Unban (Cleaning up)
        console.log('--- ACTION: UNBANNING ---');
        user = await User.findByIdAndUpdate(userId, { isSuspended: false }, { new: true });
        console.log(`[After Unban] isSuspended: ${user.isSuspended}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

toggleBan();
