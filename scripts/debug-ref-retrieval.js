
require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

// Define minimal User schema to match what the API uses
const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    referralCode: { type: String, unique: true, sparse: true }
}, { strict: false }); // Use strict false to see all fields if possible

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const email = '404peaceolowosagba@gmail.com'; // Admin email
        const user = await User.findOne({ email });

        if (user) {
            console.log('User Found:', user.email);
            console.log('Referral Code:', user.referralCode);
            console.log('Full User Object:', JSON.stringify(user.toJSON(), null, 2));
        } else {
            console.log('User NOT found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUser();
