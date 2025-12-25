
require('dotenv').config({ path: '.env' });
const https = require('https');

const API_KEY = (process.env.NCWALLET_API_KEY || '').trim();
const PIN = (process.env.NCWALLET_PIN || '').trim();

console.log(`Testing PIN in Body...`);

const payloads = [
    { trnx_pin: PIN },
    { transaction_pin: PIN },
    { pin: PIN }
];

async function test(extraBody) {
    const payload = {
        ref_id: `DEBUG-${Date.now()}`,
        network: 1,
        country_code: 'NG',
        phone_number: '08012345678',
        airtime_type: 'VTU',
        amount: "50",
        bypass: false,
        ...extraBody
    };

    const body = JSON.stringify(payload);

    return new Promise(resolve => {
        console.log(`Testing Body Key: ${Object.keys(extraBody)[0]}`);
        const req = https.request({
            hostname: 'ncwallet.africa',
            path: '/api/v1/airtime',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `nc_afr_apikey${API_KEY}`,
                // No trnx_pin in header this time
                'Content-Length': Buffer.byteLength(body)
            }
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                const isError = data.includes("Invalid Authorization") || data.includes("Missing PIN");
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response Snippet: ${data.substring(0, 100)}`);
                resolve();
            });
        });
        req.on('error', e => console.error(e));
        req.write(body);
        req.end();
    });
}

async function run() {
    for (const p of payloads) {
        await test(p);
    }
}
run();
