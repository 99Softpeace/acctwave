
require('dotenv').config({ path: '.env' });
const https = require('https');

// Clean credentials
const apiKey = (process.env.NCWALLET_API_KEY || '').trim();
const pin = "2171"; // Assuming fixed

function test(name, headers) {
    console.log(`\nTesting ${name}...`);
    const options = {
        hostname: 'ncwallet.africa',
        path: '/api/v1/user', // Using /user as it's safe-ish
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': 2,
            ...headers
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

    req.write('{}');
    req.end();
}

// Test 1: Key ONLY (Expect "Missing PIN" if Key is good)
test("Key Only", {
    'Authorization': `nc_afr_apikey${apiKey}`
});

// Test 2: Key + PIN (Expect Success or "Invalid PIN")
// We already know this returns "Invalid Auth or PIN" but running for completeness in this run
setTimeout(() => {
    test("Key + PIN", {
        'Authorization': `nc_afr_apikey${apiKey}`,
        'trnx_pin': pin
    });
}, 1500);
