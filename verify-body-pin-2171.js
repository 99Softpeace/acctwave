
require('dotenv').config({ path: '.env' });
const API_KEY = process.env.NCWALLET_API_KEY;
const PIN = "2171"; // Confirmed PIN
const https = require('https');

const options = {
    hostname: 'ncwallet.africa',
    path: '/api/v1/user',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `nc_afr_apikey${API_KEY}`
        // NO trnx_pin header
    }
};

const body = JSON.stringify({
    transaction_pin: PIN
});

options.headers['Content-Length'] = Buffer.byteLength(body);

console.log(`Testing Body-PIN with PIN: '${PIN}'`);

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
