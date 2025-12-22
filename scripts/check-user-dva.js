require('dotenv').config();
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: String,
    virtualAccount: {
        accountNumber: String,
        bankName: String,
        accountName: String
    },
    balance: Number
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB. Listing Users with Virtual Accounts:');

        const users = await User.find({ 'virtualAccount.accountNumber': { $exists: true } });

        users.forEach(u => {
            console.log(`User: ${u.email}`);
            console.log(`   Account: "${u.virtualAccount?.accountNumber}" (Length: ${u.virtualAccount?.accountNumber?.length})`);
            console.log(`   Balance: ${u.balance}`);
            console.log('-----------------------------------');
        });

        if (users.length === 0) console.log('No users found with Virtual Accounts.');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
