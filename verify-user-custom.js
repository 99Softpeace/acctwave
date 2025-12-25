
require('dotenv').config({ path: '.env' });
const https = require('https');

const API_KEY = (process.env.NCWALLET_API_KEY || '').trim();
const PIN = (process.env.NCWALLET_PIN || '').trim();

// 1. Standard Working Headers (Authentication + PIN)
const headersFull = {
    'Content-Type': 'application/json',
    'Authorization': `nc_afr_apikey${API_KEY}`,
    'trnx_pin': PIN
};

// 2. User Suggested Headers (No Auth, just PIN)
const headersUser = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'trnx_pin': PIN
};

function test(name, path, headers) {
    console.log(`\nTEST: ${name}`);
    console.log(`Path: ${path}`);

    const options = {
        hostname: 'ncwallet.africa',
        path: '/api/v1' + path,
        method: 'POST',
        headers: headers
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            console.log(`Body: ${data.substring(0, 150)}...`);
        });
    });

    req.on('error', e => console.log(`Error: ${e.message}`));
    req.write('{}');
    req.end();
}

// Run Variations
setTimeout(() => test('Standard /user', '/user', headersFull), 0);
setTimeout(() => test('User Snippet /userc (Full Headers)', '/userc', headersFull), 1000); // Check if endpoint exists
setTimeout(() => test('User Snippet /user (No Auth)', '/user', headersUser), 2000);   // Check if Auth is optional
