const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
if (!process.env.SMSPOOL_API_KEY) require('dotenv').config({ path: '.env' });

const API_KEY = process.env.SMSPOOL_API_KEY;
const BASE_URL = 'https://api.smspool.net';
const TEST_ID = 'mf3XGICImwdnZLxU8OLx';

const ENDPOINTS = [
    '/esim/profile',
    '/esim/view',
    '/request/history',
    '/order/history',
    '/esim/history'
];

async function test(method) {
    console.log(`\n=== Testing ${method} ===`);
    for (const ep of ENDPOINTS) {
        const url = new URL(`${BASE_URL}${ep}`);
        url.searchParams.append('key', API_KEY);
        // Try params
        url.searchParams.append('orderid', TEST_ID);
        url.searchParams.append('transaction_id', TEST_ID);

        try {
            console.log(`Testing ${ep}...`);
            const res = await fetch(url.toString(), {
                method: method,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
                    'Accept': 'application/json'
                }
            });
            console.log(`Status: ${res.status}`);
            const text = await res.text();
            if (res.status === 200 && (text.startsWith('{') || text.startsWith('['))) {
                // Check if it's the 404 HTML page disguised as 200 (some APIs do this)
                if (text.includes('<html')) {
                    console.log('Fail (HTML)');
                    continue;
                }

                console.log(`\n!!! SUCCESS on ${method} ${ep} !!!`);
                fs.writeFileSync('winner_endpoint.txt', `Success: ${method} ${ep}\nResponse: ${text}`);
                console.log('Saved to winner_endpoint.txt');

                if (text.includes(TEST_ID) || text.includes('qr')) {
                    console.log('!!! MATCH !!!');
                }
            } else {
                console.log('Fail/HTML/404');
            }
        } catch (e) { console.log(e.message); }
        await new Promise(r => setTimeout(r, 500));
    }
}

async function run() {
    await test('GET');
    await test('POST');
}

run();
