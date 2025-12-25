
require('dotenv').config({ path: '.env' });
const https = require('https');

const API_KEY = process.env.NCWALLET_API_KEY;
const PIN = process.env.NCWALLET_PIN;

const variations = [
    // 0. The original that failed (for reference)
    { name: 'ORIG: Auth="nc_afr_apikeyKEY", Header="trnx_pin"', headers: { 'Authorization': `nc_afr_apikey${API_KEY}`, 'trnx_pin': PIN } },

    // Auth Format Variations
    { name: 'Auth="Bearer KEY", Header="trnx_pin"', headers: { 'Authorization': `Bearer ${API_KEY}`, 'trnx_pin': PIN } },
    { name: 'Auth="APIKEY KEY", Header="trnx_pin"', headers: { 'Authorization': `APIKEY ${API_KEY}`, 'trnx_pin': PIN } },
    { name: 'Auth="nc_afr_apikey KEY" (Space), Header="trnx_pin"', headers: { 'Authorization': `nc_afr_apikey ${API_KEY}`, 'trnx_pin': PIN } },

    // PIN Header Name Variations (using original Auth format)
    { name: 'Header="trnx-pin"', headers: { 'Authorization': `nc_afr_apikey${API_KEY}`, 'trnx-pin': PIN } },
    { name: 'Header="transaction_pin"', headers: { 'Authorization': `nc_afr_apikey${API_KEY}`, 'transaction_pin': PIN } },
    { name: 'Header="pin"', headers: { 'Authorization': `nc_afr_apikey${API_KEY}`, 'pin': PIN } },
    { name: 'Header="xp-pin"', headers: { 'Authorization': `nc_afr_apikey${API_KEY}`, 'xp-pin': PIN } },

    // PIN in Body
    { name: 'Body="pin"', headers: { 'Authorization': `nc_afr_apikey${API_KEY}` }, bodyExtra: { pin: PIN } },
    { name: 'Body="transaction_pin"', headers: { 'Authorization': `nc_afr_apikey${API_KEY}` }, bodyExtra: { transaction_pin: PIN } },
    { name: 'Body="trnx_pin"', headers: { 'Authorization': `nc_afr_apikey${API_KEY}` }, bodyExtra: { trnx_pin: PIN } }
];

function runTest(index) {
    if (index >= variations.length) {
        console.log("--- ALL TESTS COMPLETED ---");
        return;
    }
    const test = variations[index];

    console.log(`\n--- Testing ${test.name} ---`);

    // Use a unique ref_id every time
    const bodyArgs = {
        network: 1,
        amount: "100", // Increased amount slightly to be realistic
        mobile_number: "08012345678",
        Ported_number: true,
        airtime_type: "VTU",
        ref_id: "TEST-VAR3-" + index + "-" + Date.now(),
        ...test.bodyExtra
    };

    const body = JSON.stringify(bodyArgs);

    const options = {
        hostname: 'ncwallet.africa',
        path: '/api/v1/airtime',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
            ...test.headers
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            let json = {};
            try {
                json = JSON.parse(data);
                // Check for success signals
                if (json.status === 'success' || json.Status === 'successful' || (json.message && json.message.toLowerCase().includes('success'))) {
                    console.log("!!! SUCCESS FOUND !!!");
                    console.log("Payload:", JSON.stringify(test, null, 2));
                    console.log("Response:", JSON.stringify(json, null, 2));
                } else {
                    console.log(`Msg: ${json.message || json.error}`);
                }
            } catch (e) {
                console.log(`Body (raw): ${data.substring(0, 150)}...`);
            }

            // Allow time for logs to flush and avoid aggressive rate limits
            setTimeout(() => runTest(index + 1), 1500);
        });
    });

    req.on('error', (e) => {
        console.error(`Request Error: ${e.message}`);
        setTimeout(() => runTest(index + 1), 1500);
    });

    req.write(body);
    req.end();
}

runTest(0);
