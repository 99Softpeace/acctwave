
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Replicate Real Schema roughly
const UserSchema = new mongoose.Schema({
    name: String,
    phoneNumber: String
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkPhoneCount() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const count = await User.countDocuments({ phoneNumber: { $exists: true, $ne: null } });
        console.log(`Users with valid phoneNumber: ${count}`);

        if (count > 0) {
            const user = await User.findOne({ phoneNumber: { $exists: true, $ne: null } }).select('-password').lean();
            console.log("Example User with Phone:", user);
        } else {
            console.log("No users with phone numbers found!");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

checkPhoneCount();
