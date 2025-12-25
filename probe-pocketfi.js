
require('dotenv').config({ path: '.env' });
const https = require('https');
const fs = require('fs');

const API_KEY = process.env.NCWALLET_API_KEY;
const PIN = process.env.NCWALLET_PIN;

const variations = [
    { name: '1. Header trnx_pin | Auth NoSpace', headers: { 'Authorization': `nc_afr_apikey${API_KEY}`, 'trnx_pin': PIN } },
    { name: '2. Header trnx_pin | Auth Space', headers: { 'Authorization': `nc_afr_apikey ${API_KEY}`, 'trnx_pin': PIN } },
    { name: '3. Header trnx_pin | Auth Bearer', headers: { 'Authorization': `Bearer ${API_KEY}`, 'trnx_pin': PIN } },
    { name: '4. Body trnx_pin | Auth NoSpace', headers: { 'Authorization': `nc_afr_apikey${API_KEY}` }, bodyExtra: { trnx_pin: PIN } },
    { name: '5. Body pin | Auth NoSpace', headers: { 'Authorization': `nc_afr_apikey${API_KEY}` }, bodyExtra: { pin: PIN } },
    { name: '6. Header transaction_pin | Auth NoSpace', headers: { 'Authorization': `nc_afr_apikey${API_KEY}`, 'transaction_pin': PIN } }
];

const results = [];

function runTest(index) {
    if (index >= variations.length) {
        fs.writeFileSync('probe_result.txt', JSON.stringify(results, null, 2));
        console.log("Written Results to probe_result.txt");
        return;
    }
    const test = variations[index];

    console.log(`Running ${test.name}`);

    const bodyArgs = {
        network: 1,
        amount: "50",
        mobile_number: "08012345678",
        Ported_number: true,
        airtime_type: "VTU",
        ref_id: "PROBE2-" + index + "-" + Date.now(),
        ...(test.bodyExtra || {})
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
            let parsed = null;
            try { parsed = JSON.parse(data); } catch (e) { parsed = data; }

            results.push({
                name: test.name,
                status: res.statusCode,
                response: parsed
            });
            setTimeout(() => runTest(index + 1), 1000);
        });
    });

    req.write(body);
    req.end();
}

runTest(0);
