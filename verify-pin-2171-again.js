
require('dotenv').config({ path: '.env' });
const API_KEY = process.env.NCWALLET_API_KEY;
// Explicitly using the new PIN provided by user to confirm it works
const PIN = "2171";
const https = require('https');

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

console.log(`Testing with PIN: '${PIN}' and API_KEY: ...${API_KEY.slice(-5)}`);

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
