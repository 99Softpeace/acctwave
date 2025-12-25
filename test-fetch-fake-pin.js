
require('dotenv').config({ path: '.env' });
const https = require('https');

const API_KEY = (process.env.NCWALLET_API_KEY || '').trim();
const BAD_PIN = "0000"; // Intentionally wrong

console.log(`Testing Fetch Plans with Fake PIN: ${BAD_PIN}`);

const options = {
    hostname: 'ncwallet.africa',
    path: '/api/v1/service/id/data',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `nc_afr_apikey${API_KEY}`,
        'trnx_pin': BAD_PIN
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        // First 100 chars to see if it's success or error
        console.log(`Body Start: ${data.substring(0, 100)}...`);
    });
});

req.on('error', (e) => console.error(e));
req.end();
