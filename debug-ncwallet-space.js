
require('dotenv').config({ path: '.env' });

const API_KEY = process.env.NCWALLET_API_KEY;
const PIN = process.env.NCWALLET_PIN;
const https = require('https');

const body = JSON.stringify({
    network: 1,
    amount: "10",
    mobile_number: "08012345678",
    Ported_number: true,
    airtime_type: "VTU",
    ref_id: "TEST-SPACE-" + Date.now()
});

const options = {
    hostname: 'ncwallet.africa',
    path: '/api/v1/airtime',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `nc_afr_apikey ${API_KEY}`, // Added SPACE here
        'trnx_pin': PIN
    }
};

console.log("Testing POST with SPACE in Auth header...");

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${data}`);
    });
});

req.write(body);
req.end();
