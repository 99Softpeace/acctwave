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

const VirtualNumberSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    externalId: String,
}, { timestamps: true });

const VirtualNumber = mongoose.model('VirtualNumber', VirtualNumberSchema);

async function run() {
    try {
        await mongoose.connect(mongoUri);
        const result = await VirtualNumber.deleteMany({
            $or: [
                { externalId: 'simulation_dummy_123' },
                { externalId: 'TV:simulation_dummy_123' }
            ]
        });
        console.log(`Deleted ${result.deletedCount} dummy numbers.`);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
