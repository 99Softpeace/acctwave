
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
    ref_id: "TEST-PIN-BODY-" + Date.now(),
    pin: PIN
});

const options = {
    hostname: 'ncwallet.africa',
    path: '/api/v1/airtime',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': `nc_afr_apikey${API_KEY}`
        // removing trnx_pin header
    }
};

console.log("Testing POST with 'pin' in body...");

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
