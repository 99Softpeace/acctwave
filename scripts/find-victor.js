
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));

async function findVictor() {
    try {
        await mongoose.connect(MONGODB_URI);
        const user = await User.findOne({ email: 'victorolufisayo25@gmail.com' });

        if (user) {
            console.log('VICTOR ACCOUNT DETAILS:');
            console.log(`Email: ${user.email}`);
            console.log(`Balance: ${user.balance}`);
            console.log(`Virtual Account:`, user.virtualAccount);
        } else {
            console.log('User victorolufisayo25@gmail.com NOT found.');
        }

    } catch (e) { console.error(e); } finally { await mongoose.disconnect(); }
}

findVictor();
