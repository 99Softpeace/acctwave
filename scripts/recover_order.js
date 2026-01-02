require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const TEXTVERIFIED_API_KEY = process.env.TEXTVERIFIED_API_KEY;
const TEXTVERIFIED_EMAIL = process.env.TEXTVERIFIED_EMAIL;

if (!MONGODB_URI || !TEXTVERIFIED_API_KEY || !TEXTVERIFIED_EMAIL) {
    console.error('Missing ENV variables');
    process.exit(1);
}

const VirtualNumberSchema = new mongoose.Schema({
    externalId: String,
    number: String,
    provider: String,
    status: String,
    smsCode: String,
    fullSms: String,
    user: mongoose.Schema.Types.ObjectId,
    price: Number
}, { strict: false });

const VirtualNumber = mongoose.models.VirtualNumber || mongoose.model('VirtualNumber', VirtualNumberSchema);

async function getBearerToken() {
    const response = await fetch('https://www.textverified.com/api/pub/v2/auth', {
        method: 'POST',
        headers: {
            'X-API-KEY': TEXTVERIFIED_API_KEY,
            'X-API-USERNAME': TEXTVERIFIED_EMAIL,
            'Content-Type': 'application/json'
        },
        cache: 'no-store'
    });
    const data = await response.json();
    return data.token || data.bearer_token;
}

async function checkTV(id) {
    const token = await getBearerToken();
    const response = await fetch(`https://www.textverified.com/api/pub/v2/verifications/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const raw = await response.json();
    console.log('--- TV RAW RESPONSE ---');
    console.log(JSON.stringify(raw, null, 2));
    console.log('-----------------------');

    // V2 Data Wrapper Logic (The Fix)
    return raw.Data || raw;
}

async function recover() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const orderId = '6956d92fa4ca694a52d0aca6';
        const tvId = 'lr_01KDXM0QDC5Z4R00RAGR4W1BBW'; // Extracted from externalId

        const number = await VirtualNumber.findById(orderId);
        if (!number) {
            console.error('Order not found in DB');
            return;
        }

        console.log(`Checking TextVerified for ID: ${tvId}`);
        const tvData = await checkTV(tvId);

        let code = tvData.code || tvData.smsCode;
        // Search in sms text if code field is empty
        if (!code && tvData.sms) {
            const match = tvData.sms.match(/\d{4,8}/);
            if (match) code = match[0];
        }

        if (code) {
            console.log(`✅ FOUND CODE: ${code}`);
            number.smsCode = code;
            number.fullSms = tvData.sms || `Code: ${code}`;
            number.status = 'completed';
            await number.save();
            console.log('Database updated with CODE and COMPLETED status.');
        } else {
            console.log('⚠️ No code found yet.');
            console.log(`Status at TV: ${tvData.status}`);

            // Forced update as requested by user?
            if (process.argv.includes('--force')) {
                console.log('Forcing status to COMPLETED (No Code) as requested...');
                number.status = 'completed';
                await number.save();
                console.log('Database updated to COMPLETED.');
            } else {
                console.log('Use --force to force complete without code.');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

recover();
