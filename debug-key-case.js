
const https = require('https');

// The PIN we are reasonably sure about
const PIN = "1914";

// 1. The one you just gave me (Uppercase L)
const KEY_UPPER = "Live_ncsk_0c4e0f05e73f5c3169d848cc8ad2ea783444e97d";
// 2. The one usually standard (Lowercase l)
const KEY_LOWER = "live_ncsk_0c4e0f05e73f5c3169d848cc8ad2ea783444e97d";

// Support said RAW KEY (no prefix)
const HEADER_PREFIX = "";

async function testKey(caseName, key) {
    return new Promise(resolve => {
        console.log(`\n--- Testing ${caseName} ---`);
        console.log(`Key: ${key}`);

        const payload = JSON.stringify({
            ref_id: `DEBUG-${Date.now()}`,
            network: 1, // MTN
            country_code: 'NG',
            phone_number: '08012345678',
            airtime_type: 'VTU',
            amount: "50",
            bypass: false
        });

        const req = https.request({
            hostname: 'ncwallet.africa',
            path: '/api/v1/airtime',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': key, // Trying raw key as requested by support
                'trnx_pin': PIN,
                'Content-Length': Buffer.byteLength(payload)
            }
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Body: ${data}`);
                resolve();
            });
        });

        req.on('error', e => console.error(e));
        req.write(payload);
        req.end();
    });
}

async function run() {
    await testKey("UPPERCASE (Live_...)", KEY_UPPER);
    await testKey("LOWERCASE (live_...)", KEY_LOWER);
}

run();
