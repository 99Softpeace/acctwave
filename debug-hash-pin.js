
require('dotenv').config({ path: '.env' });
const https = require('https');
const crypto = require('crypto');

const API_KEY = process.env.NCWALLET_API_KEY;
const RAW_PIN = "2171";

const variations = [
    { name: 'Plain', val: RAW_PIN },
    { name: 'MD5', val: crypto.createHash('md5').update(RAW_PIN).digest('hex') },
    { name: 'SHA1', val: crypto.createHash('sha1').update(RAW_PIN).digest('hex') },
    { name: 'SHA256', val: crypto.createHash('sha256').update(RAW_PIN).digest('hex') },
    { name: 'Base64', val: Buffer.from(RAW_PIN).toString('base64') }
];

function runTest(index) {
    if (index >= variations.length) return;
    const test = variations[index];

    console.log(`\n--- Testing PIN Format: ${test.name} (${test.val}) ---`);

    // Auth header is constant: nc_afr_apikeyKEY
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `nc_afr_apikey${API_KEY}`,
        'trnx_pin': test.val
    };

    const bodyArgs = {
        network: 1,
        amount: "50",
        mobile_number: "08012345678",
        Ported_number: true,
        airtime_type: "VTU",
        ref_id: "HASH-TEST-" + index + "-" + Date.now()
    };

    const body = JSON.stringify(bodyArgs);
    headers['Content-Length'] = Buffer.byteLength(body);

    const options = {
        hostname: 'ncwallet.africa',
        path: '/api/v1/airtime',
        method: 'POST',
        headers: headers
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            let json;
            try { json = JSON.parse(data); } catch (e) { json = { error: data }; }

            if (json.status === 'success' || json.Status === 'successful') {
                console.log("!!! SUCCESS !!!");
            } else {
                console.log(`Msg: ${json.message || json.error}`);
            }
            setTimeout(() => runTest(index + 1), 1000);
        });
    });

    req.write(body);
    req.end();
}

console.log("Starting Hash Test...");
runTest(0);
