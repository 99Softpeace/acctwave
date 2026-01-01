const http = require('http');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let mongoUri = '';
try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI=(.*)/);
    if (match) mongoUri = match[1].trim();
} catch (e) { console.error(e); process.exit(1); }

const VirtualNumberSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    externalId: String,
    status: String,
    number: String,
    smsCode: String,
    fullSms: String,
    provider: String,
    price: Number,
    service: String,
    serviceName: String,
    country: String,
    countryName: String,
    expiresAt: Date
}, { timestamps: true });
const VirtualNumber = mongoose.models.VirtualNumber || mongoose.model('VirtualNumber', VirtualNumberSchema);

const userId = new mongoose.Types.ObjectId();
const TEST_ID = 'webhook_test_123';

async function setup() {
    if (mongoose.connection.readyState === 0) await mongoose.connect(mongoUri);
    await VirtualNumber.deleteMany({ externalId: TEST_ID });
    // Create test number
    await VirtualNumber.create({
        user: userId,
        externalId: TEST_ID,
        status: 'active',
        number: '+15550009999',
        provider: 'textverified',
        price: 1.50,
        service: 'whatsapp',
        serviceName: 'WhatsApp',
        country: 'us',
        countryName: 'United States',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });
    console.log('Test number created.');
}

async function verify() {
    const num = await VirtualNumber.findOne({ externalId: TEST_ID });
    console.log(`Final Status: ${num?.status}`);
    console.log(`Final SmsCode: ${num?.smsCode}`);

    if (num && num.status === 'completed' && num.smsCode === '999888') {
        console.log('VERIFICATION SUCCESS!');
    } else {
        console.log('VERIFICATION FAILED!');
    }
    await mongoose.disconnect();
}

function sendWebhook() {
    return new Promise((resolve) => {
        const payload = JSON.stringify({
            id: TEST_ID,
            status: 'Completed',
            code: '999888',
            sms: 'Your code is 999888',
            cost: 1.50
        });
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/webhooks/textverified',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };
        const req = http.request(options, (res) => {
            console.log(`Response Status: ${res.statusCode}`);
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                console.log(`Response Body: ${data}`);
                resolve();
            });
        });
        req.on('error', e => { console.error(e); resolve(); });
        req.write(payload);
        req.end();
    });
}

async function run() {
    try {
        await setup();
        await sendWebhook();
        console.log('Waiting 5s...');
        setTimeout(verify, 5000);
    } catch (e) {
        console.error(e);
        await mongoose.disconnect();
    }
}
run();
