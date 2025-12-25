
require('dotenv').config({ path: '.env' });

const API_KEY = process.env.NCWALLET_API_KEY;
const PIN = process.env.NCWALLET_PIN;

console.log("Loaded Keys:");
console.log("API_KEY Length:", API_KEY ? API_KEY.length : "Missing");
console.log("PIN:", PIN);
console.log("First 5 chars of Key:", API_KEY ? API_KEY.substring(0, 5) : "N/A");

const https = require('https');

// Test 1: GET (Plans) - Known to work if keys are right
function testGet() {
    console.log("\nTesting GET Request (Plans)...");
    const options = {
        hostname: 'ncwallet.africa',
        path: '/api/v1/service/id/data',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `nc_afr_apikey${API_KEY}`,
            'trnx_pin': PIN
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log("GET Status:", res.statusCode);
            if (res.statusCode !== 200) {
                console.log("GET Body:", data);
            } else {
                console.log("GET Success!");
            }
        });
    });
    req.end();
}

// Test 2: POST (Balance) - To check Transaction PIN specifically?
// Docs don't explicit show Balance endpoint clearly in my previous read, but I can guess or try Purchase with invalid data
function testPost() {
    console.log("\nTesting POST Request (Transaction validation)...");
    // Using a fake purchase to trigger Auth check
    const body = JSON.stringify({
        network: 1,
        amount: "10",
        mobile_number: "08012345678",
        Ported_number: true,
        airtime_type: "VTU",
        ref_id: "TEST-AUTH-" + Date.now()
    });

    const options = {
        hostname: 'ncwallet.africa',
        path: '/api/v1/airtime',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `nc_afr_apikey${API_KEY}`,
            'trnx_pin': PIN
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log("POST Status:", res.statusCode);
            console.log("POST Body:", data);
        });
    });
    req.write(body);
    req.end();
}

testGet();
setTimeout(testPost, 2000);
