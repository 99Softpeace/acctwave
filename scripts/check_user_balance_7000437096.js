require('dotenv').config();
const mongoose = require('mongoose');

// Define minimal Schema to avoid import issues
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    name: String,
    email: String,
    balance: Number,
    virtualAccount: {
        accountNumber: String
    }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkBalance() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const accountNumber = '7000437096';
        const user = await User.findOne({ 'virtualAccount.accountNumber': accountNumber });

        if (user) {
            console.log('--- User Found ---');
            console.log(`Name: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Account: ${user.virtualAccount.accountNumber}`);
            console.log(`Balance: ${user.balance}`);
            console.log('------------------');
        } else {
            console.log('User NOT found with account:', accountNumber);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkBalance();
