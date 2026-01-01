
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
// [FIX] Removed TS import 
// Actually, since src/lib/textverified is TS, I can't require it directly in a JS script easily without ts-node.
// I'll rewrite a minimal fetcher here to be safe and fast.

// Load env
let mongoUri = '';
let tvApiKey = '';
let tvEmail = '';

try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');

    const matchMongo = envContent.match(/MONGODB_URI=(.*)/);
    if (matchMongo) mongoUri = matchMongo[1].trim();

    const matchKey = envContent.match(/TEXTVERIFIED_API_KEY=(.*)/);
    if (matchKey) tvApiKey = matchKey[1].trim();

    const matchEmail = envContent.match(/TEXTVERIFIED_EMAIL=(.*)/);
    if (matchEmail) tvEmail = matchEmail[1].trim();

} catch (e) {
    console.error('Failed to read .env', e);
    process.exit(1);
}

// Minimal Schemas
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

// Minimal TV Client
async function getAuthToken() {
    const resp = await fetch('https://www.textverified.com/api/pub/v2/auth', {
        method: 'POST',
        headers: {
            'X-API-KEY': tvApiKey,
            'X-API-USERNAME': tvEmail,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    const data = await resp.json();
    return data.token || data.bearer_token;
}

// Main Recovery Function
async function run() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(mongoUri);
        console.log('Connected.');

        // Find suspicious numbers: TV provider, no smsCode (or empty), and creation time is recent (last 24h)
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);

        const numbers = await VirtualNumber.find({
            $or: [{ provider: 'textverified' }, { provider: 'TV' }],
            smsCode: { $in: [null, '', undefined] },
            status: { $in: ['active', 'completed', 'pending'] },
            createdAt: { $gt: dayAgo }
        }).sort({ createdAt: -1 });

        console.log(`Found ${numbers.length} potential missing-code numbers.`);

        if (numbers.length === 0) {
            console.log("No numbers to recover.");
            process.exit(0);
        }

        console.log("Authenticating with TextVerified...");
        const token = await getAuthToken();

        for (const num of numbers) {
            console.log(`\nChecking ${num.number} (ID: ${num.externalId})...`);

            // Handle ID format (TV:ID vs ID)
            const realId = num.externalId.replace('TV:', '');

            const resp = await fetch(`https://www.textverified.com/api/pub/v2/verifications/${realId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!resp.ok) {
                console.log(`  > Failed to fetch: ${resp.status}`);
                continue;
            }

            const data = await resp.json();
            console.log(`  > Status: ${data.status}`);

            // Check for code
            let foundCode = data.code;
            if (!foundCode && typeof data.sms === 'string') {
                foundCode = data.sms.match(/\d{4,8}/)?.[0];
            }
            if (!foundCode && data.sms && data.sms.href) {
                console.log(`  > Link found, fetching...`);
                // Follow link
                const linkResp = await fetch(data.sms.href, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const linkData = await linkResp.json();
                foundCode = linkData.code || linkData.sms_code || (typeof linkData.sms === 'string' ? linkData.sms.match(/\d{4,8}/)?.[0] : null);
                if (foundCode) console.log(`  > FOUND CODE via Link: ${foundCode}`);
            }

            if (foundCode) {
                console.log(`  > RECOVERED CODE: ${foundCode}`);
                num.smsCode = foundCode;
                num.fullSms = typeof data.sms === 'string' ? data.sms : `Recovered Code: ${foundCode}`;
                num.status = 'completed'; // Force completion
                await num.save();
                console.log(`  > Database Updated.`);
            } else {
                console.log(`  > No code found yet.`);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
