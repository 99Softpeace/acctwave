
require('dotenv').config({ path: '.env' });
const API_KEY = process.env.NCWALLET_API_KEY;
const PIN = process.env.NCWALLET_PIN;
const https = require('https');

function test(label, authHeader) {
    const options = {
        hostname: 'ncwallet.africa',
        path: '/api/v1/user',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
            'trnx_pin': PIN
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log(`[${label}] Status: ${res.statusCode}`);
            console.log(`Body: ${data}`);
        });
    });
    req.write('{}');
    req.end();
}

console.log("Testing Auth Header Formats...");
test("No Space", `nc_afr_apikey${API_KEY}`);
test("With Space", `nc_afr_apikey ${API_KEY}`);
