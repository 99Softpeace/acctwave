
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load env
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

// Minimal VirtualNumber Schema
const VirtualNumberSchema = new mongoose.Schema({}, { strict: false });
const VirtualNumber = mongoose.model('VirtualNumber', VirtualNumberSchema);

async function run() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(mongoUri);
        console.log('Connected.');

        const numbers = await VirtualNumber.find({}).sort({ createdAt: -1 }).limit(10);

        console.log(`Found ${numbers.length} recent numbers.`);
        numbers.forEach(n => {
            console.log(JSON.stringify({
                id: n._id,
                number: n.number,
                status: n.status,
                provider: n.provider,
                externalId: n.externalId,
                smsCode: n.smsCode
            }));
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
