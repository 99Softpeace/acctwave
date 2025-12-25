
require('dotenv').config({ path: '.env' });
const https = require('https');

const API_KEY = (process.env.NCWALLET_API_KEY || '').trim();
const PIN = (process.env.NCWALLET_PIN || '').trim();

console.log(`Testing /user with PIN: ${PIN}`);

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

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        console.log(`HTTP Status: ${res.statusCode}`);
        console.log(`FULL BODY: ${data}`);
    });
});

req.on('error', e => console.error(e));
req.write('{}');
req.end();
