
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let mongoUri = '';
try {
    const envContent = fs.readFileSync('.env', 'utf8');
    mongoUri = envContent.match(/MONGODB_URI=(.*)/)[1].trim();
} catch (e) { console.error(e); process.exit(1); }

// Correct Schema based on user JSON
const VirtualNumberSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    number: String,
    serviceName: String,
    countryName: String,
    service: String,
    country: String,
    price: Number,
    status: { type: String, default: 'active' },
    expiresAt: Date,
    provider: String,
    externalId: String,
    createdAt: { type: Date, default: Date.now }
}, { collection: 'virtualnumbers' });

const VirtualNumber = mongoose.models.VirtualNumber || mongoose.model('VirtualNumber', VirtualNumberSchema);

async function run() {
    await mongoose.connect(mongoUri);
    const userId = "69271649e11ddd92746067cb";

    console.log(`Adding CORRECTED Dummy Number for User ID: ${userId}`);

    // Clear old simulation dummies if any
    await VirtualNumber.deleteMany({ externalId: 'simulation_dummy_123' });

    const dummy = new VirtualNumber({
        user: new mongoose.Types.ObjectId(userId),
        number: '+19998887777', // Corrected field name
        service: 'sim_svc',
        serviceName: 'Simulation Service',
        country: 'US',
        countryName: 'United States',
        price: 50,
        status: 'active',
        provider: 'TV',
        externalId: 'simulation_dummy_123',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    await dummy.save();
    console.log('Dummy Number Added SUCCESSFULLY:', dummy._id);
    await mongoose.disconnect();
}
run();
