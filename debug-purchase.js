
require('dotenv').config({ path: '.env' });
const https = require('https');

const API_KEY = (process.env.NCWALLET_API_KEY || '').trim();
const PIN = (process.env.NCWALLET_PIN || '').trim();

console.log(`Testing Purchase Endpoint...`);
console.log(`Headers -- Auth: ...${API_KEY.slice(-5)} | PIN: ${PIN}`);

// EXACT payload structure from src/lib/ncwallet.ts purchaseAirtime
const payload = {
    ref_id: `DEBUG-${Date.now()}`,
    network: 1, // MTN
    country_code: 'NG',
    phone_number: '08012345678',
    airtime_type: 'VTU',
    amount: "50", // Sending as string as typically expected, checking logic
    bypass: false
};

const body = JSON.stringify(payload);

const options = {
    hostname: 'ncwallet.africa',
    path: '/api/v1/airtime', // Testing the actual failure endpoint
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `nc_afr_apikey${API_KEY}`,
        'trnx_pin': PIN,
        'Content-Length': Buffer.byteLength(body)
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${data}`);
    });
});

req.on('error', (e) => console.error(e));
req.write(body);
req.end();
