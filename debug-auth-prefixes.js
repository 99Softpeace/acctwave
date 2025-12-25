
require('dotenv').config({ path: '.env' });
const https = require('https');

const API_KEY = (process.env.NCWALLET_API_KEY || '').trim();
const PIN = (process.env.NCWALLET_PIN || '').trim();

const prefixes = [
    `Bearer ${API_KEY}`,
    `Token ${API_KEY}`,
    `${API_KEY}`, // Raw key
    `nc_afr_apikey ${API_KEY}` // With space?
];

const payload = JSON.stringify({
    ref_id: `DEBUG-${Date.now()}`,
    network: 1,
    country_code: 'NG',
    phone_number: '08012345678',
    airtime_type: 'VTU',
    amount: "50",
    bypass: false
});

async function test(prefix) {
    return new Promise(resolve => {
        console.log(`Testing Prefix: "${prefix.substring(0, 10)}..."`);
        const req = https.request({
            hostname: 'ncwallet.africa',
            path: '/api/v1/airtime',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': prefix,
                'trnx_pin': PIN,
                'Content-Length': Buffer.byteLength(payload)
            }
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                const isError = data.includes("Invalid Authorization");
                console.log(`Status: ${res.statusCode} | invalidAuth: ${isError}`);
                resolve();
            });
        });
        req.on('error', e => console.error(e));
        req.write(payload);
        req.end();
    });
}

async function run() {
    for (const p of prefixes) {
        await test(p);
    }
}
run();
