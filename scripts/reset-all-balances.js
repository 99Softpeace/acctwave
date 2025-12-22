require('dotenv').config();
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: String,
    balance: Number
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function resetAll() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('Resetting ALL user balances to 0.00...');
        const result = await User.updateMany({}, { $set: { balance: 0 } });

        console.log(`Success! Modified ${result.modifiedCount} users.`);
        console.log('Matched:', result.matchedCount);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

resetAll();
