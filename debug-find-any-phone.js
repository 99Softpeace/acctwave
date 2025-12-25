
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function scanUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}).limit(10).lean();

        console.log(`Scanned ${users.length} users.`);

        users.forEach((u, i) => {
            console.log(`\n-- User ${i + 1} (${u.email}) --`);
            const keys = Object.keys(u);
            const phoneKeys = keys.filter(k => k.toLowerCase().includes('phone') || k.toLowerCase().includes('mobile'));

            if (phoneKeys.length > 0) {
                phoneKeys.forEach(k => console.log(`Found Field [${k}]: ${u[k]}`));
            } else {
                console.log("No phone-like fields found.");
            }
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

scanUsers();
