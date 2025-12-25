
require('dotenv').config({ path: '.env' });
const https = require('https');

const API_KEY = (process.env.NCWALLET_API_KEY || '').trim();
const PIN = (process.env.NCWALLET_PIN || '').trim(); // Verified as 2171

const variations = [
    // Auth Header Variations
    { name: 'Auth: Bearer', headers: { 'Authorization': `Bearer ${API_KEY}`, 'trnx_pin': PIN }, bodyExtra: {} },
    { name: 'Auth: Token', headers: { 'Authorization': `Token ${API_KEY}`, 'trnx_pin': PIN }, bodyExtra: {} },

    // Body Parameter Variations (keeping original Auth for control, unless user thinks Auth is also wrong)
    // The user suggested checking the Body for 'transaction_pin'
    { name: 'Body: transaction_pin', headers: { 'Authorization': `nc_afr_apikey${API_KEY}` }, bodyExtra: { transaction_pin: PIN } },
    { name: 'Body: trnx_pin', headers: { 'Authorization': `nc_afr_apikey${API_KEY}` }, bodyExtra: { trnx_pin: PIN } },
    { name: 'Body: pin', headers: { 'Authorization': `nc_afr_apikey${API_KEY}` }, bodyExtra: { pin: PIN } },

    // Combined Suggestions (Bearer + Body PIN)
    { name: 'Auth Bearer + Body transaction_pin', headers: { 'Authorization': `Bearer ${API_KEY}` }, bodyExtra: { transaction_pin: PIN } },
];

function runTest(index) {
    if (index >= variations.length) return;
    const test = variations[index];

    console.log(`\nTEST: ${test.name}`);

    const bodyArgs = {
        network: 1,
        amount: "50",
        mobile_number: "08012345678",
        Ported_number: true,
        airtime_type: "VTU",
        ref_id: "SUGGEST-" + index + "-" + Date.now(),
        ...test.bodyExtra
    };

    const body = JSON.stringify(bodyArgs);
    const headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...test.headers
    };

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
            console.log(`STATUS: ${res.statusCode}`);
            try {
                const json = JSON.parse(data);
                if (json.status === 'success' || json.Status === 'successful') {
                    console.log("!!! SUCCESS !!!");
                }
                console.log(`MSG: ${json.message || json.error}`);
            } catch (e) {
                console.log(`RAW: ${data.substring(0, 50)}...`);
            }
            setTimeout(() => runTest(index + 1), 1000);
        });
    });

    req.write(body);
    req.end();
}

console.log(`Testing with Key: ${API_KEY.substring(0, 5)}...`);
runTest(0);
