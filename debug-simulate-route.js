
const http = require('http');

// Need a cookie to be authenticated as admin? 
// That's hard to fake without logging in.
// But wait, the route checks session.
// Simulation might fail 403 Forbidden.

// Instead, let's use the internal logic simulation (mocking the handler)
// Or just trust the previous DB dump and assume the API logic is fine?
// No, I need to know why the frontend is failing.

// Actually, I can use the 'debug-check-users.js' again but this time 
// DO NOT use .select() to see if Mongoose default behavior is the issue.
// AND also check if the specific users I saw in the dump (who had phones) are returned.

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const UserSchema = new mongoose.Schema({
    // Minimal schema to match what we expect
    name: String,
    phoneNumber: String
}, { strict: false }); // allowing other fields

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkMongooseBehavior() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Simulating the Route Logic
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        console.log("--- API Route Simulation Output ---");
        users.forEach(u => {
            console.log(`User: ${u.name}, Phone: ${u.phoneNumber}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

checkMongooseBehavior();
