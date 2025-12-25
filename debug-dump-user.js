
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Use a loose schema/strict: false to see everything
const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function dumpUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({});
        console.log('--- Raw User Object ---');
        console.log(user);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

dumpUser();
