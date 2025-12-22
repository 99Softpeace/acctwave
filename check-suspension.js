const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' }); // Try .env.local first
if (!process.env.MONGODB_URI) require('dotenv').config(); // Fallback to .env

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('Error: MONGODB_URI not found in .env or .env.local');
    process.exit(1);
}

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    isSuspended: Boolean,
    role: String
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function checkSuspension() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const users = await User.find({}, 'name email isSuspended role');

        console.log('\n--- User Status Report ---');
        if (users.length === 0) {
            console.log('No users found.');
        } else {
            users.forEach(u => {
                console.log(`User: ${u.name} | Email: ${u.email} | Role: ${u.role} | Suspended: ${u.isSuspended} (Type: ${typeof u.isSuspended})`);
            });
        }
        console.log('--------------------------\n');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkSuspension();
