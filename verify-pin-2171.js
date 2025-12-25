
require('dotenv').config({ path: '.env' });
const https = require('https');

const API_KEY = process.env.NCWALLET_API_KEY;
// HARDCODED CORRECT PIN
const PIN = "2171";

const options = {
    hostname: 'ncwallet.africa',
    path: '/api/v1/user',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `nc_afr_apikey${API_KEY}`,
        'trnx_pin': PIN
    }
};

console.log(`Testing POST /user with Hardcoded PIN: '${PIN}'`);

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${data}`);
    });
});

req.write(JSON.stringify({}));
req.end();
