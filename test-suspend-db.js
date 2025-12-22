const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
if (!process.env.MONGODB_URI) require('dotenv').config();

const uri = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    isSuspended: { type: Boolean, default: false },
    role: String
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function testSuspension() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // 1. Read
        console.log('--- BEFORE UPDATE ---');
        const users = await User.find({}, 'name email isSuspended');
        users.forEach(u => console.log(`${u.email}: isSuspended=${u.isSuspended}`));

        // 2. Pick a user to BAN (The one that is not admin if possible, or just the first user)
        const target = users.find(u => u.email !== 'trae.shawn@gmail.com'); // Avoid banning myself if I am trae
        if (target) {
            console.log(`\nAttempting to BAN: ${target.email} (ID: ${target._id})`);

            // 3. Update
            const res = await User.findByIdAndUpdate(target._id, { isSuspended: false }, { new: true }); // Reset to false first just in case
            const res2 = await User.findByIdAndUpdate(target._id, { isSuspended: true }, { new: true });

            console.log(`Update Result: isSuspended=${res2.isSuspended}`);
        } else {
            console.log('No suitable target user found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testSuspension();
