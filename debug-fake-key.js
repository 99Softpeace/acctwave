
require('dotenv').config({ path: '.env' });
const https = require('https');

const REAL_PIN = (process.env.NCWALLET_PIN || '').trim();
const FAKE_KEY = "live_ncsk_FAKEKEY123456";

console.log(`Testing Purchase with FAKE KEY and REAL PIN...`);

const payload = JSON.stringify({
    ref_id: `DEBUG-${Date.now()}`,
    network: 1,
    country_code: 'NG',
    phone_number: '08012345678',
    airtime_type: 'VTU',
    amount: "50",
    bypass: false
});

const options = {
    hostname: 'ncwallet.africa',
    path: '/api/v1/airtime',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `nc_afr_apikey${FAKE_KEY}`,
        'trnx_pin': REAL_PIN,
        'Content-Length': Buffer.byteLength(payload)
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

req.on('error', e => console.error(e));
req.write(payload);
req.end();
