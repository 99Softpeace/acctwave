
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
    user: mongoose.Schema.Types.ObjectId,
    number: String,
    service: String,
    provider: String,
    externalId: String,
    status: String,
    smsCode: String,
    fullSms: String,
    createdAt: Date
}, { strict: false });
const VirtualNumber = mongoose.model('VirtualNumber', VirtualNumberSchema);

async function run() {
    try {
        await mongoose.connect(mongoUri);

        // Find numbers from last 24 hours
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);

        const numbers = await VirtualNumber.find({
            createdAt: { $gt: dayAgo },
            $or: [{ provider: 'textverified' }, { provider: 'TV' }]
        }).sort({ createdAt: -1 });

        console.log(`\n--- RECENT TEXTVERIFIED CODES (Last 24h) ---`);
        if (numbers.length === 0) {
            console.log("No numbers found.");
        } else {
            numbers.forEach(num => {
                let codeDisplay = num.smsCode ? `[CODE: ${num.smsCode}]` : '(No Code Yet)';
                console.log(`Time: ${num.createdAt.toISOString().split('T')[1].split('.')[0]} | Number: ${num.number} | Status: ${num.status} | ${codeDisplay}`);
                if (num.fullSms && num.smsCode) {
                    console.log(`   > Msg: ${num.fullSms.substring(0, 100)}...`);
                }
            });
        }
        console.log('--------------------------------------------\n');

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
