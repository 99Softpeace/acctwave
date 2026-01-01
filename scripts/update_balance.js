require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env');
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    balance: Number,
}, { strict: false }); // Use strict false to work with existing schema without defining everything

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function addBalance() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Case-insensitive search for flexibility
        const user = await User.findOne({ name: { $regex: new RegExp('^peace olowo$', 'i') } });

        if (!user) {
            console.log('User "peace olowo" not found!');
            process.exit(1);
        }

        console.log(`Found user: ${user.name} (${user.email})`);
        console.log(`Current Balance: ${user.balance}`);

        user.balance = (user.balance || 0) + 5000;
        await user.save();

        console.log(`NEW Balance: ${user.balance}`);
        console.log('Successfully added 5000 to balance.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
        process.exit(0);
    }
}

addBalance();
