// Native fetch in Node 18+
require('dotenv').config({ path: '.env.local' });
if (!process.env.SMSPOOL_API_KEY) require('dotenv').config({ path: '.env' });

const API_KEY = process.env.SMSPOOL_API_KEY;
const BASE_URL = 'https://api.smspool.net';
const TEST_ID = 'mf3XGICImwdnZLxU8OLx'; // Known valid ID

const ENDPOINTS = [
    '/esim/check',
    '/esim/status',
    '/esim/order',
    '/order/check',
    '/check/esim',
    '/esim/retrieve',
    '/request/check' // Used for SMS?
];

const PARAMS = [
    'orderid',
    'order_id',
    'transaction_id',
    'id',
    'txid'
];

async function testCombination(endpoint, paramName) {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('key', API_KEY);
    url.searchParams.append(paramName, TEST_ID);

    try {
        console.log(`Testing ${endpoint}?${paramName}=${TEST_ID}...`);
        const res = await fetch(url.toString(), {
            method: 'POST', // Try POST first as purchase is POST
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        const text = await res.text();
        console.log(`Status: ${res.status}`);

        let isJson = false;
        try {
            JSON.parse(text);
            isJson = true;
        } catch (e) { }

        if (isJson) {
            console.log('RESPONSE (JSON):', text.substring(0, 200));
            // Check for success keys
            if (text.includes('qr') || text.includes('code') || text.includes('activation')) {
                console.log('!!! SUCCESS CANDIDATE !!!');
                return true;
            }
        } else {
            console.log('RESPONSE (Text/HTML):', text.substring(0, 100)); // Truncate
        }

    } catch (e) {
        console.log('Error:', e.message);
    }
    console.log('---');
    return false;
}

async function run() {
    for (const ep of ENDPOINTS) {
        for (const p of PARAMS) {
            if (await testCombination(ep, p)) {
                console.log(`\nFOUND IT! Endpoint: ${ep}, Param: ${p}`);
                // return; // Continue just in case
            }
            // Small delay
            await new Promise(r => setTimeout(r, 500));
        }
    }
}

run();
