
require('dotenv').config({ path: '.env' });
const API_KEY = process.env.NCWALLET_API_KEY;
const PIN = process.env.NCWALLET_PIN;
const https = require('https');

const body = JSON.stringify({
    transaction_pin: PIN
});

const options = {
    hostname: 'ncwallet.africa',
    path: '/api/v1/user',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': `nc_afr_apikey${API_KEY}`
    }
};

console.log("Checking NCWallet Balance (POST /user)...");

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
