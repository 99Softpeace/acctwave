
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let mongoUri = '';
try {
    const envContent = fs.readFileSync('.env', 'utf8');
    mongoUri = envContent.match(/MONGODB_URI=(.*)/)[1].trim();
} catch (e) { console.error(e); process.exit(1); }

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema);

async function run() {
    await mongoose.connect(mongoUri);
    const userId = "69271649e11ddd92746067cb";
    const user = await User.findById(userId);
    if (user) {
        console.log(`USER_FOUND: ${user.name} (${user.email})`);
    } else {
        console.log('USER_NOT_FOUND');
    }
    await mongoose.disconnect();
}
run();
