// Native fetch in Node 18+
require('dotenv').config({ path: '.env.local' });
if (!process.env.SMSPOOL_API_KEY) require('dotenv').config({ path: '.env' });

const API_KEY = process.env.SMSPOOL_API_KEY;
const BASE_URL = 'https://api.smspool.net';
const TEST_ID = 'mf3XGICImwdnZLxU8OLx';

const ENDPOINTS = [
    '/esim/check',
    '/esim/status',
    '/esim/profile',
    '/esim/order'
];

async function testBody(endpoint) {
    const url = `${BASE_URL}${endpoint}`;
    // Body params
    const body = new URLSearchParams();
    body.append('key', API_KEY);
    body.append('orderid', TEST_ID); // Check uses form-urlencoded usually or JSON?
    // SMSPool usually accepts form-data/urlencoded.

    // Try URLSearchParams (application/x-www-form-urlencoded) first
    console.log(`Testing POST ${endpoint} (form-urlencoded)...`);
    try {
        const res = await fetch(url, {
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0'
            }
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        if (res.status === 200) console.log(text.substring(0, 300));
        if (text.includes('qr') || text.includes('code')) console.log('!!! SUCCESS !!!');
    } catch (e) { console.error(e); }

    // Try 'transaction_id' param
    const body2 = new URLSearchParams();
    body2.append('key', API_KEY);
    body2.append('transaction_id', TEST_ID);
    console.log(`Testing POST ${endpoint} (form-urlencoded, transaction_id)...`);
    try {
        const res = await fetch(url, {
            method: 'POST',
            body: body2,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0'
            }
        });
        const text = await res.text();
        console.log(`Status: ${res.status}`);
        if (res.status === 200) console.log(text.substring(0, 300));
        if (text.includes('qr') || text.includes('code')) console.log('!!! SUCCESS !!!');
    } catch (e) { console.error(e); }
}

async function run() {
    for (const ep of ENDPOINTS) {
        await testBody(ep);
    }
}

run();
