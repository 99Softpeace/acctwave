
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    phoneNumber: String
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const users = await User.find({}).select('name email phoneNumber').limit(5);
        console.log('--- Users Check ---');
        users.forEach(u => {
            console.log(`Name: ${u.name}, Email: ${u.email}, Phone: ${u.phoneNumber}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
