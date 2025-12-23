const path = require('path');
const https = require('https');

// Load env
const envPath = path.join(process.cwd(), '.env');
const envConfig = require('dotenv').config({ path: envPath }).parsed || {};
// Fallback if dotenv doesn't pick up locally (though it should)
// NOTE: We need the Secret Key (starts with 10543...)
// Assuming POCKETFI_SECRET_KEY is correct in .env or I need to hardcode the prefix to check?
// I will rely on process.env first.

const SECRET_KEY = process.env.POCKETFI_SECRET_KEY || process.env.POCKETFI_API_KEY;

if (!SECRET_KEY) {
    console.error('No Secret Key found in .env');
    process.exit(1);
}

const REFERENCE = 'PFI|100004251223133518148301707449'; // The problematic reference
const ENCODED_REF = encodeURIComponent(REFERENCE);

console.log('Verifying Reference:', REFERENCE);
console.log('Encoded:', ENCODED_REF);
console.log('Using Key Prefix:', SECRET_KEY.substring(0, 5) + '...');

const options = {
    hostname: 'api.pocketfi.ng',
    path: `/transaction/verify/${ENCODED_REF}`,
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${SECRET_KEY}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log('Body:', data);
        try {
            const json = JSON.parse(data);
            console.log('Parsed Status:', json.status, json.data?.status);
        } catch (e) {
            console.log('Body is not JSON');
        }
    });
});

req.on('error', (e) => {
    console.error('Request Error:', e);
});

req.end();
