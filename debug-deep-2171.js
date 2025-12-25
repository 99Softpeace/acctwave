
require('dotenv').config({ path: '.env' });
const https = require('https');

const API_KEY = process.env.NCWALLET_API_KEY ? process.env.NCWALLET_API_KEY.trim() : '';
// Explicitly using the new PIN 
const PIN = "2171";

console.log(`Testing Multi-Auth with PIN: ${PIN}`);

function testAuth(label, headers, bodyObj) {
    const body = JSON.stringify(bodyObj);
    const options = {
        hostname: 'ncwallet.africa',
        path: '/api/v1/user',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
            ...headers
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log(`\n[${label}] Status: ${res.statusCode}`);
            console.log(`Response: ${data}`);
        });
    });

    req.on('error', (e) => console.log(`[${label}] Error: ${e.message}`));
    req.write(body);
    req.end();
}

// 1. Header: trnx_pin
testAuth('Header: trnx_pin', {
    'Authorization': `nc_afr_apikey${API_KEY}`,
    'trnx_pin': PIN
}, {});

// 2. Body: transaction_pin
testAuth('Body: transaction_pin', {
    'Authorization': `nc_afr_apikey${API_KEY}`
}, { transaction_pin: PIN });

// 3. Body: pin
testAuth('Body: pin', {
    'Authorization': `nc_afr_apikey${API_KEY}`
}, { pin: PIN });

// 4. Header: transaction_pin
testAuth('Header: transaction_pin', {
    'Authorization': `nc_afr_apikey${API_KEY}`,
    'transaction_pin': PIN
}, {});

// 5. Mixed: Header trnx_pin + Body transaction_pin
testAuth('Mixed: Header + Body', {
    'Authorization': `nc_afr_apikey${API_KEY}`,
    'trnx_pin': PIN
}, { transaction_pin: PIN });

// 6. Bearer Auth (just in case)
testAuth('Header: Bearer + trnx_pin', {
    'Authorization': `Bearer ${API_KEY}`,
    'trnx_pin': PIN
}, {});
