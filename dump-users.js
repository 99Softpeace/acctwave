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

async function listAllUsers() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const users = await User.find({});

        console.log('\n--- FULL USER DUMP ---');
        users.forEach(u => {
            console.log(`[${u._id}] ${u.email} | Name: ${u.name} | Suspended: ${u.isSuspended}`);
        });
        console.log('----------------------\n');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

listAllUsers();
