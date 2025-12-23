
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ virtualAccount: Object }, { strict: false }));

async function findDuplicates() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Scanning for Duplicate Account Numbers...');

        const users = await User.find({ 'virtualAccount.accountNumber': { $exists: true } });
        const map = {};
        let found = false;

        users.forEach(u => {
            const acc = u.virtualAccount.accountNumber;
            if (map[acc]) {
                console.log(`\nCRITICAL COLLISION: Account ${acc} is shared by:`);
                console.log(`1. ${map[acc]}`);
                console.log(`2. ${u.email} (ID: ${u._id})`);
                found = true;
            } else {
                map[acc] = `${u.email} (ID: ${u._id})`;
            }
        });

        if (!found) console.log('No duplicates found. Every user has a unique account number.');

    } catch (e) { console.error(e); } finally { await mongoose.disconnect(); }
}

findDuplicates();
