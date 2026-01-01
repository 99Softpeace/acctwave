
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 1. Env Loader
let mongoUri = '';
try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI=(.*)/);
    if (match) mongoUri = match[1].trim();
} catch (e) {
    console.error('Failed to read .env', e);
    process.exit(1);
}

// 2. Models
const UserSchema = new mongoose.Schema({ name: String }, { strict: false });
const User = mongoose.model('User', UserSchema);

const VirtualNumberSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    phoneNumber: String,
    serviceName: String,
    country: String,
    serviceId: String,
    countryId: String,
    price: Number,
    status: { type: String, default: 'active' },
    expiresAt: Date,
    provider: String,
    externalId: String,
    createdAt: { type: Date, default: Date.now },
    smsCode: String,
    fullSms: String
});
const VirtualNumber = mongoose.model('VirtualNumber', VirtualNumberSchema);

async function run() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(mongoUri);

        console.log('Finding user "Peace Olowo"...');
        const user = await User.findOne({ name: /Peace Olowo/i });
        if (!user) {
            console.error('User not found!');
            return;
        }

        console.log(`Adding Dummy Number for: ${user.name} (${user._id})`);

        const dummy = new VirtualNumber({
            userId: user._id,
            phoneNumber: '+19998887777', // Dummy Number
            serviceName: 'Simulation Service',
            country: 'US',
            serviceId: 'sim_svc',
            countryId: 'US',
            price: 50,
            status: 'active',
            provider: 'TV', // Triggers Mock ID
            externalId: 'simulation_dummy_123',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
        });

        await dummy.save();
        console.log('Dummy Number Added:', dummy._id);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
