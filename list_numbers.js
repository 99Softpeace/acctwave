
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let mongoUri = '';
try {
    const envContent = fs.readFileSync('.env', 'utf8');
    mongoUri = envContent.match(/MONGODB_URI=(.*)/)[1].trim();
} catch (e) { console.error(e); process.exit(1); }

// Models (Minimal for listing)
const VirtualNumberSchema = new mongoose.Schema({
    user: mongoose.Schema.Types.Mixed,
    phoneNumber: String,
    status: String,
    expiresAt: Date,
    externalId: String
}, { collection: 'virtualnumbers' }); // Explicit collection name
const VirtualNumber = mongoose.models.VirtualNumber || mongoose.model('VirtualNumber', VirtualNumberSchema);

async function run() {
    console.log('Connecting to DB...');
    await mongoose.connect(mongoUri);
    const userId = "69271649e11ddd92746067cb";

    console.log(`Searching for ALL numbers for user: ${userId}`);
    const numbers = await VirtualNumber.find({
        $or: [
            { user: userId },
            { user: new mongoose.Types.ObjectId(userId) }
        ]
    });

    console.log(`Found ${numbers.length} numbers.`);
    numbers.forEach(n => {
        console.log(`NUMBER_ITEM: ${n.phoneNumber} | Status: ${n.status} | ID: ${n.externalId} | Expires: ${n.expiresAt}`);
    });

    await mongoose.disconnect();
}
run();
