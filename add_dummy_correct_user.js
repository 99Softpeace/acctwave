
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let mongoUri = '';
try {
    const envContent = fs.readFileSync('.env', 'utf8');
    mongoUri = envContent.match(/MONGODB_URI=(.*)/)[1].trim();
} catch (e) { console.error(e); process.exit(1); }

// Models
const VirtualNumberSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
if (!mongoose.models.VirtualNumber) {
    mongoose.model('VirtualNumber', VirtualNumberSchema);
}
const VirtualNumber = mongoose.model('VirtualNumber');

async function run() {
    await mongoose.connect(mongoUri);
    const userId = "69271649e11ddd92746067cb"; // USER ID from browser response

    console.log(`Adding Dummy Number for User ID: ${userId}`);

    const dummy = new VirtualNumber({
        user: new mongoose.Types.ObjectId(userId),
        phoneNumber: '+19998887777',
        serviceName: 'Simulation Service',
        country: 'US',
        serviceId: 'sim_svc',
        countryId: 'US',
        price: 50,
        status: 'active',
        provider: 'TV',
        externalId: 'simulation_dummy_123',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await dummy.save();
    console.log('Dummy Number Added:', dummy._id);
    await mongoose.disconnect();
}
run();
