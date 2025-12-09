const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
    email: String,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({});
        console.log('Users found:', users.length);
        users.forEach(u => console.log(u.email));
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

listUsers();
