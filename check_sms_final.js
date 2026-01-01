
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let mongoUri = '';
try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI=(.*)/);
    if (match) mongoUri = match[1].trim();
} catch (e) { process.exit(1); }

const VirtualNumberSchema = new mongoose.Schema({
    number: String,
    smsCode: String,
    fullSms: String,
    provider: String,
    createdAt: Date
}, { strict: false });
const VirtualNumber = mongoose.model('VirtualNumber', VirtualNumberSchema);

async function run() {
    try {
        await mongoose.connect(mongoUri);
        const numbers = await VirtualNumber.find({
            $or: [{ provider: 'textverified' }, { provider: 'TV' }],
            smsCode: { $exists: true, $ne: null, $ne: '' }
        }).sort({ createdAt: -1 }).limit(10);

        console.log("--- LATEST MESSAGES ---");
        numbers.forEach(n => {
            console.log(`[${n.createdAt ? n.createdAt.toISOString() : 'Unknown Time'}] Number: ${n.number} | Code: ${n.smsCode}`);
        });
        console.log("-----------------------");
    } catch (e) { console.error(e); }
    finally { await mongoose.disconnect(); }
}
run();
